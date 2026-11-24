import { MCP_TOOLS } from "@/lib/mcp-tools";
import { FundsHubClient, type ToolSummary } from "./components/FundsHubClient";

export default function HomePage() {
  const tools: ToolSummary[] = MCP_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
  }));
  return <FundsHubClient tools={tools} />;
}
