export type RpcToolRequest = { id?: string | number | null; method?: string; params?: { name?: string } };
export function extractToolCalls(body: unknown): { calls: number; firstToolName: string | null; rpcId: string | number | null } {
  const requests = Array.isArray(body) ? body : [body];
  const toolRequests = requests.filter((item): item is RpcToolRequest => typeof item === "object" && item !== null && (item as RpcToolRequest).method === "tools/call");
  const firstToolName = typeof toolRequests[0]?.params?.name === "string" ? toolRequests[0].params.name : null;
  return { calls: toolRequests.length, firstToolName, rpcId: toolRequests[0]?.id ?? 1 };
}
