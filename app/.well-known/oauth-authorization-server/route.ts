export const runtime = "nodejs";

const DISCOVERY_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: DISCOVERY_CORS_HEADERS });
}

export async function GET(): Promise<Response> {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "")
    .trim()
    .replace(/\/+$/, "");

  if (!supabaseUrl) {
    return new Response(
      JSON.stringify({
        error: "oauth_discovery_unconfigured",
        message: "Authorization server URL is not configured.",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...DISCOVERY_CORS_HEADERS,
        },
      },
    );
  }

  try {
    const upstream = await fetch(
      `${supabaseUrl}/auth/v1/.well-known/oauth-authorization-server`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({
          error: "oauth_discovery_upstream_error",
          status: upstream.status,
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...DISCOVERY_CORS_HEADERS,
          },
        },
      );
    }

    const body = await upstream.text();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        ...DISCOVERY_CORS_HEADERS,
      },
    });
  } catch {
    return new Response(
      JSON.stringify({
        error: "oauth_discovery_unreachable",
        message: "Unable to reach upstream authorization server metadata.",
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...DISCOVERY_CORS_HEADERS,
        },
      },
    );
  }
}
