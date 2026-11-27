import { NextResponse } from "next/server";
import { pipeline } from "@supabase/middleware";
import { fromSupabaseUrl, withOAuthProtectedResource, withSupabase } from "@supabase/server";
import { extractToolCalls } from "@/lib/mcp-quota";
import { MCP_TOOLS, executeMcpTool } from "@/lib/mcp-tools";
import { DATASET_ID, SOCRATA_BASE_URL, SFC_COLUMN_DICTIONARY, resolveSocrataToken } from "@/lib/socrata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://laankpkyvzeierrnktte.supabase.co";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const supabaseJwksUrl = new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
const LIFECYCLE_MAILER_URL = process.env.LIFECYCLE_MAILER_URL ?? "https://opendata.fronteraeficiente.com/api/internal/lifecycle-email";
const PRODUCT_KEY = "funds_data" as const;
const QUOTA_SOURCE_ID = "frontera_funds";
const DEFAULT_MONTHLY_LIMIT = 1500;
const DEFAULT_PER_MINUTE_LIMIT = 30;

const SERVER_INFO = { name: "frontera-funds-data-mcp", version: "1.2.1" };
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version, x-socrata-app-token, X-App-Token, mcp-session-id, Mcp-Session-Id, Accept, Last-Event-ID",
  "Access-Control-Expose-Headers": "MCP-Protocol-Version, mcp-session-id, Mcp-Session-Id, WWW-Authenticate, Retry-After, X-MCP-Quota-Status, X-MCP-Product-Key"
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function extractUserSocrataToken(req: Request): string | null {
  const headerToken = req.headers.get("x-socrata-app-token") || req.headers.get("x-app-token");
  if (headerToken) return headerToken;
  const queryToken = new URL(req.url).searchParams.get("app_token") || new URL(req.url).searchParams.get("socrata_token");
  return queryToken || null;
}

function extractIdentityFromVerifiedBearer(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  const parts = authorization.slice("Bearer ".length).trim().split(".");
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

type QuotaContext = { userId: string; calls: number; firstToolName: string | null; monthlyLimit: number; planCode: string };
type QuotaCheckOutcome = { blockedResponse: Response | null; quotaContext: QuotaContext | null };

async function triggerLifecycleEmail(params: { userId: string; eventType: "first_call" | "quota_80" | "quota_100"; monthlyUsed: number; monthlyLimit: number; planCode: string; resetDate?: string }): Promise<void> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return;
  try {
    await fetch(LIFECYCLE_MAILER_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, productKey: PRODUCT_KEY }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
  } catch (err) { console.error("Lifecycle email dispatch error", err); }
}

function inspectMcpPayloadOutcomes(status: number, bodyText: string, expectedCalls: number): { successCalls: number; errorCalls: number } {
  if (status >= 400) return { successCalls: 0, errorCalls: expectedCalls };
  const messages: Array<{ error?: unknown; result?: { isError?: boolean } }> = [];
  try {
    if (bodyText.trim().length > 0) {
      const parsed = JSON.parse(bodyText);
      if (Array.isArray(parsed)) messages.push(...parsed);
      else if (parsed && typeof parsed === "object") messages.push(parsed);
    }
  } catch { return { successCalls: expectedCalls, errorCalls: 0 }; }
  if (messages.length === 0) return { successCalls: expectedCalls, errorCalls: 0 };
  let errorCalls = 0;
  let successCalls = 0;
  for (const msg of messages) {
    if (Boolean(msg?.error) || msg?.result?.isError === true) errorCalls += 1;
    else successCalls += 1;
  }
  if (successCalls + errorCalls > expectedCalls) {
    const clampedErrors = Math.min(errorCalls, expectedCalls);
    return { successCalls: Math.max(0, expectedCalls - clampedErrors), errorCalls: clampedErrors };
  }
  return { successCalls, errorCalls };
}

async function recordMcpUsage(ctx: QuotaContext, calls: number, billable: boolean): Promise<{ monthly_used?: number } | null> {
  if (calls < 1) return null;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/record_mcp_usage`, {
      method: "POST",
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_user_id: ctx.userId, p_product_key: PRODUCT_KEY, p_calls: calls, p_billable: billable, p_source_id: QUOTA_SOURCE_ID, p_tool_name: ctx.firstToolName }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) { console.error("MCP usage record failed", res.status); return null; }
    return (await res.json()) as { monthly_used?: number };
  } catch (err) { console.error("MCP usage record error", err); return null; }
}

async function checkToolQuota(request: Request): Promise<QuotaCheckOutcome> {
  if (request.method !== "POST") return { blockedResponse: null, quotaContext: null };
  let body: unknown;
  try { body = await request.clone().json(); } catch { return { blockedResponse: null, quotaContext: null }; }
  const { calls, firstToolName, rpcId } = extractToolCalls(body);
  if (calls === 0) return { blockedResponse: null, quotaContext: null };
  if (calls > 100) {
    return { blockedResponse: Response.json({ jsonrpc: "2.0", id: rpcId, error: { code: -32600, message: "El lote supera el máximo de 100 llamadas de herramientas." } }, { status: 400 }), quotaContext: null };
  }
  const authorization = request.headers.get("authorization");
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authorization?.startsWith("Bearer ") || !serviceRoleKey) {
    return { blockedResponse: Response.json({ error: "MCP authentication or quota service is unavailable." }, { status: 503 }), quotaContext: null };
  }
  let userId = extractIdentityFromVerifiedBearer(authorization);
  if (!userId && publishableKey) {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: publishableKey, Authorization: authorization }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!userResponse.ok) return { blockedResponse: Response.json({ error: "Unauthorized" }, { status: 401 }), quotaContext: null };
    userId = ((await userResponse.json()) as { id?: string }).id ?? null;
  }
  if (!userId) return { blockedResponse: Response.json({ error: "Unauthorized" }, { status: 401 }), quotaContext: null };
  const quotaResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/check_mcp_quota`, {
    method: "POST",
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user_id: userId, p_product_key: PRODUCT_KEY, p_calls: calls, p_default_monthly_limit: DEFAULT_MONTHLY_LIMIT, p_default_per_minute_limit: DEFAULT_PER_MINUTE_LIMIT }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000)
  }).catch(() => null);
  if (!quotaResponse?.ok) {
    return { blockedResponse: Response.json({ error: "MCP quota service is temporarily unavailable." }, { status: 503 }), quotaContext: null };
  }
  const quota = await quotaResponse.json() as { allowed?: boolean; reason?: "monthly" | "per_minute"; http_status?: number; plan_code?: string; monthly_used?: number; monthly_limit?: number; minute_used?: number; per_minute_limit?: number; retry_after?: number };
  const monthlyLimit = quota.monthly_limit ?? DEFAULT_MONTHLY_LIMIT;
  const planCode = quota.plan_code ?? "free";
  if (quota.allowed) return { blockedResponse: null, quotaContext: { userId, calls, firstToolName, monthlyLimit, planCode } };
  const isMonthly = quota.reason === "monthly";
  const httpStatus = quota.http_status ?? (isMonthly ? 402 : 429);
  const retryAfter = Math.max(1, Math.ceil(quota.retry_after ?? 60));
  const perMinuteLimit = quota.per_minute_limit ?? DEFAULT_PER_MINUTE_LIMIT;
  const resetDate = getNextMonthResetDateUTC();
  const billingUrl = `${new URL(request.url).origin}/billing`;
  if (isMonthly) {
    await triggerLifecycleEmail({ userId, eventType: "quota_100", monthlyUsed: quota.monthly_used ?? monthlyLimit, monthlyLimit, planCode, resetDate });
  }
  const message = isMonthly
    ? `Alcanzaste el límite mensual de ${monthlyLimit.toLocaleString("es-CO")} consultas exitosas de Frontera Funds Data MCP (${planCode}). Tu cuota es independiente de otros productos y se restablece el ${resetDate}. Consulta los planes disponibles o escríbenos a powerportfoliomanagement@gmail.com o revisa ${billingUrl}.`
    : `Alcanzaste el límite de velocidad de ${perMinuteLimit} consultas por minuto de Frontera Funds Data MCP. Espera ${retryAfter} segundos y vuelve a intentarlo.`;
  return {
    blockedResponse: Response.json(
      { jsonrpc: "2.0", id: rpcId, error: { code: isMonthly ? -32002 : -32029, message, data: { status: "quota_exceeded", reason: quota.reason ?? "per_minute", http_status: httpStatus, product_key: PRODUCT_KEY, plan_code: planCode, monthly_used: quota.monthly_used ?? 0, monthly_limit: monthlyLimit, minute_used: quota.minute_used ?? 0, per_minute_limit: perMinuteLimit, retry_after_seconds: retryAfter, monthly_reset: resetDate, billing_url: billingUrl, contact: "powerportfoliomanagement@gmail.com" } } },
      { status: httpStatus, headers: { "Retry-After": String(retryAfter), "X-MCP-Quota-Status": "exceeded", "X-MCP-Product-Key": PRODUCT_KEY } }
    ),
    quotaContext: null
  };
}

async function handleJsonRpcMessage(msg: any, userSocrataToken: string | null): Promise<any | null> {
  if (!msg || typeof msg !== "object") return { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } };
  const { id, method, params } = msg;
  if (id === undefined || id === null) return null;
  try {
    switch (method) {
      case "initialize": {
        const clientProtocol = params?.protocolVersion;
        const supportedVersions = ["2025-03-26", "2024-11-05", "2024-10-07"];
        return {
          jsonrpc: "2.0", id,
          result: {
            protocolVersion: supportedVersions.includes(clientProtocol) ? clientProtocol : "2024-11-05",
            capabilities: { tools: { listChanged: false }, resources: { subscribe: false, listChanged: false }, prompts: { listChanged: false } },
            serverInfo: SERVER_INFO,
            instructions: "Servidor MCP oficial de Fondos de Inversión Colectiva (FIC) y Fondos de Capital Privado (FCP) de la Superintendencia Financiera de Colombia (datos.gov.co / qhpu-8ixx)."
          }
        };
      }
      case "ping": return { jsonrpc: "2.0", id, result: {} };
      case "tools/list": return { jsonrpc: "2.0", id, result: { tools: MCP_TOOLS } };
      case "tools/call": {
        const toolName = params?.name;
        if (!toolName) return { jsonrpc: "2.0", id, error: { code: -32602, message: "Falta el parámetro 'name' en tools/call." } };
        const output = await executeMcpTool(toolName, params?.arguments || {}, userSocrataToken);
        return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(output, null, 2) }], isError: false } };
      }
      case "resources/list":
        return { jsonrpc: "2.0", id, result: { resources: [{ uri: "sfc://qhpu-8ixx/diccionario", name: "Diccionario de Datos SFC FICs (qhpu-8ixx)", description: "Especificación oficial de las 26 columnas del dataset de Rentabilidades de los Fondos de Inversión Colectiva (Superfinanciera / datos.gov.co).", mimeType: "application/json" }] } };
      case "resources/read": {
        const uri = params?.uri;
        if (uri === "sfc://qhpu-8ixx/diccionario") {
          return { jsonrpc: "2.0", id, result: { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ dataset_id: DATASET_ID, endpoint: SOCRATA_BASE_URL, columnas: SFC_COLUMN_DICTIONARY }, null, 2) }] } };
        }
        return { jsonrpc: "2.0", id, error: { code: -32602, message: `Recurso no encontrado: ${uri}` } };
      }
      case "prompts/list":
        return { jsonrpc: "2.0", id, result: { prompts: [{ name: "comite-fics", description: "Genera un informe institucional de comité de inversiones sobre el mercado de FICs en Colombia, incluyendo Market Share fiduciario, Top fondos por rentabilidad, flujos netos de captación y radar de alertas de liquidez.", arguments: [{ name: "entidad_foco", description: "Nombre de la Sociedad Fiduciaria o Comisionista a destacar (ej. Fiducoldex).", required: false }] }] } };
      case "prompts/get": {
        const entidadFoco = params?.arguments?.entidad_foco || "Fiducoldex";
        return { jsonrpc: "2.0", id, result: { description: `Informe Ejecutivo Comité de Inversiones FICs - Foco: ${entidadFoco}`, messages: [{ role: "user", content: { type: "text", text: `Actúa como Portfolio Manager institucional en Colombia. Usa las herramientas del servidor MCP 'frontera-funds-data-mcp' en este orden:\n1. Llama a 'obtener_estado_dataset' para verificar la última fecha de corte disponible en la SFC.\n2. Llama a 'cuota_mercado_aum_entidades' para presentar el Top 15 de Sociedades Fiduciarias/Comisionistas por AUM y analiza la posición competitiva de ${entidadFoco}.\n3. Llama a 'buscar_fondos_fic' con texto_busqueda='${entidadFoco}' para detallar todos los fondos y participaciones de ${entidadFoco}, su AUM, inversionistas y rentabilidades E.A.\n4. Llama a 'ranking_rentabilidades_fics' para comparar contra los líderes del mercado y 'radar_corridas_y_alertas_liquidez' para reportar cualquier tensión de liquidez en la industria.` } }] } };
      }
      default: return { jsonrpc: "2.0", id, error: { code: -32601, message: `Método JSON-RPC no soportado: ${method}` } };
    }
  } catch (err: any) {
    return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify({ error: true, mensaje: err?.message || String(err) }, null, 2) }], isError: true } };
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS_HEADERS }); }

async function handleGET(req: Request) {
  const requestUrl = new URL(req.url);
  if ((req.headers.get("accept") || "").includes("text/event-stream")) {
    const postUrl = `${requestUrl.origin}/api/mcp${requestUrl.search}`;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({ start(controller) { controller.enqueue(encoder.encode(`event: endpoint\ndata: ${postUrl}\n\n`)); } });
    return new NextResponse(stream, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
  }
  const tokenStatus = resolveSocrataToken(extractUserSocrataToken(req));
  return NextResponse.json({ status: "online", protocol: "Model Context Protocol (MCP) - Streamable HTTP (JSON-RPC 2.0)", server: SERVER_INFO, dataset: { id: DATASET_ID, source: "Superintendencia Financiera de Colombia (SFC) - datos.gov.co", socrata_endpoint: SOCRATA_BASE_URL }, socrata_token_mode: tokenStatus.source, tools_count: MCP_TOOLS.length, tools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })), usage: { mcp_endpoint: `${requestUrl.origin}/api/mcp`, byok_header_optional: "x-socrata-app-token: <TU_APP_TOKEN_DATOS_GOV_CO>" } }, { status: 200, headers: CORS_HEADERS });
}

async function handlePOST(req: Request) {
  const userToken = extractUserSocrataToken(req);
  const sessionId = req.headers.get("mcp-session-id") || "mcp-sfc-session";
  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      const responses = (await Promise.all(body.map((msg) => handleJsonRpcMessage(msg, userToken)))).filter((r) => r !== null);
      if (responses.length === 0) return new NextResponse(null, { status: 202, headers: { ...CORS_HEADERS, "Mcp-Session-Id": sessionId } });
      return NextResponse.json(responses, { status: 200, headers: { ...CORS_HEADERS, "Mcp-Session-Id": sessionId } });
    }
    const response = await handleJsonRpcMessage(body, userToken);
    if (response === null) return new NextResponse(null, { status: 202, headers: { ...CORS_HEADERS, "Mcp-Session-Id": sessionId } });
    return NextResponse.json(response, { status: 200, headers: { ...CORS_HEADERS, "Mcp-Session-Id": sessionId } });
  } catch (err: any) {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: `Parse error: ${err?.message || String(err)}` } }, { status: 400, headers: CORS_HEADERS });
  }
}

const authenticatedHandler = pipeline(
  [
    withOAuthProtectedResource({ resourceServer: (request) => new URL(request.url).origin + "/api/mcp", authorizationServer: fromSupabaseUrl(supabaseUrl) }),
    withSupabase({ auth: "user", issuer: fromSupabaseUrl(supabaseUrl), env: { url: supabaseUrl, publishableKeys: { default: supabasePublishableKey }, jwks: supabaseJwksUrl } })
  ],
  async (request) => {
    let activeQuotaContext: QuotaContext | null = null;
    try {
      const { blockedResponse, quotaContext } = await checkToolQuota(request);
      if (blockedResponse) return withCors(blockedResponse);
      activeQuotaContext = quotaContext;
      if (request.method === "GET") return withCors(await handleGET(request));
      if (request.method === "POST") {
        const mcpResponse = await handlePOST(request);
        if (activeQuotaContext) {
          const clonedText = await mcpResponse.clone().text().catch(() => "");
          const { successCalls, errorCalls } = inspectMcpPayloadOutcomes(mcpResponse.status, clonedText, activeQuotaContext.calls);
          if (successCalls > 0) {
            const usage = await recordMcpUsage(activeQuotaContext, successCalls, true);
            const monthlyUsed = usage?.monthly_used ?? 0;
            const threshold80 = Math.ceil(activeQuotaContext.monthlyLimit * 0.8);
            if (monthlyUsed === 1) {
              await triggerLifecycleEmail({ userId: activeQuotaContext.userId, eventType: "first_call", monthlyUsed, monthlyLimit: activeQuotaContext.monthlyLimit, planCode: activeQuotaContext.planCode });
            } else if (monthlyUsed >= threshold80 && monthlyUsed < activeQuotaContext.monthlyLimit) {
              await triggerLifecycleEmail({ userId: activeQuotaContext.userId, eventType: "quota_80", monthlyUsed, monthlyLimit: activeQuotaContext.monthlyLimit, planCode: activeQuotaContext.planCode });
            }
          }
          if (errorCalls > 0) await recordMcpUsage(activeQuotaContext, errorCalls, false);
        }
        return withCors(mcpResponse);
      }
      if (request.method === "DELETE") return withCors(new NextResponse(null, { status: 200, headers: CORS_HEADERS }));
      return withCors(new NextResponse("Method Not Allowed", { status: 405, headers: CORS_HEADERS }));
    } catch (error) {
      console.error("MCP request failed", error);
      if (activeQuotaContext) await recordMcpUsage(activeQuotaContext, activeQuotaContext.calls, false);
      return withCors(NextResponse.json({ error: "MCP request failed." }, { status: 500, headers: CORS_HEADERS }));
    }
  }
);
const handle = async (request: Request): Promise<Response> => withCors(await authenticatedHandler(request));
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
