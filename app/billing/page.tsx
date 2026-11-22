import { BillingClient } from "./billing-client";

export const metadata = {
  title: "Planes y Cuotas · Frontera Funds Data MCP",
  description: "Planes de consumo mensual en COP para Frontera Funds Data MCP de Frontera Eficiente."
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC", color: "#0F172A", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "36px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect width="40" height="40" rx="10" fill="#0B1F3B" />
              <rect x="11" y="9" width="18" height="4.8" rx="1.5" fill="#1D63ED" />
              <rect x="11" y="17.2" width="13.5" height="4.8" rx="1.5" fill="#1D63ED" />
              <rect x="11" y="9" width="5" height="22" rx="1.5" fill="#FFFFFF" />
            </svg>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 17, color: "#0B1F3B" }}>Frontera Eficiente</div>
              <div style={{ fontSize: 13, color: "#475569" }}>Frontera Funds Data MCP · Submarca Cobalto</div>
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
