"use client";

import { useState } from "react";

type Cycle = "1m" | "6m" | "12m";
type Scope = "funds_data" | "suite";

const CHECKOUT_ENDPOINT = "https://opendata.fronteraeficiente.com/api/billing/checkout";
const CONTACT_EMAIL = "powerportfoliomanagement@gmail.com";

const PALETTE = {
  opendata: {
    top1: "#34D399", top2: "#0FA968",
    mid1: "#6EE7B7", mid2: "#10B981",
    bot1: "#0FA968", bot2: "#047857",
  },
  funds_data: {
    top1: "#3B82F6", top2: "#1D63ED",
    mid1: "#60A5FA", mid2: "#2563EB",
    bot1: "#1D63ED", bot2: "#1E3A8A",
  },
  suite: {
    top1: "#2563EB", top2: "#1D63ED",
    mid1: "#34D399", mid2: "#0FA968",
    bot1: "#1D63ED", bot2: "#0B40B8",
  },
} as const;

function BrandMark({ variant = "funds_data", size = 28 }: { variant?: "opendata" | "funds_data" | "suite"; size?: number }) {
  const c = PALETTE[variant];
  const h = Math.round(size * 1.08);
  return (
    <svg width={size} height={h} viewBox="0 0 100 108" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={`feTop-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={c.top1} />
          <stop offset="100%" stopColor={c.top2} />
        </linearGradient>
        <linearGradient id={`feMid-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={c.mid1} />
          <stop offset="100%" stopColor={c.mid2} />
        </linearGradient>
        <linearGradient id={`feBot-${variant}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={c.bot2} />
          <stop offset="100%" stopColor={c.bot1} />
        </linearGradient>
      </defs>
      <path d="M36 10 H92 C95 10 96 13 94 16 L84 34 C82 37 79 38 76 38 H22 L31 16 C32 12 34 10 36 10 Z" fill={`url(#feTop-${variant})`} />
      <path d="M22 45 H72 C75 45 76 48 74 51 L65 68 C63 71 60 72 57 72 H10 L17 51 C18 47 20 45 22 45 Z" fill={`url(#feMid-${variant})`} />
      <path d="M18 79 H44 L34 99 C32 102 29 103 26 103 H10 C7 103 6 100 8 97 L18 79 Z" fill={`url(#feBot-${variant})`} />
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
    { code: "starter", name: "Starter / Analista", quota: "5.000 exitosas / mes", rate: "60/min", prices: { "1m": 29000, "6m": 145000, "12m": 232000 }, note: "1 usuario · 12 herramientas SFC (qhpu-8ixx)." },
    { code: "pro", name: "Pro", quota: "15.000 exitosas / mes", rate: "90/min", prices: { "1m": 49000, "6m": 245000, "12m": 392000 }, featured: true, note: "El más elegido · autoservicio completo." },
    { code: "ultra", name: "Ultra", quota: "50.000 exitosas / mes", rate: "120/min", prices: { "1m": 99000, "6m": 495000, "12m": 792000 }, note: "Power User · 1–2 usuarios · soporte por correo." },
    { code: "team", name: "Mesa / Equipo", quota: "100.000 exitosas / mes", rate: "180/min", prices: { "1m": 179000, "6m": 895000, "12m": 1432000 }, note: "Hasta 5 puestos · fiduciarias y comités." },
  ],
  suite: [
    { code: "starter", name: "Suite Starter", quota: "5.000 / mes por MCP", rate: "60/min", prices: { "1m": 43000, "6m": 215000, "12m": 344000 }, note: "OpenData + Funds Data MCP (-20% vs. separado)." },
    { code: "pro", name: "Suite Pro", quota: "15.000 / mes por MCP", rate: "90/min", prices: { "1m": 69000, "6m": 345000, "12m": 552000 }, featured: true, note: "OpenData + Funds Data MCP (-21% vs. separado)." },
    { code: "ultra", name: "Suite Ultra", quota: "50.000 / mes por MCP", rate: "120/min", prices: { "1m": 142000, "6m": 710000, "12m": 1136000 }, note: "OpenData + Funds Data MCP (-20% vs. separado)." },
    { code: "team", name: "Suite Empresa / Mesa", quota: "100.000 / mes por MCP", rate: "180/min", prices: { "1m": 259000, "6m": 1295000, "12m": 2072000 }, note: "Hasta 5 puestos en ambos MCPs (-20%)." },
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

      <section style={{ background: "linear-gradient(145deg, #071428 0%, #0B1F3B 65%, #102B52 100%)", color: "#FFFFFF", borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <BrandMark variant={scope} size={30} />
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.22)", paddingLeft: 12 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 800, color: "#FFFFFF" }}>
              {scope === "suite" ? (
                <>Frontera <span style={{ color: "#34D399" }}>Data Suite</span> Modular</>
              ) : (
                <>Frontera <span style={{ color: "#60A5FA" }}>Funds</span> Data MCP</>
              )}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8" }}>
              {scope === "suite" ? "OpenData + Funds Data · Checkout COP" : "Análisis y gestión de FIC · Checkout COP"}
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
          <button type="button" onClick={() => setScope("funds_data")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: scope === "funds_data" ? "#0B1F3B" : "transparent", color: scope === "funds_data" ? "#FFFFFF" : "#334155" }}>
            <BrandMark variant="funds_data" size={18} /> Solo Funds Data MCP
          </button>
          <button type="button" onClick={() => setScope("suite")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: scope === "suite" ? "#0B1F3B" : "transparent", color: scope === "suite" ? "#FFFFFF" : "#334155" }}>
            <BrandMark variant="suite" size={18} /> Data Suite Modular (-20%)
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
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: "#0B1F3B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BrandMark variant={scope} size={17} />
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
