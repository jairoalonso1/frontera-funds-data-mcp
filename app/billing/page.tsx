import { BillingClient } from "./billing-client";

export const metadata = {
  title: "Planes y Cuotas · Frontera Funds Data MCP",
  description: "Planes de consumo mensual en COP para Frontera Funds Data MCP de Frontera Eficiente."
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC", color: "#0F172A", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "36px 20px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#0B1F3B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: "#1D63ED" }}>F</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0B1F3B" }}>Frontera Eficiente</div>
              <div style={{ fontSize: 13, color: "#475569" }}>Frontera Funds Data MCP</div>
            </div>
          </div>
          <span style={{ padding: "6px 12px", borderRadius: 999, background: "#EFF6FF", color: "#1D4ED8", fontSize: 12, fontWeight: 600 }}>Cuota independiente · funds_data</span>
        </header>
        <BillingClient status={params?.status} />
        <footer style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
          Tarifas en pesos colombianos (COP, tarifa plena sin IVA en etapa Persona Natural). Las cuotas se reinician el día 1 de cada mes (UTC). Soporte: powerportfoliomanagement@gmail.com.
        </footer>
      </div>
    </main>
  );
}
