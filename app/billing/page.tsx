import { BillingClient } from "./billing-client";

export const metadata = {
  title: "Planes y Cuotas · Frontera Funds Data MCP",
  description: "Planes de consumo mensual en COP para Frontera Funds Data MCP de Frontera Eficiente.",
};

function FundsMark({ size = 30 }: { size?: number }) {
  const h = Math.round(size * 1.06);
  return (
    <svg width={size} height={h} viewBox="0 0 100 106" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Logo Frontera Funds">
      <defs>
        <linearGradient id="fdHdrT" x1="0%" y1="0%" x2="100%" y2="20%">
          <stop offset="0%" stopColor="#158CFE" />
          <stop offset="100%" stopColor="#005BFC" />
        </linearGradient>
        <linearGradient id="fdHdrM" x1="0%" y1="10%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0058F9" />
        </linearGradient>
        <linearGradient id="fdHdrB" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#003BA8" />
          <stop offset="100%" stopColor="#0178FC" />
        </linearGradient>
        <linearGradient id="fdHdrS" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#020B1F" stopOpacity="0.58" />
          <stop offset="100%" stopColor="#020B1F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M27 66 H56 L42 96 C39 101 35 102 30 102 H13 L27 66 Z" fill="url(#fdHdrB)" />
      <path d="M27 66 H56 L51 77 H23 L27 66 Z" fill="url(#fdHdrS)" />
      <path d="M29 37 L42 12 C45 7 50 5 57 5 H96 L84 30 C81 35 77 37 71 37 H29 Z" fill="url(#fdHdrT)" />
      <path d="M24 41 H74 L63 63 C60 68 56 70 50 70 H35 C27 70 20 72 9 77 C5 79 3 76 5 72 L15 48 C17 43 20 41 24 41 Z" fill="url(#fdHdrM)" />
    </svg>
  );
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC", color: "#0F172A", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "36px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#021230", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FundsMark size={30} />
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 19, lineHeight: 1.08, color: "#0B1F3B" }}>
                Frontera <span style={{ color: "#1D63ED" }}>Funds</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B", marginTop: 2 }}>
                Análisis y gestión de FIC
              </div>
            </div>
          </div>
          <span style={{ padding: "6px 12px", borderRadius: 999, background: "#EFF6FF", color: "#1D4ED8", fontSize: 12, fontWeight: 600 }}>Cuota independiente · funds_data</span>
        </header>
        <BillingClient status={params?.status} />
        <footer style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
          Un producto de Frontera Eficiente. Tarifas en pesos colombianos (COP, tarifa plena sin IVA en etapa Persona Natural). Las cuotas se reinician el día 1 de cada mes (UTC). Soporte: powerportfoliomanagement@gmail.com.
        </footer>
      </div>
    </main>
  );
}
