import { NextResponse } from "next/server";
import { pipeline } from "@supabase/middleware";
import { fromSupabaseUrl, withOAuthProtectedResource, withSupabase } from "@supabase/server";
import { extractToolCalls } from "@/lib/mcp-quota";
import { MCP_TOOLS, executeMcpTool } from "@/lib/mcp-tools";
import {
  DATASET_ID,
  SOCRATA_BASE_URL,
  SFC_COLUMN_DICTIONARY,
  resolveSocrataToken
} from "@/lib/socrata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://laankpkyvzeierrnktte.supabase.co";
const QUOTA_SOURCE_ID = "frontera_funds";

const SERVER_INFO = {
  name: "frontera-funds-data-mcp",
  version: "1.1.0"
};

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, MCP-Protocol-Version, x-socrata-app-token, X-App-Token, mcp-session-id, Mcp-Session-Id, Accept, Last-Event-ID",
  "Access-Control-Expose-Headers": "MCP-Protocol-Version, mcp-session-id, Mcp-Session-Id, WWW-Authenticate, Retry-After, X-MCP-Quota-Status"
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function extractUserSocrataToken(req: Request): string | null {
  const headerToken =
    req.headers.get("x-socrata-app-token") || req.headers.get("x-app-token");
  if (headerToken) return headerToken;

  const queryToken =
    new URL(req.url).searchParams.get("app_token") ||
    new URL(req.url).searchParams.get("socrata_token");
  if (queryToken) return queryToken;

  return null;
}

function extractIdentityFromVerifiedBearer(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as { sub?: string };
    return typeof payload.sub === "string" && payload.sub.length > 0 ? payload.sub : null;
  } catch { return null; }
}
function getNextMonthResetDateUTC(): string {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return nextMonth.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
async function enforceToolQuota(request: Request): Promise<Response | null> {
  if (request.method !== "POST") return null;
  let body: unknown;
  try { body = await request.clone().json(); } catch { return null; }
  const { calls, firstToolName, rpcId } = extractToolCalls(body);
  if (calls === 0) return null;
  if (calls > 100) return Response.json({ jsonrpc: "2.0", id: rpcId, error: { code: -32600, message: "El lote supera el máximo de 100 llamadas de herramientas." } }, { status: 400 });
  const authorization = request.headers.get("authorization");
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authorization?.startsWith("Bearer ") || !publishableKey || !serviceRoleKey) {
    console.error("MCP authentication or quota configuration is incomplete.");
    return Response.json({ error: "MCP authentication or quota service is unavailable." }, { status: 503 });
  }
  let userId = extractIdentityFromVerifiedBearer(authorization);
  if (!userId) {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: publishableKey, Authorization: authorization }, cache: "no-store" });
    if (!userResponse.ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const user = await userResponse.json() as { id?: string };
    userId = user.id ?? null;
  }
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const quotaResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_mcp_quota`, {
    method: "POST",
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user_id: userId, p_calls: calls, p_monthly_limit: 2000, p_per_minute_limit: 50, p_source_id: QUOTA_SOURCE_ID, p_tool_name: firstToolName }),
    cache: "no-store"
  });
  if (!quotaResponse.ok) { console.error("MCP quota check failed", quotaResponse.status); return Response.json({ error: "MCP quota service is temporarily unavailable." }, { status: 503 }); }
  const quota = await quotaResponse.json() as { allowed?: boolean; reason?: "monthly" | "per_minute"; retry_after?: number };
  if (quota.allowed) return null;
  const retryAfter = Math.max(1, Math.ceil(quota.retry_after ?? 60));
  const resetDate = getNextMonthResetDateUTC();
  const message = quota.reason === "monthly"
    ? `[FRONTERA FUNDS DATA MCP: CUOTA MENSUAL ALCANZADA]\nHas alcanzado la cuota mensual compartida de 2.000 llamadas de los servicios MCP de Frontera. El consumo se comparte entre los MCP vinculados a tu cuenta y se restablece el ${resetDate}. Si necesitas ampliar tu capacidad, contacta al equipo de Frontera.`
    : `[FRONTERA FUNDS DATA MCP: LÍMITE DE VELOCIDAD]\nHas superado el límite compartido de 50 llamadas por minuto de los servicios MCP de Frontera. Espera ${retryAfter} segundos y vuelve a intentarlo.`;
  return Response.json({ jsonrpc: "2.0", id: rpcId, result: { isError: true, content: [{ type: "text", text: message }] } }, { status: 200, headers: { "Retry-After": String(retryAfter), "X-MCP-Quota-Status": "exceeded" } });
}

async function handleJsonRpcMessage(
  msg: any,
  userSocrataToken: string | null
): Promise<any | null> {
  if (!msg || typeof msg !== "object") {
    return {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32600, message: "Invalid Request" }
    };
  }

  const { id, method, params } = msg;

  // Notificaciones JSON-RPC (ej. notifications/initialized) no llevan id y no devuelven payload
  if (id === undefined || id === null) {
    return null;
  }

  try {
    switch (method) {
      case "initialize": {
        const clientProtocol = params?.protocolVersion;
        const supportedVersions = ["2025-03-26", "2024-11-05", "2024-10-07"];
        const negotiatedVersion = supportedVersions.includes(clientProtocol)
          ? clientProtocol
          : "2024-11-05";

        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: negotiatedVersion,
            capabilities: {
              tools: { listChanged: false },
              resources: { subscribe: false, listChanged: false },
              prompts: { listChanged: false }
            },
            serverInfo: SERVER_INFO,
            instructions:
              "Servidor MCP oficial de Fondos de Inversión Colectiva (FIC) y Fondos de Capital Privado (FCP) de la Superintendencia Financiera de Colombia (datos.gov.co / qhpu-8ixx)."
          }
        };
      }

      case "ping": {
        return {
          jsonrpc: "2.0",
          id,
          result: {}
        };
      }

      case "tools/list": {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS
          }
        };
      }

      case "tools/call": {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};
        if (!toolName) {
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "Falta el parámetro 'name' en tools/call." }
          };
        }

        const output = await executeMcpTool(toolName, toolArgs, userSocrataToken);
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(output, null, 2)
              }
            ],
            isError: false
          }
        };
      }

      case "resources/list": {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            resources: [
              {
                uri: "sfc://qhpu-8ixx/diccionario",
                name: "Diccionario de Datos SFC FICs (qhpu-8ixx)",
                description:
                  "Especificación oficial de las 26 columnas del dataset de Rentabilidades de los Fondos de Inversión Colectiva (Superfinanciera / datos.gov.co).",
                mimeType: "application/json"
              }
            ]
          }
        };
      }

      case "resources/read": {
        const uri = params?.uri;
        if (uri === "sfc://qhpu-8ixx/diccionario") {
          return {
            jsonrpc: "2.0",
            id,
            result: {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify(
                    {
                      dataset_id: DATASET_ID,
                      endpoint: SOCRATA_BASE_URL,
                      columnas: SFC_COLUMN_DICTIONARY
                    },
                    null,
                    2
                  )
                }
              ]
            }
          };
        }
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: `Recurso no encontrado: ${uri}` }
        };
      }

      case "prompts/list": {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            prompts: [
              {
                name: "comite-fics",
                description:
                  "Genera un informe institucional de comité de inversiones sobre el mercado de FICs en Colombia, incluyendo Market Share fiduciario, Top fondos por rentabilidad, flujos netos de captación y radar de alertas de liquidez.",
                arguments: [
                  {
                    name: "entidad_foco",
                    description:
                      "Nombre de la Sociedad Fiduciaria o Comisionista a destacar (ej. Fiducoldex).",
                    required: false
                  }
                ]
              }
            ]
          }
        };
      }

      case "prompts/get": {
        const entidadFoco = params?.arguments?.entidad_foco || "Fiducoldex";
        return {
          jsonrpc: "2.0",
          id,
          result: {
            description: `Informe Ejecutivo Comité de Inversiones FICs - Foco: ${entidadFoco}`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Actúa como Portfolio Manager institucional en Colombia. Usa las herramientas del servidor MCP 'frontera-funds-data-mcp' en este orden:
1. Llama a 'obtener_estado_dataset' para verificar la última fecha de corte disponible en la SFC.
2. Llama a 'cuota_mercado_aum_entidades' para presentar el Top 15 de Sociedades Fiduciarias/Comisionistas por AUM y analiza la posición competitiva de ${entidadFoco}.
3. Llama a 'buscar_fondos_fic' con texto_busqueda='${entidadFoco}' para detallar todos los fondos y participaciones de ${entidadFoco}, su AUM, inversionistas y rentabilidades E.A.
4. Llama a 'ranking_rentabilidades_fics' para comparar contra los líderes del mercado y 'radar_corridas_y_alertas_liquidez' para reportar cualquier tensión de liquidez en la industria.`
                }
              }
            ]
          }
        };
      }

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Método JSON-RPC no soportado: ${method}`
          }
        };
    }
  } catch (err: any) {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: true,
                mensaje: err?.message || String(err)
              },
              null,
              2
            )
          }
        ],
        isError: true
      }
    };
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

async function handleGET(req: Request) {
  const requestUrl = new URL(req.url);
  const accept = req.headers.get("accept") || "";
  // Si un cliente MCP (SSE legado o Streamable HTTP) abre stream GET con text/event-stream:
  if (accept.includes("text/event-stream")) {
    const postUrl = `${requestUrl.origin}/api/mcp${requestUrl.search}`;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`event: endpoint\ndata: ${postUrl}\n\n`));
      }
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      }
    });
  }

  const userToken = extractUserSocrataToken(req);
  const tokenStatus = resolveSocrataToken(userToken);

  return NextResponse.json(
    {
      status: "online",
      protocol: "Model Context Protocol (MCP) - Streamable HTTP (JSON-RPC 2.0)",
      server: SERVER_INFO,
      dataset: {
        id: DATASET_ID,
        source: "Superintendencia Financiera de Colombia (SFC) - datos.gov.co",
        socrata_endpoint: SOCRATA_BASE_URL
      },
      socrata_token_mode: tokenStatus.source,
      tools_count: MCP_TOOLS.length,
      tools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
      usage: {
        mcp_endpoint: `${requestUrl.origin}/api/mcp`,
        byok_header_optional: "x-socrata-app-token: <TU_APP_TOKEN_DATOS_GOV_CO>"
      }
    },
    { status: 200, headers: CORS_HEADERS }
  );
}

async function handlePOST(req: Request) {
  const userToken = extractUserSocrataToken(req);
  const sessionId = req.headers.get("mcp-session-id") || "mcp-sfc-session";

  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      const responses = (
        await Promise.all(body.map((msg) => handleJsonRpcMessage(msg, userToken)))
      ).filter((r) => r !== null);

      if (responses.length === 0) {
        return new NextResponse(null, {
          status: 202,
          headers: { ...CORS_HEADERS, "Mcp-Session-Id": sessionId }
        });
      }
      return NextResponse.json(responses, {
        status: 200,
        headers: { ...CORS_HEADERS, "Mcp-Session-Id": sessionId }
      });
    }

    const response = await handleJsonRpcMessage(body, userToken);
    if (response === null) {
      return new NextResponse(null, {
        status: 202,
        headers: { ...CORS_HEADERS, "Mcp-Session-Id": sessionId }
      });
    }

    return NextResponse.json(response, {
      status: 200,
      headers: { ...CORS_HEADERS, "Mcp-Session-Id": sessionId }
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: `Parse error: ${err?.message || String(err)}`
        }
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}


const authenticatedHandler = pipeline(
  [
    withOAuthProtectedResource({
      resourceServer: (request) => new URL(request.url).origin + "/api/mcp",
      authorizationServer: fromSupabaseUrl(supabaseUrl)
    }),
    withSupabase({ auth: "user" })
  ],
  async (request) => {
    try {
      const quotaResponse = await enforceToolQuota(request);
      if (quotaResponse) return withCors(quotaResponse);
      if (request.method === "GET") return withCors(await handleGET(request));
      if (request.method === "POST") return withCors(await handlePOST(request));
      if (request.method === "DELETE") return withCors(new NextResponse(null, { status: 200, headers: CORS_HEADERS }));
      return withCors(new NextResponse("Method Not Allowed", { status: 405, headers: CORS_HEADERS }));
    } catch (error) {
      console.error("MCP request failed", error);
      return withCors(NextResponse.json({ error: "MCP request failed." }, { status: 500, headers: CORS_HEADERS }));
    }
  }
);
const handle = async (request: Request): Promise<Response> => withCors(await authenticatedHandler(request));
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
