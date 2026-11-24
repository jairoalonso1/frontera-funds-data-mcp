"use client";

import { useState } from "react";

type Cycle = "1m" | "6m" | "12m";
type Scope = "funds_data" | "suite";

const CHECKOUT_ENDPOINT = "https://opendata.fronteraeficiente.com/api/billing/checkout";
const CONTACT_EMAIL = "powerportfoliomanagement@gmail.com";

const PALETTE = {
  opendata: {
    t1: "#16FBE8", t2: "#00F6A6",
    m1: "#09FCEB", m2: "#00A87C",
    b1: "#01888D", b2: "#01F8C4",
  },
  funds_data: {
    t1: "#158CFE", t2: "#005BFC",
    m1: "#38BDF8", m2: "#0058F9",
    b1: "#003BA8", b2: "#0178FC",
  },
  // Paquete combinado usa el emblema oficial de la Marca Paraguas Frontera Eficiente
  suite: {
    t1: "#29ADFD", t2: "#0269FC",
    m1: "#00E295", m2: "#05FACE",
    b1: "#0043C5", b2: "#017DFE",
  },
} as const;

function BrandMark({ variant = "funds_data", size = 28 }: { variant?: "opendata" | "funds_data" | "suite"; size?: number }) {
  const c = PALETTE[variant];
  const h = Math.round(size * 1.06);
  return (
    <svg width={size} height={h} viewBox="0 0 100 106" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={`feT-${variant}`} x1="0%" y1="0%" x2="100%" y2="20%">
          <stop offset="0%" stopColor={c.t1} />
          <stop offset="100%" stopColor={c.t2} />
        </linearGradient>
        <linearGradient id={`feM-${variant}`} x1="0%" y1="10%" x2="100%" y2="85%">
          <stop offset="0%" stopColor={c.m1} />
          <stop offset="100%" stopColor={c.m2} />
        </linearGradient>
        <linearGradient id={`feB-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.b1} />
          <stop offset="100%" stopColor={c.b2} />
        </linearGradient>
        <linearGradient id={`feS-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#020B1F" stopOpacity="0.58" />
          <stop offset="100%" stopColor="#020B1F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M27 66 H56 L42 96 C39 101 35 102 30 102 H13 L27 66 Z" fill={`url(#feB-${variant})`} />
      <path d="M27 66 H56 L51 77 H23 L27 66 Z" fill={`url(#feS-${variant})`} />
      <path d="M29 37 L42 12 C45 7 50 5 57 5 H96 L84 30 C81 35 77 37 71 37 H29 Z" fill={`url(#feT-${variant})`} />
      <path d="M24 41 H74 L63 63 C60 68 56 70 50 70 H35 C27 70 20 72 9 77 C5 79 3 76 5 72 L15 48 C17 43 20 41 24 41 Z" fill={`url(#feM-${variant})`} />
    </svg>
  );
}

const CYCLES: Array<{ id: Cycle; label: string; badge?: string }> = [
  { id: "1m", label: "Mensual" },
  { id: "6m", label: "6 meses", badge: "1 mes gratis" },
  { id: "12m", label: "1 año", badge: "4 meses gratis" },
];

const PLANS: Record<Scope, Array<{ code: "starter" | "pro" | "ultra" | "team"; name: string; quota: string; rate: string; prices: Record<Cycle, number>; featured?: boolean; note: string }>> = {
  funds_data: [
    { code: "starter", name: "Starter / Analista", quota: "5.000 exitosas / mes", rate: "60/min", prices: { "1m": 29000, "6m": 145000, "12m": 232000 }, note: "1 usuario · 12 herramientas de análisis de fondos." },
    { code: "pro", name: "Pro", quota: "15.000 exitosas / mes", rate: "90/min", prices: { "1m": 49000, "6m": 245000, "12m": 392000 }, featured: true, note: "El más elegido · autoservicio completo." },
    { code: "ultra", name: "Ultra", quota: "50.000 exitosas / mes", rate: "120/min", prices: { "1m": 99000, "6m": 495000, "12m": 792000 }, note: "Power User · 1–2 usuarios · soporte por correo." },
    { code: "team", name: "Mesa / Equipo", quota: "100.000 exitosas / mes", rate: "180/min", prices: { "1m": 179000, "6m": 895000, "12m": 1432000 }, note: "Hasta 5 puestos · fiduciarias y comités." },
  ],
  suite: [
    { code: "starter", name: "Combo Starter", quota: "5.000 / mes por MCP", rate: "60/min", prices: { "1m": 43000, "6m": 215000, "12m": 344000 }, note: "Frontera OpenData + Frontera Funds Data (-20%)." },
    { code: "pro", name: "Combo Pro", quota: "15.000 / mes por MCP", rate: "90/min", prices: { "1m": 69000, "6m": 345000, "12m": 552000 }, featured: true, note: "Frontera OpenData + Frontera Funds Data (-21%)." },
    { code: "ultra", name: "Combo Ultra", quota: "50.000 / mes por MCP", rate: "120/min", prices: { "1m": 142000, "6m": 710000, "12m": 1136000 }, note: "Frontera OpenData + Frontera Funds Data (-20%)." },
    { code: "team", name: "Combo Empresa / Mesa", quota: "100.000 / mes por MCP", rate: "180/min", prices: { "1m": 259000, "6m": 1295000, "12m": 2072000 }, note: "Hasta 5 puestos en ambos MCPs (-20%)." },
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
        body: JSON.stringify({ email: email.trim(), productScope: scope, planCode, cycle, returnOrigin: window.location.origin }),
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

      <section style={{ background: "linear-gradient(145deg, #020E24 0%, #06183D 65%, #0B1F3B 100%)", color: "#FFFFFF", borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <BrandMark variant={scope} size={32} />
          <div style={scope === "suite" ? { borderLeft: "1px solid rgba(255,255,255,0.28)", paddingLeft: 12 } : undefined}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}>
              {scope === "suite" ? (
                <>Frontera Eficiente · <span style={{ color: "#01E99F" }}>Paquete OpenData + Funds</span></>
              ) : (
                <>Frontera <span style={{ color: "#0084FF" }}>Funds</span></>
              )}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8" }}>
              {scope === "suite" ? "Inteligencia financiera en acción · Ahorro 20%" : "Análisis y gestión de FIC · Checkout COP"}
            </div>
          </div>
        </div>
        <h1 style={{ margin: "0 0 10px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, lineHeight: 1.25, fontWeight: 700 }}>
          Amplía tu cuota con pago único en COP
        </h1>
        <p style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.6, color: "#CBD5E1" }}>
          Sin suscripciones forzosas (Tarjeta, PSE o efectivo vía Mercado Pago). Tu plan Free incluye 1.500 consultas exitosas/mes y los errores de fuente nunca descuentan cuota.
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
          <button type="button" onClick={() => setScope("funds_data")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: scope === "funds_data" ? "#021230" : "transparent", color: scope === "funds_data" ? "#FFFFFF" : "#334155" }}>
            <BrandMark variant="funds_data" size={18} /> Solo Frontera Funds
          </button>
          <button type="button" onClick={() => setScope("suite")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: scope === "suite" ? "#021230" : "transparent", color: scope === "suite" ? "#FFFFFF" : "#334155" }}>
            <BrandMark variant="suite" size={18} /> OpenData + Funds (-20%)
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "#021230", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BrandMark variant={scope} size={18} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: plan.featured ? "#1D4ED8" : "#475569" }}>{plan.name}</span>
                </div>
                {plan.featured && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "#EFF6FF", color: "#1D4ED8" }}>DESTACADO</span>}
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "#0B1F3B", marginBottom: 4 }}>{fmtCop(plan.prices[cycle])}</div>
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
