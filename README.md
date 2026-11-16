# Frontera Funds Data MCP

Servidor MCP independiente para consultar, explorar y analizar información pública de Fondos de Inversión Colectiva (FIC) y Fondos de Capital Privado (FCP) vigilados por la Superintendencia Financiera de Colombia. Fuente de publicación: dataset oficial `qhpu-8ixx` de datos.gov.co (Socrata).

## Propósito

Frontera Funds Data MCP es la capa de acceso a datos. Expone información estructurada para que clientes, aplicaciones, agentes y Skills puedan consumirla, transformarla y construir sus propios análisis. No requiere Frontera Funds SaaS ni administra la cuenta de usuario de esa aplicación.

## Conexión de producción

El nombre del repositorio y del servidor MCP se actualiza a `frontera-funds-data-mcp`. Por compatibilidad, el proyecto y dominio Vercel actuales se conservan durante esta reorganización:

- Endpoint MCP: `https://mcp-sfc-fics-colombia.vercel.app/api/mcp`
- Health / catálogo: `https://mcp-sfc-fics-colombia.vercel.app/api/mcp`

El dominio se podrá migrar en una fase posterior, con aliases y clientes coordinados.

## Herramientas

1. `obtener_estado_dataset`
2. `listar_entidades_administradoras`
3. `buscar_fondos_fic`
4. `radiografia_fondo`
5. `ranking_rentabilidades_fics`
6. `cuota_mercado_aum_entidades`
7. `flujos_netos_captacion`
8. `radar_corridas_y_alertas_liquidez`
9. `serie_historica_nav_y_tasas`
10. `metricas_riesgo_cuantitativo`
11. `comparar_peer_group_fics`
12. `ejecutar_soql_avanzado`

Los esquemas y descripciones publicados por `tools/list` son el contrato vigente de cada herramienta.

## Fuentes y autenticación

- Los datos provienen directamente de Socrata/datos.gov.co; el servidor no depende de Frontera Funds SaaS.
- El endpoint MCP requiere OAuth 2.1 con Supabase Auth, con magic link por correo y consentimiento explícito del cliente.
- El control de consumo reutiliza la cuota compartida de Frontera: 2.000 llamadas/mes y 50/minuto por usuario.
- `x-socrata-app-token` es una credencial BYOK opcional del proveedor Socrata; no identifica al usuario ni reemplaza OAuth.
- La metadata OAuth del recurso está disponible en `/api/mcp/oauth-protected-resource`.

## Desarrollo

```bash
npm install
npm run dev
npm run build
npm start
```

## Configuración del cliente MCP

```json
{
  "mcpServers": {
    "frontera-funds-data-mcp": {
      "url": "https://mcp-sfc-fics-colombia.vercel.app/api/mcp"
    }
  }
}
```

El nombre del repositorio y del servidor es `frontera-funds-data-mcp`. El dominio Vercel se conserva temporalmente para mantener compatibilidad con clientes existentes.

## Autenticación y consumo

El endpoint requiere OAuth 2.1 con Supabase Auth, siguiendo el modelo de Frontera Open Data. El usuario inicia sesión por magic link y autoriza explícitamente el cliente MCP. Las cuotas son compartidas entre los MCP del mismo proyecto Supabase: 2.000 llamadas/mes y 50/minuto por usuario. Solo se cuentan operaciones `tools/call`.

Consulta [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md) para el flujo, endpoints, variables y límites. La credencial BYOK de Socrata es independiente de la identidad OAuth.
