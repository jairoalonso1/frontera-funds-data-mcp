export const metadata = {
  title: "Planes y Cuotas · Frontera Funds Data MCP",
  description: "Planes de consumo mensual para Frontera Funds Data MCP de Frontera Eficiente."
};

const CONTACT_EMAIL = "powerportfoliomanagement@gmail.com";

export default function BillingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC", color: "#0F172A", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#0B1F3B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: "#1D63ED" }}>F</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0B1F3B" }}>Frontera Eficiente</div>
              <div style={{ fontSize: 13, color: "#475569" }}>Frontera Funds Data MCP</div>
            </div>
          </div>
          <span style={{ padding: "6px 12px", borderRadius: 999, background: "#EFF6FF", color: "#1D4ED8", fontSize: 12, fontWeight: 600 }}>Cuota independiente · funds_data</span>
        </header>
        <section style={{ background: "#0B1F3B", color: "#FFFFFF", borderRadius: 16, padding: "24px 28px", marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#60A5FA", marginBottom: 8 }}>Pagos en línea próximamente por Wompi</div>
          <h1 style={{ margin: "0 0 10px", fontSize: 26, lineHeight: 1.25, fontWeight: 700 }}>Amplía tu cuota mensual de Frontera Funds Data MCP</h1>
          <p style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.6, color: "#CBD5E1" }}>Estamos habilitando el checkout automático con Wompi. Mientras tanto, si quieres activar un plan superior hoy mismo, escríbenos directo y te habilitamos tu cuota en minutos.</p>
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Ampliar plan — Frontera Funds Data MCP")}`} style={{ display: "inline-block", background: "#1D63ED", color: "#FFFFFF", padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Escribir a {CONTACT_EMAIL}</a>
        </section>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginBottom: 24 }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Free / Explorer</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0B1F3B", marginBottom: 14 }}>$0 COP</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>1.500 consultas exitosas / mes</div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>30 intentos / minuto</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#64748B" }}>Cuota independiente por producto. Los errores de red o de fuente nunca descuentan tu cupo mensual.</p>
          </div>
          <div style={{ background: "#FFFFFF", border: "2px solid #1D63ED", borderRadius: 14, padding: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8", marginBottom: 6 }}>Pro &amp; Institucional</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0B1F3B", marginBottom: 14 }}>Activación directa</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>Cuotas ampliadas según volumen</div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>Mayor límite por minuto</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#64748B" }}>Para portfolio managers, fiduciarias, comisionistas y comités de inversión.</p>
          </div>
        </section>
        <footer style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>Las cuotas se reinician el día 1 de cada mes (UTC). Cada producto de Frontera Eficiente mantiene su cuota mensual independiente.</footer>
      </div>
    </main>
  );
}
