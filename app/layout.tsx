import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
  title: "Frontera Funds — Análisis y Gestión de FIC | Frontera Eficiente",
  description:
    "Ecosistema institucional de Fondos de Inversión Colectiva (FIC) en Colombia: plataforma SaaS, Funds Connector MCP, Funds Data MCP (SFC), Frontera Índices e Intelligence Skills.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
