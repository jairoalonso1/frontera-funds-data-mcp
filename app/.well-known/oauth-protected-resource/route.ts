import { GET as handleMetadata, OPTIONS } from "../../api/mcp/oauth-protected-resource/route";

export const runtime = "nodejs";

export function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  url.pathname = "/api/mcp/oauth-protected-resource";
  url.search = "";
  url.hash = "";
  return handleMetadata(
    new Request(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    }),
  );
}

export { OPTIONS };
