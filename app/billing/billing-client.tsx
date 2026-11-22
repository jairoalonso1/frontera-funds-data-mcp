"use client";

import { useState } from "react";

type Cycle = "1m" | "6m" | "12m";
type Scope = "funds_data" | "suite";

const CHECKOUT_ENDPOINT = "https://opendata.fronteraeficiente.com/api/billing/checkout";
const CONTACT_EMAIL = "powerportfoliomanagement@gmail.com";

const CYCLES: Array<{ id: Cycle; label: string; badge?: string }> = [
  { id: "1m", label: "Mensual" },
  { id: "6m", label: "6 meses", badge: "1 mes gratis" },
  { id: "12m", label: "1 año", badge: "4 meses gratis" },
];

const PLANS: Record<Scope, Array<{ code: "starter" | "pro" | "ultra" | "team"; name: string; quota: string; rate: string; prices: Record<Cycle, number>; featured?: boolean; note: string }>> = {
  funds_data: [
    { code: "starter", name: "Starter / Analista", quota: "5.000 exitosas / mes", rate: "60/min", prices: { "1m": 45000, "6m": 225000, "12m": 360000 }, note: "1 usuario · 12 herramientas SFC (qhpu-8ixx)." },
    { code: "pro", name: "Pro", quota: "15.000 exitosas / mes", rate: "90/min", prices: { "1m": 79000, "6m": 395000, "12m": 632000 }, featured: true, note: "El más elegido · autoservicio completo." },
    { code: "ultra", name: "Ultra", quota: "50.000 exitosas / mes", rate: "120/min", prices: { "1m": 149000, "6m": 745000, "12m": 1192000 }, note: "Power User · 1–2 usuarios · soporte por correo." },
    { code: "team", name: "Mesa / Equipo", quota: "100.000 exitosas / mes", rate: "180/min", prices: { "1m": 249000, "6m": 1245000, "12m": 1992000 }, note: "Hasta 5 puestos · fiduciarias y comités." },
  ],
  suite: [
    { code: "starter", name: "Suite Starter", quota: "5.000 / mes por MCP", rate: "60/min", prices: { "1m": 64000, "6m": 320000, "12m": 512000 }, note: "OpenData + Funds Data MCP (-20% vs. separado)." },
    { code: "pro", name: "Suite Pro", quota: "15.000 / mes por MCP", rate: "90/min", prices: { "1m": 109000, "6m": 545000, "12m": 872000 }, featured: true, note: "OpenData + Funds Data MCP (-21% vs. separado)." },
    { code: "ultra", name: "Suite Ultra", quota: "50.000 / mes por MCP", rate: "120/min", prices: { "1m": 215000, "6m": 1075000, "12m": 1720000 }, note: "OpenData + Funds Data MCP (-20% vs. separado)." },
    { code: "team", name: "Suite Empresa / Mesa", quota: "100.000 / mes por MCP", rate: "180/min", prices: { "1m": 359000, "6m": 1795000, "12m": 2872000 }, note: "Hasta 5 puestos en ambos MCPs (-20%)." },
  ],
};

function fmtCop(v: number) {
  return `$${v.toLocaleString("es-CO")} COP`;
}

export function BillingClient({ status }: { status?: string }) {
  const [scope, setScope] = useState<Scope>("funds_data");
  const [cycle, setCycle] = useState<Cycle>("6m");
  const [email, setEmail] = useState("");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(planCode: string) {
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("Escribe primero el correo con el que conectas tu cuenta MCP.");
      return;
    }
    setLoadingPlan(planCode);
    try {
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          productScope: scope,
          planCode,
          cycle,
          returnOrigin: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || "No fue posible iniciar el pago.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Error de red al conectar con Mercado Pago. Intenta de nuevo.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div>
      {status === "approved" && (
        <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: 12, background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", fontSize: 14, fontWeight: 600 }}>
          Pago aprobado. Tu cuota mensual se actualizará automáticamente en segundos.
        </div>
      )}
      {status === "pending" && (
        <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: 12, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E", fontSize: 14, fontWeight: 600 }}>
          Pago pendiente de confirmación. Apenas Mercado Pago lo apruebe, activaremos tu cuota automáticamente.
        </div>
      )}
      {status === "failure" && (
        <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: 12, background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", fontSize: 14, fontWeight: 600 }}>
          El pago no se completó. Puedes intentarlo nuevamente o escribirnos a {CONTACT_EMAIL}.
        </div>
      )}

      <section style={{ background: "#0B1F3B", color: "#FFFFFF", borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#60A5FA", marginBottom: 8 }}>Checkout seguro · Mercado Pago (COP)</div>
        <h1 style={{ margin: "0 0 10px", fontSize: 26, lineHeight: 1.25, fontWeight: 700 }}>Amplía tu cuota de Frontera Funds Data MCP</h1>
        <p style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.6, color: "#CBD5E1" }}>
          Pago único sin suscripciones forzosas (Tarjeta, PSE o efectivo). Tu plan Free incluye 1.500 consultas exitosas/mes y los errores de fuente nunca descuentan cuota.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo de cuenta MCP (ej. nombre@empresa.com)"
            style={{ flex: "1 1 280px", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.22)", background: "#132B4F", color: "#FFFFFF", fontSize: 14 }}
          />
        </div>
        {error && <div style={{ marginTop: 10, fontSize: 13, color: "#FCA5A5" }}>{error}</div>}
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "inline-flex", background: "#E2E8F0", padding: 4, borderRadius: 10, gap: 4 }}>
          <button type="button" onClick={() => setScope("funds_data")} style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: scope === "funds_data" ? "#0B1F3B" : "transparent", color: scope === "funds_data" ? "#FFFFFF" : "#334155" }}>
            Solo Funds Data MCP
          </button>
          <button type="button" onClick={() => setScope("suite")} style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: scope === "suite" ? "#0B1F3B" : "transparent", color: scope === "suite" ? "#FFFFFF" : "#334155" }}>
            Data Suite Modular (-20%)
          </button>
        </div>

        <div style={{ display: "inline-flex", background: "#E2E8F0", padding: 4, borderRadius: 10, gap: 4 }}>
          {CYCLES.map((c) => (
            <button key={c.id} type="button" onClick={() => setCycle(c.id)} style={{ padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: cycle === c.id ? "#1D63ED" : "transparent", color: cycle === c.id ? "#FFFFFF" : "#334155" }}>
              {c.label}{c.badge ? ` · ${c.badge}` : ""}
            </button>
          ))}
        </div>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 24 }}>
        {PLANS[scope].map((plan) => (
          <div key={plan.code} style={{ background: "#FFFFFF", border: plan.featured ? "2px solid #1D63ED" : "1px solid #E2E8F0", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: plan.featured ? "#1D4ED8" : "#475569", marginBottom: 6 }}>{plan.name}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0B1F3B", marginBottom: 4 }}>{fmtCop(plan.prices[cycle])}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>{cycle === "1m" ? "Pago mensual" : `Pago único por ${cycle === "6m" ? "6 meses" : "1 año"}`}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>{plan.quota}</div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>Límite velocidad: {plan.rate}</div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#64748B" }}>{plan.note}</p>
            </div>
            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => startCheckout(plan.code)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "none", cursor: loadingPlan ? "wait" : "pointer", background: plan.featured ? "#1D63ED" : "#0B1F3B", color: "#FFFFFF", fontWeight: 600, fontSize: 13 }}
            >
              {loadingPlan === plan.code ? "Abriendo Mercado Pago..." : "Pagar con Mercado Pago"}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
