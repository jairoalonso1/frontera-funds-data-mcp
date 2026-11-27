"use client";

import { useState } from "react";

export type ToolSummary = {
  name: string;
  description: string;
};

type McpTarget = "funds_data" | "connector";
type ClientTab = "claude" | "chatgpt" | "cursor" | "api";
type BillingCycle = "1m" | "6m" | "12m";

const FUNDS_DATA_MCP = ["https://funds-data", "fronteraeficiente", "com/api/mcp"].join(".");
const FUNDS_CONNECTOR_MCP = ["https://funds-connector", "fronteraeficiente", "com/api/mcp"].join(".");
const FUNDS_DATA_OAUTH = ["https://funds-data", "fronteraeficiente", "com/.well-known/oauth-protected-resource"].join(".");
const FUNDS_CONNECTOR_OAUTH = ["https://funds-connector", "fronteraeficiente", "com/.well-known/oauth-protected-resource"].join(".");
const SAAS_APP_URL = ["https://app", "fronteraeficiente", "com"].join(".");
const BRAND_HOME = ["https://www", "fronteraeficiente", "com"].join(".");
const OPENDATA_URL = ["https://opendata", "fronteraeficiente", "com"].join(".");
const CONTACT_EMAIL = ["powerportfoliomanagement", "gmail.com"].join("@");
const FONTS_HREF =
  [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700",
    "family=JetBrains+Mono:wght@400;500;600;700",
    "family=Plus+Jakarta+Sans:wght@600;700;800",
  ].join("&") + "&display=swap";

const CYCLE_LABELS: Record<BillingCycle, string> = {
  "1m": "Mensual",
  "6m": "6 meses (1 mes gratis)",
  "12m": "1 año (4 meses gratis)",
};

const FUNDS_DATA_PLANS: Array<{
  code: "starter" | "pro" | "ultra";
  label: string;
  monthlyLimit: number;
  perMinuteLimit: number;
  pricesCop: Record<BillingCycle, number>;
  featured?: boolean;
  description: string;
}> = [
  {
    code: "starter",
    label: "Starter / Analista",
    monthlyLimit: 5000,
    perMinuteLimit: 60,
    pricesCop: { "1m": 29000, "6m": 145000, "12m": 232000 },
    description: "1 usuario · 5.000 consultas exitosas/mes · 12 herramientas de análisis de fondos.",
  },
  {
    code: "pro",
    label: "Pro",
    monthlyLimit: 15000,
    perMinuteLimit: 90,
    pricesCop: { "1m": 49000, "6m": 245000, "12m": 392000 },
    featured: true,
    description: "1 usuario · El más elegido · 15.000 consultas exitosas/mes · autoservicio completo.",
  },
  {
    code: "ultra",
    label: "Ultra",
    monthlyLimit: 50000,
    perMinuteLimit: 120,
    pricesCop: { "1m": 99000, "6m": 495000, "12m": 792000 },
    description: "Power User · 50.000 consultas exitosas/mes · 1 usuario · soporte por correo.",
  },
];

const FIVE_PILLARS = [
  {
    num: "01",
    tag: "PLATAFORMA WEB · SAAS",
    title: "Frontera Funds SaaS",
    badge: "Plan Integral · $120.000 COP/mes",
    desc: "Aplicación profesional para analizar, comparar y hacer seguimiento cuantitativo a los Fondos de Inversión Colectiva (FIC) y FCP de Colombia con series históricas, métricas de riesgo y grupos personalizados.",
    bullets: [
      "Acceso directo en app.fronteraeficiente.com",
      "Radiografías, comparativos y tableros cuantitativos",
      "Incluye Connector, Frontera Índices e Intelligence Skills",
    ],
    ctaLabel: "Entrar a la SaaS →",
    ctaHref: SAAS_APP_URL,
    external: true,
  },
  {
    num: "02",
    tag: "MCP PRIVADO · TU CUENTA SAAS",
    title: "Frontera Funds Connector",
    badge: "Incluido en Frontera Funds SaaS",
    desc: "Servidor MCP autenticado vía OAuth 2.1 que conecta a Claude, ChatGPT o tu agente directamente con tus grupos, favoritos y seguimiento dentro de la SaaS sin tocar ni exponer credenciales manuales.",
    bullets: [
      "Lectura de favoritos y grupos; gestión sujeta a habilitación de permisos",
      "Autenticación OAuth 2.1 con tu sesión de la SaaS",
      "Sincronización directa con tu trabajo en pantalla",
    ],
    ctaLabel: "Cómo conectar Connector →",
    ctaHref: "#conectar-mcp",
    external: false,
  },
  {
    num: "03",
    tag: "MCP PÚBLICO · DATOS SFC",
    title: "Frontera Funds Data MCP",
    badge: "Gratis 1.500 créditos/mes · Planes desde $29.000",
    desc: "Servidor MCP independiente conectado con la información de los Fondos de Inversión en Colombia, con 12 herramientas cuantitativas e institucionales.",
    bullets: [
      "Rentabilidades E.A., AUM, cuota de mercado y flujos netos",
      "Radar de liquidez, riesgo cuantitativo y peer groups",
      "1.500 créditos al mes gratis por MCP sin tarjeta",
    ],
    ctaLabel: "Explorar 12 herramientas →",
    ctaHref: "#herramientas",
    external: false,
  },
  {
    num: "04",
    tag: "CLASIFICACIÓN · METODOLOGÍA FRONTERA",
    title: "Frontera Índices",
    badge: "Incluido en SaaS · Consultas adicionales por correo",
    desc: "Metodología propia de Frontera basada en datos oficiales SFC: 12 grupos de volatilidad para fondos tradicionales con más de 180 retornos válidos, tres categorías por naturaleza y el estado Sin Clasificar. Ventana móvil de 365 días.",
    bullets: [
      "Metodología auditable y actualización trimestral verificable",
      "Los fondos especiales se clasifican por naturaleza sin exigir historial",
      "Disponible en feeds CSV/JSON a medida para entidades",
    ],
    ctaLabel: "Consultar licenciamiento →",
    ctaHref: `mailto:${CONTACT_EMAIL}?subject=Cotizacion%20Frontera%20Indices`,
    external: false,
  },
  {
    num: "05",
    tag: "AUTOMATIZACIÓN · REPORTES HTML",
    title: "Intelligence Skills",
    badge: "Incluido en SaaS · Consultas adicionales por correo",
    desc: "Skills financieras que producen informes HTML determinísticos basados en perfiles de referencia de la SaaS. La homologación visual y numérica completa sigue en curso.",
    bullets: [
      "Factsheets y comparativos listos para comité de inversión",
      "Integración nativa con Funds Data MCP y Connector",
      "Personalización corporativa bajo análisis de caso",
    ],
    ctaLabel: "Solicitar análisis de caso →",
    ctaHref: `mailto:${CONTACT_EMAIL}?subject=Cotizacion%20Frontera%20Funds%20Intelligence%20Skills`,
    external: false,
  },
];

function formatCop(v: number) {
  return `$${v.toLocaleString("es-CO")} COP`;
}

function FundsLogoMark({ size = 34, idPrefix = "ff" }: { size?: number; idPrefix?: string }) {
  const h = Math.round(size * 1.06);
  return (
    <svg width={size} height={h} viewBox="0 0 100 106" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${idPrefix}T`} x1="0%" y1="0%" x2="100%" y2="20%">
          <stop offset="0%" stopColor="#158CFE" />
          <stop offset="100%" stopColor="#005BFC" />
        </linearGradient>
        <linearGradient id={`${idPrefix}M`} x1="0%" y1="10%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0058F9" />
        </linearGradient>
        <linearGradient id={`${idPrefix}B`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#003BA8" />
          <stop offset="100%" stopColor="#0178FC" />
        </linearGradient>
        <linearGradient id={`${idPrefix}S`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#020B1F" stopOpacity="0.58" />
          <stop offset="100%" stopColor="#020B1F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M27 66 H56 L42 96 C39 101 35 102 30 102 H13 L27 66 Z" fill={`url(#${idPrefix}B)`} />
      <path d="M27 66 H56 L51 77 H23 L27 66 Z" fill={`url(#${idPrefix}S)`} />
      <path d="M29 37 L42 12 C45 7 50 5 57 5 H96 L84 30 C81 35 77 37 71 37 H29 Z" fill={`url(#${idPrefix}T)`} />
      <path d="M24 41 H74 L63 63 C60 68 56 70 50 70 H35 C27 70 20 72 9 77 C5 79 3 76 5 72 L15 48 C17 43 20 41 24 41 Z" fill={`url(#${idPrefix}M)`} />
    </svg>
  );
}

function UmbrellaLogoMark({ size = 28, idPrefix = "fe" }: { size?: number; idPrefix?: string }) {
  const h = Math.round(size * 1.06);
  return (
    <svg width={size} height={h} viewBox="0 0 100 106" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${idPrefix}T`} x1="0%" y1="0%" x2="100%" y2="20%">
          <stop offset="0%" stopColor="#29ADFD" />
          <stop offset="100%" stopColor="#0269FC" />
        </linearGradient>
        <linearGradient id={`${idPrefix}M`} x1="0%" y1="10%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#00E295" />
          <stop offset="100%" stopColor="#05FACE" />
        </linearGradient>
        <linearGradient id={`${idPrefix}B`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0043C5" />
          <stop offset="100%" stopColor="#017DFE" />
        </linearGradient>
        <linearGradient id={`${idPrefix}S`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#020B1F" stopOpacity="0.58" />
          <stop offset="100%" stopColor="#020B1F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M27 66 H56 L42 96 C39 101 35 102 30 102 H13 L27 66 Z" fill={`url(#${idPrefix}B)`} />
      <path d="M27 66 H56 L51 77 H23 L27 66 Z" fill={`url(#${idPrefix}S)`} />
      <path d="M29 37 L42 12 C45 7 50 5 57 5 H96 L84 30 C81 35 77 37 71 37 H29 Z" fill={`url(#${idPrefix}T)`} />
      <path d="M24 41 H74 L63 63 C60 68 56 70 50 70 H35 C27 70 20 72 9 77 C5 79 3 76 5 72 L15 48 C17 43 20 41 24 41 Z" fill={`url(#${idPrefix}M)`} />
    </svg>
  );
}

function getClientGuides(target: McpTarget) {
  const endpoint = target === "funds_data" ? FUNDS_DATA_MCP : FUNDS_CONNECTOR_MCP;
  const oauthMeta = target === "funds_data" ? FUNDS_DATA_OAUTH : FUNDS_CONNECTOR_OAUTH;
  const serverName = target === "funds_data" ? "Frontera Funds Data" : "Frontera Funds Connector";
  const serverKey = target === "funds_data" ? "frontera-funds-data" : "frontera-funds-connector";
  const authNote =
    target === "funds_data"
      ? "Entras con tu correo mediante OAuth 2.1 y activas tus 1.500 créditos al mes gratis por MCP sin tarjeta."
      : "Inicias sesión con tu cuenta activa de Frontera Funds SaaS (OAuth 2.1) para operar tus favoritos y grupos.";

  const guides: Record<
    ClientTab,
    {
      name: string;
      badge: string;
      summary: string;
      steps: Array<{ title: string; detail: string }>;
      snippetTitle: string;
      snippet: string;
    }
  > = {
    claude: {
      name: "Claude (Web y Desktop)",
      badge: "Recomendado · Sin código",
      summary: `Conecta ${serverName} como conector personalizado en Claude. ${authNote}`,
      steps: [
        { title: "Copia la URL oficial del servidor MCP", detail: `Copia ${endpoint} desde el recuadro superior.` },
        { title: "Abre Ajustes → Conectores en Claude", detail: "En Claude.ai o Claude Desktop entra a Settings → Connectors y elige «Add custom connector»." },
        { title: "Pega la URL y autoriza con OAuth 2.1", detail: `Nómbralo «${serverName}», pega la dirección oficial y completa el acceso con tu correo. Sin tokens manuales.` },
      ],
      snippetTitle: "Ejemplo de consulta en Claude",
      snippet:
        target === "funds_data"
          ? "Dame el Top 10 de FICs en Colombia por rentabilidad E.A. a 365 días en la última fecha de corte SFC, compara su AUM y revisa si alguno presenta alertas de liquidez."
          : "Consulta mis grupos y fondos favoritos de Frontera Funds SaaS y resume el desempeño reciente de los fondos de liquidez que sigo.",
    },
    chatgpt: {
      name: "ChatGPT (Conectores MCP)",
      badge: "OAuth 2.1 Nativo",
      summary: `Agrega ${serverName} en ChatGPT para consultar cifras SFC verificables o interactuar con tus grupos de la SaaS.`,
      steps: [
        { title: "Copia el endpoint oficial", detail: `Usa exactamente ${endpoint} bajo el dominio oficial fronteraeficiente.com.` },
        { title: "Crea un Conector MCP en ChatGPT", detail: "Ve a Configuración → Conectores (Apps & Connectors) → Crear conector remoto." },
        { title: "Autoriza tu cuenta", detail: authNote },
      ],
      snippetTitle: "Ejemplo de consulta en ChatGPT",
      snippet:
        target === "funds_data"
          ? "Calcula la cuota de mercado por AUM de las principales fiduciarias de Colombia y compara los flujos netos de captación de los últimos 30 días."
          : "Lista los grupos de seguimiento que tengo en Frontera Funds y prepárame un comparativo ejecutivo del grupo principal.",
    },
    cursor: {
      name: "Cursor / VS Code / Windsurf",
      badge: "IDEs & Agentes",
      summary: `Integra ${serverName} directo en tu flujo de análisis cuantitativo, notebooks o desarrollo.`,
      steps: [
        { title: "Abre la configuración MCP del editor", detail: "En Cursor entra a Settings → MCP → Add new global MCP server o edita tu archivo mcp.json." },
        { title: "Registra el servidor remoto HTTP", detail: `Agrega la entrada JSON apuntando a ${endpoint}.` },
        { title: "Completa el flujo OAuth en el navegador", detail: authNote },
      ],
      snippetTitle: "Configuración mcp.json",
      snippet: JSON.stringify({ mcpServers: { [serverKey]: { url: endpoint } } }, null, 2),
    },
    api: {
      name: "Agentes Custom / Composio / HTTP",
      badge: "Streamable HTTP",
      summary: "Estándar abierto Model Context Protocol (MCP) con descubrimiento OAuth 2.1 automático.",
      steps: [
        { title: "Apunta al endpoint Streamable HTTP", detail: `Usa ${endpoint} como servidor remoto oficial.` },
        { title: "Descubrimiento OAuth 2.1 estándar", detail: "Expone /.well-known/oauth-protected-resource y /.well-known/oauth-authorization-server." },
        { title: "Trazabilidad y cuota justa", detail: "Respuestas estructuradas con fecha de corte oficial SFC; los errores externos no descuentan cuota." },
      ],
      snippetTitle: "Endpoints oficiales de descubrimiento",
      snippet: `MCP Endpoint: ${endpoint}
OAuth Metadata: ${oauthMeta}`,
    },
  };

  return { endpoint, serverName, guides };
}

export function FundsHubClient({ tools }: { tools: ToolSummary[] }) {
  const [mcpTarget, setMcpTarget] = useState<McpTarget>("funds_data");
  const [activeClient, setActiveClient] = useState<ClientTab>("claude");
  const [cycle, setCycle] = useState<BillingCycle>("6m");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const { endpoint, guides } = getClientGuides(mcpTarget);
  const guide = guides[activeClient];

  async function copyText(text: string, which: "url" | "snippet") {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "url") {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2400);
      } else {
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2400);
      }
    } catch {}
  }

  return (
    <div className="ff-shell">
      <link rel="stylesheet" href={FONTS_HREF} />
      <style>{`
        .ff-shell {
          --bg-void:#030712;
          --bg-night:#0B1F3B;
          --bg-card:rgba(11,21,43,.84);
          --border-subtle:rgba(148,163,184,.16);
          --border-cobalt:rgba(56,189,248,.38);
          --cobalt:#1D63ED;
          --cobalt-word:#0084FF;
          --sky:#38BDF8;
          --emerald:#05FACE;
          --text-primary:#F8FAFC;
          --text-secondary:#94A3B8;
          --text-muted:#64748B;
          min-height:100vh;
          color:var(--text-primary);
          font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
          background:
            radial-gradient(1120px 640px at 16% -8%,rgba(29,99,237,.24),transparent 62%),
            radial-gradient(960px 540px at 88% 10%,rgba(56,189,248,.16),transparent 60%),
            var(--bg-void);
          line-height:1.6;
          overflow-x:hidden;
        }
        .ff-shell * { box-sizing:border-box; }
        .ff-display { font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif; letter-spacing:-0.025em; }
        .ff-mono { font-family:'JetBrains Mono',ui-monospace,monospace; }
        .ff-tabular { font-variant-numeric:tabular-nums; }
        .ff-container { max-width:1220px; margin:0 auto; padding:0 24px; }
        .ff-nav { position:sticky; top:0; z-index:50; backdrop-filter:blur(18px); background:rgba(3,7,18,.84); border-bottom:1px solid var(--border-subtle); }
        .ff-nav-inner { max-width:1220px; margin:0 auto; padding:14px 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .ff-brand-lockup { display:inline-flex; align-items:center; gap:12px; text-decoration:none; color:var(--text-primary); }
        .ff-brand-stack { display:flex; flex-direction:column; line-height:1.05; }
        .ff-brand-row { font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:19px; color:#F8FAFC; }
        .ff-brand-sub { font-size:9.5px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--text-secondary); margin-top:2px; }
        .ff-nav-links { display:flex; align-items:center; gap:24px; }
        .ff-nav-links a { color:var(--text-secondary); text-decoration:none; font-size:13.5px; font-weight:500; }
        .ff-nav-links a:hover { color:var(--text-primary); }
        .ff-nav-actions { display:flex; align-items:center; gap:10px; }
        .ff-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 18px; border-radius:999px; font-size:13.5px; font-weight:600; text-decoration:none; cursor:pointer; border:1px solid transparent; transition:all .2s ease; white-space:nowrap; }
        .ff-btn-primary { background:linear-gradient(135deg,#158CFE 0%,#1D63ED 55%,#005BFC 100%); color:#F8FAFC; box-shadow:0 10px 28px rgba(29,99,237,.36); }
        .ff-btn-primary:hover { filter:brightness(1.08); transform:translateY(-1px); }
        .ff-btn-ghost { background:rgba(255,255,255,.04); border-color:var(--border-subtle); color:var(--text-primary); }
        .ff-btn-ghost:hover { border-color:var(--border-cobalt); background:rgba(29,99,237,.12); }
        .ff-hero { padding:72px 0 60px; }
        .ff-hero-grid { display:grid; grid-template-columns:1.15fr .85fr; gap:36px; align-items:center; }
        .ff-pill { display:inline-flex; align-items:center; gap:9px; padding:6px 14px; border-radius:999px; background:rgba(29,99,237,.14); border:1px solid rgba(56,189,248,.34); color:#BAE6FD; font-size:12px; font-weight:600; margin-bottom:18px; }
        .ff-dot { width:8px; height:8px; border-radius:50%; background:#38BDF8; box-shadow:0 0 10px rgba(56,189,248,.8); }
        .ff-hero h1 { font-size:clamp(34px,4.5vw,54px); font-weight:800; line-height:1.06; margin:0 0 18px; }
        .ff-grad { background:linear-gradient(95deg,#F8FAFC 12%,#38BDF8 58%,#158CFE 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .ff-lead { font-size:16.5px; color:var(--text-secondary); max-width:620px; margin:0 0 24px; }
        .ff-endpoint-box { padding:16px 18px; border-radius:16px; background:rgba(7,13,31,.92); border:1px solid var(--border-cobalt); margin-bottom:22px; }
        .ff-mini-tabs { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
        .ff-mini-tab { padding:5px 11px; border-radius:999px; border:1px solid var(--border-subtle); background:rgba(255,255,255,.03); color:var(--text-secondary); font-size:11.5px; font-weight:600; cursor:pointer; }
        .ff-mini-tab.active { background:rgba(29,99,237,.22); border-color:rgba(56,189,248,.5); color:#F8FAFC; }
        .ff-endpoint-label { display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:11px; text-transform:uppercase; letter-spacing:.09em; color:#7DD3FC; margin-bottom:8px; }
        .ff-endpoint-row { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .ff-endpoint-url { font-size:13px; color:#F8FAFC; word-break:break-all; }
        .ff-copy-btn { padding:8px 14px; border-radius:10px; border:1px solid rgba(56,189,248,.45); background:rgba(29,99,237,.18); color:#7DD3FC; font-size:12.5px; font-weight:700; cursor:pointer; }
        .ff-copy-btn:hover { background:#1D63ED; color:#F8FAFC; }
        .ff-card { border-radius:22px; padding:24px; background:linear-gradient(165deg,rgba(13,25,52,.92),rgba(6,12,28,.96)); border:1px solid var(--border-subtle); }
        .ff-flow-step { padding:13px 15px; border-radius:14px; background:rgba(255,255,255,.03); border:1px solid var(--border-subtle); }
        .ff-flow-arrow { text-align:center; color:#38BDF8; font-size:12px; padding:6px 0; }
        .ff-section { padding:72px 0; border-top:1px solid rgba(148,163,184,.08); }
        .ff-eyebrow { font-size:12px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; color:#38BDF8; margin-bottom:10px; }
        .ff-h2 { font-size:clamp(26px,3.5vw,38px); font-weight:800; line-height:1.12; margin:0 0 14px; max-width:780px; }
        .ff-sub { font-size:16px; color:var(--text-secondary); max-width:700px; margin:0 0 36px; }
        .ff-grid-3 { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; }
        .ff-plan-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
        .ff-feature-card { border-radius:18px; padding:22px; background:var(--bg-card); border:1px solid var(--border-subtle); display:flex; flex-direction:column; justify-content:space-between; gap:16px; }
        .ff-feature-card.highlight { border-color:rgba(56,189,248,.42); background:linear-gradient(165deg,rgba(13,30,68,.92),rgba(7,15,36,.95)); }
        .ff-badge { display:inline-block; font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; background:rgba(29,99,237,.16); border:1px solid rgba(56,189,248,.28); color:#BAE6FD; margin-bottom:10px; }
        .ff-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
        .ff-tab { padding:9px 16px; border-radius:999px; font-size:13px; font-weight:600; background:rgba(255,255,255,.04); border:1px solid var(--border-subtle); color:var(--text-secondary); cursor:pointer; }
        .ff-tab.active,.ff-tab:hover { background:rgba(29,99,237,.22); border-color:rgba(56,189,248,.52); color:#F8FAFC; }
        .ff-guide-box { display:grid; grid-template-columns:1.05fr .95fr; gap:24px; border-radius:22px; padding:26px; background:rgba(7,13,31,.92); border:1px solid var(--border-subtle); }
        .ff-step-item { display:flex; gap:14px; align-items:flex-start; }
        .ff-step-num { width:28px; height:28px; border-radius:50%; background:rgba(29,99,237,.22); border:1px solid rgba(56,189,248,.48); color:#7DD3FC; font-weight:700; font-size:13px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; }
        .ff-pre { margin:0; padding:16px; border-radius:14px; background:#030712; border:1px solid var(--border-subtle); color:#E2E8F0; font-size:12.5px; line-height:1.6; white-space:pre-wrap; overflow-wrap:anywhere; }
        .ff-tool-card { border-radius:14px; padding:16px 18px; background:rgba(11,21,43,.72); border:1px solid var(--border-subtle); }
        .ff-saas-banner { border-radius:22px; padding:28px; background:linear-gradient(135deg,rgba(11,31,59,.95) 0%,rgba(14,42,92,.88) 55%,rgba(7,16,38,.96) 100%); border:1.5px solid rgba(56,189,248,.48); display:grid; grid-template-columns:1.25fr .75fr; gap:28px; align-items:center; margin-bottom:36px; box-shadow:0 16px 40px rgba(2,11,31,.45); }
        .ff-cycle-switch { display:inline-flex; padding:4px; border-radius:999px; background:rgba(15,23,42,.92); border:1px solid var(--border-subtle); gap:4px; margin-bottom:24px; flex-wrap:wrap; }
        .ff-cycle-btn { padding:8px 16px; border-radius:999px; border:none; background:transparent; color:var(--text-secondary); font-size:13px; font-weight:600; cursor:pointer; }
        .ff-cycle-btn.active { background:linear-gradient(135deg,#158CFE 0%,#1D63ED 100%); color:#F8FAFC; }
        .ff-plan-card { border-radius:20px; padding:22px; background:rgba(11,21,43,.84); border:1px solid var(--border-subtle); display:flex; flex-direction:column; justify-content:space-between; gap:16px; }
        .ff-plan-card.featured { border:2px solid #38BDF8; box-shadow:0 12px 32px rgba(29,99,237,.24); }
        .ff-footer { border-top:1px solid var(--border-subtle); padding:44px 0 34px; background:rgba(3,7,18,.96); }
        .ff-footer-row { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; flex-wrap:wrap; }
        .ff-footer-links { display:flex; gap:20px; flex-wrap:wrap; }
        .ff-footer-links a { color:var(--text-secondary); text-decoration:none; font-size:13.5px; }
        .ff-footer-links a:hover { color:#38BDF8; }
        @media (max-width:980px) {
          .ff-hero-grid,.ff-guide-box,.ff-saas-banner { grid-template-columns:1fr; }
          .ff-grid-3 { grid-template-columns:1fr; }
          .ff-plan-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .ff-nav-links { display:none; }
        }
        @media (max-width:600px) {
          .ff-plan-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <header className="ff-nav">
        <div className="ff-nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="/" className="ff-brand-lockup" aria-label="Frontera Funds Inicio">
              <FundsLogoMark size={34} idPrefix="ffNav" />
              <span className="ff-brand-stack">
                <span className="ff-brand-row">
                  Frontera <span style={{ color: "#0084FF" }}>Funds</span>
                </span>
                <span className="ff-brand-sub">Análisis y gestión de FIC</span>
              </span>
            </a>
            <a
              href={BRAND_HOME}
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                borderLeft: "1px solid var(--border-subtle)",
                paddingLeft: 12,
              }}
            >
              ← Frontera Eficiente®
            </a>
          </div>
          <nav className="ff-nav-links">
            <a href="#ecosistema">Ecosistema (5)</a>
            <a href="#conectar-mcp">Conectar MCP</a>
            <a href="#herramientas">12 Herramientas SFC</a>
            <a href="#planes">Planes COP</a>
          </nav>
          <div className="ff-nav-actions">
            <a href="/billing" className="ff-btn ff-btn-ghost">
              Planes MCP
            </a>
            <a href={SAAS_APP_URL} target="_blank" rel="noopener noreferrer" className="ff-btn ff-btn-primary">
              Entrar a la SaaS →
            </a>
          </div>
        </div>
      </header>

      <section className="ff-hero">
        <div className="ff-container">
          <div className="ff-hero-grid">
            <div>
              <div className="ff-pill">
                <span className="ff-dot" />
                <span>División Productos Financieros · Frontera Eficiente</span>
              </div>
              <h1 className="ff-display">
                Inteligencia cuantitativa para{" "}
                <span className="ff-grad">Fondos de Inversión Colectiva.</span>
              </h1>
              <p className="ff-lead">
                Todo el ecosistema de <strong>Frontera Funds</strong> en un solo lugar: plataforma web SaaS,
                conectores MCP oficiales para tu asistente de IA, datos públicos de la Superfinanciera (SFC),
                categorización <strong>Frontera Índices</strong> e <strong>Intelligence Skills</strong>.
              </p>

              <div className="ff-endpoint-box">
                <div className="ff-mini-tabs" role="tablist" aria-label="Seleccionar servidor MCP de Frontera Funds">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mcpTarget === "funds_data"}
                    className={`ff-mini-tab ${mcpTarget === "funds_data" ? "active" : ""}`}
                    onClick={() => setMcpTarget("funds_data")}
                  >
                    Funds Data MCP (Público SFC)
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mcpTarget === "connector"}
                    className={`ff-mini-tab ${mcpTarget === "connector" ? "active" : ""}`}
                    onClick={() => setMcpTarget("connector")}
                  >
                    Funds Connector MCP (Cuenta SaaS)
                  </button>
                </div>
                <div className="ff-endpoint-label ff-mono">
                  <span>
                    {mcpTarget === "funds_data"
                      ? "Dirección oficial · Datos públicos SFC (OAuth 2.1)"
                      : "Dirección oficial · Conector autenticado SaaS (OAuth 2.1)"}
                  </span>
                  <span style={{ color: "#38BDF8" }}>● ACTIVO</span>
                </div>
                <div className="ff-endpoint-row">
                  <code className="ff-endpoint-url ff-mono">{endpoint}</code>
                  <button type="button" className="ff-copy-btn" onClick={() => copyText(endpoint, "url")}>
                    {copiedUrl ? "✓ URL copiada" : "Copiar URL MCP"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href={SAAS_APP_URL} target="_blank" rel="noopener noreferrer" className="ff-btn ff-btn-primary">
                  Abrir Frontera Funds SaaS →
                </a>
                <a href="#planes" className="ff-btn ff-btn-ghost">
                  Ver planes en COP
                </a>
              </div>
            </div>

            <aside className="ff-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="ff-mono" style={{ fontSize: 11.5, color: "#38BDF8", fontWeight: 700 }}>
                  ARQUITECTURA MODULAR FIC
                </span>
                <span className="ff-mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  5 componentes integrados
                </span>
              </div>
              <div className="ff-flow-step">
                <div style={{ fontSize: 11.5, color: "#7DD3FC", fontWeight: 700 }}>1 · FRONTERA FUNDS SAAS</div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>app.fronteraeficiente.com</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                  Tu mesa de análisis visual y cuantitativo de FIC/FCP, grupos y favoritos.
                </div>
              </div>
              <div className="ff-flow-arrow ff-mono">↓ Conectores MCP oficiales (OAuth 2.1)</div>
              <div className="ff-flow-step" style={{ borderColor: "rgba(56,189,248,.38)" }}>
                <div style={{ fontSize: 11.5, color: "#38BDF8", fontWeight: 700 }}>
                  2 · CONNECTOR + FUNDS DATA + SKILLS
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Claude, ChatGPT, Cursor y Agentes IA</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                  12 herramientas SFC, gestión de tus favoritos SaaS y factsheets HTML reproducibles.
                </div>
              </div>
              <div className="ff-flow-arrow ff-mono">↓ Rigor verificable y trazabilidad a fuente</div>
              <div className="ff-flow-step">
                <div style={{ fontSize: 11.5, color: "#93C5FD", fontWeight: 700 }}>
                  3 · FRONTERA ÍNDICES + DATOS OFICIALES SFC
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>12 categorías cuantitativas · Fondos de Inversión en Colombia</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                  Clasificación trimestral determinística y series oficiales con fecha de corte exacta.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="ecosistema" className="ff-section">
        <div className="ff-container">
          <div className="ff-eyebrow">01 · Qué incluye Frontera Funds</div>
          <h2 className="ff-h2 ff-display">Cinco capacidades diseñadas para análisis e inversión institucional</h2>
          <p className="ff-sub">
            Cada pieza cumple un rol preciso y auditable: puedes usar la <strong>SaaS integral</strong> (que ya incluye
            Connector, Índices y Skills) o consumir <strong>Funds Data MCP</strong> de manera independiente según tu volumen.
          </p>

          <div className="ff-grid-3">
            {FIVE_PILLARS.map((item, idx) => (
              <article key={item.title} className={`ff-feature-card ${idx === 0 ? "highlight" : ""}`}>
                <div>
                  <div className="ff-mono" style={{ fontSize: 11, color: "#38BDF8", marginBottom: 8 }}>
                    {item.num} · {item.tag}
                  </div>
                  <h3 className="ff-display" style={{ fontSize: 19.5, margin: "0 0 8px" }}>
                    {item.title}
                  </h3>
                  <span className="ff-badge">{item.badge}</span>
                  <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 14px" }}>{item.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {item.bullets.map((b) => (
                      <li key={b} style={{ fontSize: 12.5, color: "#CBD5E1" }}>
                        <span className="ff-mono" style={{ color: "#38BDF8", marginRight: 8 }}>
                          →
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={item.ctaHref}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  style={{ color: "#7DD3FC", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}
                >
                  {item.ctaLabel}
                </a>
              </article>
            ))}

            <article
              className="ff-feature-card"
              style={{
                borderColor: "rgba(5,250,206,.28)",
                background: "linear-gradient(165deg,rgba(7,24,46,.9),rgba(5,14,28,.95))",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <UmbrellaLogoMark size={26} idPrefix="feCard" />
                  <span className="ff-mono" style={{ fontSize: 11, color: "#05FACE", fontWeight: 700 }}>
                    SINERGIA · FRONTERA EFICIENTE®
                  </span>
                </div>
                <h3 className="ff-display" style={{ fontSize: 19.5, margin: "0 0 8px" }}>
                  Combina con Frontera OpenData
                </h3>
                <span
                  className="ff-badge"
                  style={{
                    background: "rgba(5,250,206,.12)",
                    borderColor: "rgba(5,250,206,.34)",
                    color: "#A7F3D0",
                  }}
                >
                  Suite Modular · Ahorro de al menos 20%
                </span>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 14px" }}>
                  Cruza los datos oficiales de FICs de la SFC con TRM, tasas BanRep, IPC DANE, SECOP II y normativa
                  colombiana en el mismo chat de IA.
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <li style={{ fontSize: 12.5, color: "#CBD5E1" }}>
                    <span className="ff-mono" style={{ color: "#05FACE", marginRight: 8 }}>
                      →
                    </span>
                    OpenData MCP + Funds Data MCP en un solo pago COP
                  </li>
                  <li style={{ fontSize: 12.5, color: "#CBD5E1" }}>
                    <span className="ff-mono" style={{ color: "#05FACE", marginRight: 8 }}>
                      →
                    </span>
                    Cuotas independientes por cada servidor MCP
                  </li>
                </ul>
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <a href={`/billing?scope=suite&cycle=${cycle}`} style={{ color: "#05FACE", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
                  Ver Suite (ahorro de al menos 20%) →
                </a>
                <a
                  href={OPENDATA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
                >
                  Ir a OpenData ↗
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="conectar-mcp" className="ff-section">
        <div className="ff-container">
          <div className="ff-eyebrow">02 · Guía paso a paso</div>
          <h2 className="ff-h2 ff-display">Conecta Frontera Funds a tu asistente de IA en 60 segundos</h2>
          <p className="ff-sub">
            Elige cuál de los dos servidores MCP oficiales vas a conectar y selecciona tu cliente. Ambos usan{" "}
            <strong>OAuth 2.1</strong> con tu correo, sin copiar tokens manuales.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <button
              type="button"
              className={`ff-tab ${mcpTarget === "funds_data" ? "active" : ""}`}
              onClick={() => setMcpTarget("funds_data")}
            >
              1. Funds Data MCP (Datos públicos SFC)
            </button>
            <button
              type="button"
              className={`ff-tab ${mcpTarget === "connector" ? "active" : ""}`}
              onClick={() => setMcpTarget("connector")}
            >
              2. Funds Connector MCP (Favoritos y grupos SaaS)
            </button>
          </div>

          <div className="ff-tabs" role="tablist" aria-label="Clientes MCP compatibles">
            {(Object.keys(guides) as ClientTab[]).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={activeClient === k}
                className={`ff-tab ${activeClient === k ? "active" : ""}`}
                onClick={() => setActiveClient(k)}
              >
                {guides[k].name}
              </button>
            ))}
          </div>

          <div className="ff-guide-box">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span
                  className="ff-mono"
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(29,99,237,.18)",
                    color: "#7DD3FC",
                    marginBottom: 8,
                  }}
                >
                  {guide.badge}
                </span>
                <h3 className="ff-display" style={{ fontSize: 22, margin: "0 0 6px" }}>
                  {guide.name}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>{guide.summary}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {guide.steps.map((st, idx) => (
                  <div key={st.title} className="ff-step-item">
                    <span className="ff-step-num ff-tabular">{idx + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{st.title}</div>
                      <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>{st.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
                  <span className="ff-mono" style={{ fontSize: 11.5, color: "#94A3B8" }}>
                    {guide.snippetTitle}
                  </span>
                  <button type="button" className="ff-copy-btn" onClick={() => copyText(guide.snippet, "snippet")}>
                    {copiedSnippet ? "✓ Copiado" : "Copiar ejemplo"}
                  </button>
                </div>
                <pre className="ff-pre ff-mono">{guide.snippet}</pre>
              </div>
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: 12.5,
                  color: "var(--text-secondary)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  {mcpTarget === "funds_data"
                    ? "Empieza con 1.500 créditos al mes gratis por MCP en Funds Data MCP."
                    : "El Connector requiere una cuenta activa en Frontera Funds SaaS."}
                </span>
                <a
                  href={mcpTarget === "funds_data" ? "/billing" : SAAS_APP_URL}
                  target={mcpTarget === "connector" ? "_blank" : undefined}
                  rel={mcpTarget === "connector" ? "noopener noreferrer" : undefined}
                  style={{ color: "#38BDF8", fontWeight: 600, textDecoration: "none" }}
                >
                  {mcpTarget === "funds_data" ? "Ver planes COP →" : "Ir a la SaaS →"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="herramientas" className="ff-section">
        <div className="ff-container">
          <div className="ff-eyebrow">03 · Cobertura verificable SFC</div>
          <h2 className="ff-h2 ff-display">
            Catálogo de {tools.length} herramientas institucionales en Funds Data MCP
          </h2>
          <p className="ff-sub">
            Conectadas en tiempo real con la información estructurada de los Fondos de Inversión en Colombia.
          </p>

          <div className="ff-grid-3">
            {tools.map((tool, index) => (
              <article key={tool.name} className="ff-tool-card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span
                    className="ff-mono ff-tabular"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "rgba(29,99,237,.22)",
                      color: "#7DD3FC",
                    }}
                  >
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <code className="ff-mono" style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", wordBreak: "break-word" }}>
                    {tool.name}
                  </code>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{tool.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="ff-section">
        <div className="ff-container">
          <div className="ff-eyebrow">04 · Planes y precios en COP</div>
          <h2 className="ff-h2 ff-display">Planes individuales para la plataforma SaaS y tus consultas MCP</h2>
          <p className="ff-sub">
            Precios transparentes en pesos colombianos (COP). Sin contratos ocultos: activa la experiencia completa en{" "}
            <strong>Frontera Funds SaaS</strong> o paga únicamente por el volumen de consultas de{" "}
            <strong>Funds Data MCP</strong>.
          </p>

          <div className="ff-saas-banner ff-tabular">
            <div>
              <span className="ff-badge" style={{ marginBottom: 12 }}>
                SUSCRIPCIÓN INTEGRAL POR USUARIO · TODO INCLUIDO
              </span>
              <h3 className="ff-display" style={{ fontSize: 28, margin: "0 0 10px" }}>
                Frontera Funds SaaS
              </h3>
              <p style={{ fontSize: 14.5, color: "#CBD5E1", margin: "0 0 16px", maxWidth: 620 }}>
                Acceso completo a la plataforma web de análisis de FICs y FCPs en Colombia, incluyendo las herramientas
                de IA y clasificación propias del ecosistema:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                {[
                  "Plataforma SaaS en app.fronteraeficiente.com",
                  "Frontera Funds Connector MCP (OAuth 2.1)",
                  "Frontera Índices (metodología propia sobre datos SFC)",
                  "Intelligence Skills (factsheets y comparativos HTML)",
                ].map((feat) => (
                  <div key={feat} style={{ fontSize: 13.5, color: "#E2E8F0" }}>
                    <span className="ff-mono" style={{ color: "#38BDF8", marginRight: 8 }}>
                      ✓
                    </span>
                    {feat}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: 22,
                borderRadius: 18,
                background: "rgba(3,7,18,.68)",
                border: "1px solid rgba(56,189,248,.34)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div className="ff-mono" style={{ fontSize: 11, color: "#7DD3FC", textTransform: "uppercase" }}>
                Tarifa por usuario
              </div>
              <div className="ff-display" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.08 }}>
                $120.000 <span style={{ fontSize: 15, fontWeight: 600, color: "#94A3B8" }}>COP / mes</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                Incluye SaaS + Connector + Frontera Índices + Intelligence Skills.
              </div>
              <a
                href={SAAS_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ff-btn ff-btn-primary"
                style={{ width: "100%" }}
              >
                Entrar a la SaaS →
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Solicitud%20licencia%20Frontera%20Funds%20SaaS`}
                className="ff-btn ff-btn-ghost"
                style={{ width: "100%" }}
              >
                Consultar necesidades adicionales
              </a>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <h3 className="ff-display" style={{ fontSize: 22, margin: "0 0 6px" }}>
              Frontera Funds Data MCP · Planes independientes por cuota
            </h3>
            <p style={{ fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 18px" }}>
              Arranca gratis con <strong>1.500 créditos al mes por MCP ($0 COP)</strong> sin tarjeta. Amplía tu cuota con
              pago único en COP vía Mercado Pago (sin renovaciones forzosas). Un crédito equivale a una llamada de herramienta exitosa; los errores de fuente no consumen créditos mensuales. El límite Free es de 30 intentos por minuto, incluidos los errores.
            </p>
          </div>

          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 18 }}>
            Todos los planes son individuales, para una persona. ¿Necesitas algo adicional?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#7DD3FC" }}>{CONTACT_EMAIL}</a>.
          </p>
          <div className="ff-cycle-switch" role="group" aria-label="Ciclo de facturación Funds Data MCP">
            {(["1m", "6m", "12m"] as BillingCycle[]).map((c) => (
              <button
                key={c}
                type="button"
                className={`ff-cycle-btn ${cycle === c ? "active" : ""}`}
                onClick={() => setCycle(c)}
              >
                {CYCLE_LABELS[c]}
              </button>
            ))}
          </div>

          <div className="ff-plan-grid ff-tabular">
            {FUNDS_DATA_PLANS.map((plan) => (
              <div key={plan.code} className={`ff-plan-card ${plan.featured ? "featured" : ""}`}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span className="ff-display" style={{ fontWeight: 700, fontSize: 16 }}>
                      {plan.label}
                    </span>
                    {plan.featured && (
                      <span
                        className="ff-mono"
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "rgba(56,189,248,.16)",
                          color: "#38BDF8",
                        }}
                      >
                        MÁS ELEGIDO
                      </span>
                    )}
                  </div>
                  <div className="ff-display" style={{ fontSize: 25, fontWeight: 800 }}>
                    {formatCop(plan.pricesCop[cycle])}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                    {cycle === "1m" ? "Pago mensual" : cycle === "6m" ? "Pago único por 6 meses" : "Pago único por 1 año"}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#7DD3FC", marginBottom: 4 }}>
                    {plan.monthlyLimit.toLocaleString("es-CO")} consultas exitosas / mes
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 10 }}>
                    Límite de velocidad: {plan.perMinuteLimit} req/min
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{plan.description}</p>
                </div>
                <a
                  href={`/billing?scope=funds_data&plan=${plan.code}&cycle=${cycle}`}
                  className={`ff-btn ${plan.featured ? "ff-btn-primary" : "ff-btn-ghost"}`}
                  style={{ width: "100%" }}
                >
                  Elegir plan →
                </a>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 22,
              padding: "18px 22px",
              borderRadius: 16,
              background: "rgba(11,21,43,.76)",
              border: "1px solid rgba(5,250,206,.26)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <UmbrellaLogoMark size={28} idPrefix="feSuite" />
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                <strong style={{ color: "#F8FAFC" }}>Frontera Eficiente · Paquete Combinado (ahorro de al menos 20%):</strong> combina{" "}
                <strong>Frontera OpenData MCP + Frontera Funds Data MCP</strong> desde{" "}
                <strong className="ff-tabular" style={{ color: "#05FACE" }}>
                  $43.000 COP/mes
                </strong>{" "}
                con cuotas independientes por cada servidor.
              </div>
            </div>
            <a href={`/billing?scope=suite&cycle=${cycle}`} style={{ color: "#05FACE", fontWeight: 700, fontSize: 13.5, textDecoration: "none", whiteSpace: "nowrap" }}>
              Ver planes combinados →
            </a>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: "20px 24px",
              borderRadius: 16,
              background: "rgba(255,255,255,.03)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 680 }}>
              <div className="ff-mono" style={{ fontSize: 11, color: "#7DD3FC", marginBottom: 4 }}>
                LICENCIAMIENTO A MEDIDA · SKILLS E ÍNDICES
              </div>
              <div className="ff-display" style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
                ¿Solo necesitas Intelligence Skills o los feeds de Frontera Índices para tu entidad?
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                Escríbenos a{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#7DD3FC", textDecoration: "none", fontWeight: 600 }}>
                  {CONTACT_EMAIL}
                </a>{" "}
                para analizar tu caso, volumen, licenciamiento trimestral o despliegue corporativo.
              </div>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Analisis%20de%20caso%20-%20Frontera%20Indices%20y%20Skills`}
              className="ff-btn ff-btn-ghost"
            >
              Escribir a soporte comercial →
            </a>
          </div>
        </div>
      </section>

      <footer className="ff-footer">
        <div className="ff-container">
          <div className="ff-footer-row">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span className="ff-display" style={{ fontWeight: 800, fontSize: 17 }}>
                  Frontera <span style={{ color: "#0084FF" }}>Funds</span>
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: 12.5 }}>· Un producto de Frontera Eficiente®</span>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", maxWidth: 500, margin: 0 }}>
                Herramientas de análisis cuantitativo basadas en información pública oficial de la Superintendencia
                Financiera de Colombia (SFC). Los datos y reportes tienen fines informativos y de análisis; no
                constituyen asesoría de inversión ni recomendación de compra o venta.
              </p>
            </div>
            <div className="ff-footer-links">
              <a href={BRAND_HOME}>Frontera Eficiente®</a>
              <a href={SAAS_APP_URL} target="_blank" rel="noopener noreferrer">
                Frontera Funds SaaS
              </a>
              <a href={OPENDATA_URL}>Frontera OpenData</a>
              <a href="/billing">Planes COP</a>
              <a href={`mailto:${CONTACT_EMAIL}`}>Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
