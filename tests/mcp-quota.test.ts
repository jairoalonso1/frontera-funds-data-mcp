import test from "node:test";
import assert from "node:assert/strict";
import { extractToolCalls } from "../lib/mcp-quota.ts";
const call = (id: number, name: string) => ({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: {} } });
test("counts a single tool call", () => assert.deepEqual(extractToolCalls(call(7, "buscar_fondos_fic")), { calls: 1, firstToolName: "buscar_fondos_fic", rpcId: 7 }));
test("counts only tool calls in a JSON-RPC batch", () => { const r = extractToolCalls([{ jsonrpc: "2.0", id: 1, method: "initialize" }, call(2, "serie_historica_nav_y_tasas"), { jsonrpc: "2.0", method: "notifications/initialized" }, call(3, "metricas_riesgo_cuantitativo")]); assert.equal(r.calls, 2); assert.equal(r.firstToolName, "serie_historica_nav_y_tasas"); assert.equal(r.rpcId, 2); });
test("does not charge discovery, ping or notifications", () => assert.equal(extractToolCalls([{ jsonrpc: "2.0", id: 1, method: "tools/list" }, { jsonrpc: "2.0", id: 2, method: "ping" }, { jsonrpc: "2.0", method: "notifications/initialized" }]).calls, 0));
test("uses a safe fallback RPC id for empty batches", () => assert.deepEqual(extractToolCalls([]), { calls: 0, firstToolName: null, rpcId: 1 }));
