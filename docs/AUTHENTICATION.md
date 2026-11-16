# Autenticación y consumo — Frontera Funds Data MCP

## Modelo

El servidor utiliza OAuth 2.1 con Supabase Auth, siguiendo el patrón desplegado en Frontera Open Data. El proyecto Supabase compartido es `laankpkyvzeierrnktte`; el inicio de sesión y el consentimiento permanecen alojados en `https://mcp-frontera-opendata.vercel.app`.

1. El cliente solicita `https://mcp-sfc-fics-colombia.vercel.app/api/mcp`.
2. El servidor publica Protected Resource Metadata (RFC 9728) en `/api/mcp/oauth-protected-resource` y anuncia el authorization server Supabase.
3. El cliente inicia OAuth 2.1 Authorization Code + PKCE.
4. El usuario inicia sesión mediante magic link por correo en Frontera Open Data y aprueba explícitamente la aplicación cliente.
5. Supabase emite el token; `withSupabase({ auth: "user" })` valida la identidad antes de permitir acceso al MCP.
6. El cliente presenta el bearer token en cada solicitud MCP. No hay API key compartida.

El inicio de sesión actual usa correo/magic link. Google no está habilitado en el proyecto Supabase compartido.

## Cuotas

Se reutiliza `public.consume_mcp_quota`, ya desplegada en Supabase. No se crea una tabla ni un contador paralelo.

- 2.000 llamadas a herramientas por usuario y mes calendario UTC.
- 50 llamadas por usuario en una ventana móvil de 60 segundos.
- Solo se contabilizan operaciones JSON-RPC `tools/call`; `initialize`, `ping`, `tools/list`, metadata y notificaciones no consumen cuota.
- Los lotes cuentan cada `tools/call` y se limitan a 100 llamadas por lote.
- Las cuotas son compartidas entre los MCP del mismo proyecto Supabase; no son 2.000 llamadas independientes por servidor.
- Funds se etiqueta con `source_id = frontera_funds` y registra el primer nombre de herramienta en `tool_name`.
- El RPC serializa solicitudes concurrentes por usuario y purga eventos antiguos de forma oportunista después de 90 días.

## Socrata BYOK

`x-socrata-app-token` sigue siendo una credencial técnica opcional de Socrata. No identifica al usuario ni sustituye el bearer OAuth. Preferir el header y no transmitir tokens por query string.

## Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo servidor)
- `SOCRATA_APP_TOKEN` (opcional)

Vercel mantiene únicamente las tres variables Supabase necesarias para autenticación y cuotas. No se requieren credenciales PostgreSQL ni el JWT secret del proyecto.

## Endpoints

- MCP: `https://mcp-sfc-fics-colombia.vercel.app/api/mcp`
- Protected Resource Metadata: `https://mcp-sfc-fics-colombia.vercel.app/api/mcp/oauth-protected-resource`
- Authorization Server: `https://laankpkyvzeierrnktte.supabase.co/auth/v1`

## Seguridad

- El endpoint exige bearer token validado; no existe fallback a `MCP_API_KEY` ni `api_key` en query string.
- El RPC usa service role en servidor; la tabla mantiene RLS y `anon`/`authenticated` no pueden invocar el RPC.
- La credencial Socrata permanece separada de Supabase.
- Las cuotas fallan cerradas: si Auth o el RPC no están disponibles, no se ejecuta la herramienta.
