import { BillingClient } from "./billing-client";

export const metadata = {
  title: "Planes y Cuotas · Frontera Funds Data MCP",
  description: "Planes de consumo mensual en COP para Frontera Funds Data MCP de Frontera Eficiente.",
};

function FundsLogo({ size = 28 }: { size?: number }) {
  const h = Math.round(size * 1.08);
  return (
    <svg width={size} height={h} viewBox="0 0 100 108" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Logo Frontera Funds">
      <defs>
        <linearGradient id="feHdrFdTop" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D63ED" />
        </linearGradient>
        <linearGradient id="feHdrFdMid" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="feHdrFdBot" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#1D63ED" />
        </linearGradient>
      </defs>
      <path d="M36 10 H92 C95 10 96 13 94 16 L84 34 C82 37 79 38 76 38 H22 L31 16 C32 12 34 10 36 10 Z" fill="url(#feHdrFdTop)" />
      <path d="M22 45 H72 C75 45 76 48 74 51 L65 68 C63 71 60 72 57 72 H10 L17 51 C18 47 20 45 22 45 Z" fill="url(#feHdrFdMid)" />
      <path d="M18 79 H44 L34 99 C32 102 29 103 26 103 H10 C7 103 6 100 8 97 L18 79 Z" fill="url(#feHdrFdBot)" />
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
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "#0B1F3B", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FundsLogo size={28} />
            </div>
            <div style={{ borderLeft: "1px solid #CBD5E1", paddingLeft: 14 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, lineHeight: 1.1, color: "#0B1F3B" }}>
                Frontera <span style={{ color: "#1D63ED" }}>Funds</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B", marginTop: 2 }}>
                Análisis y gestión de FIC · Data MCP
              </div>
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
