# Decisión de autenticación — Frontera Funds Data MCP

**Decisión:** adoptar OAuth 2.1 + Supabase Auth compartido con Frontera Open Data y reutilizar su cuota global por usuario.

**Estado:** implementado en `main` y desplegado en Production. Commit de integración: `e102b5144b3ef75526870bde82db40a32718f50c`. Deployment Vercel: `dpl_FyypaFNt7tssrHAayiSX457UvAx5` (`READY`).

## Fundamento

- El proyecto Supabase `laankpkyvzeierrnktte` está activo y saludable.
- El acceso por correo/magic link está habilitado; Google no está habilitado.
- Las migraciones `202611130001_mcp_usage_quotas` y `202611150001_mcp_multi_source_quotas` ya están aplicadas.
- `public.consume_mcp_quota` registra usuario, fuente y herramienta, serializa solicitudes concurrentes y conserva los límites compartidos de 2.000 llamadas/mes y 50/minuto.
- El Data MCP comparte identidad y saldo de cuota con los demás MCP conectados a este proyecto.

El Data MCP mantiene su independencia funcional y de datos: solo comparte identidad y control de consumo. No depende de Firebase ni de la sesión privada de Frontera Funds SaaS.

La implementación se documenta en [`AUTHENTICATION.md`](./AUTHENTICATION.md).

## Verificación de producción

- Protected Resource Metadata: `https://mcp-sfc-fics-colombia.vercel.app/api/mcp/oauth-protected-resource` responde HTTP 200 y anuncia como Authorization Server `https://laankpkyvzeierrnktte.supabase.co/auth/v1`.
- El endpoint de recursos permanece en `https://mcp-sfc-fics-colombia.vercel.app/api/mcp`.
- La experiencia de inicio de sesión/consentimiento usa la página compartida de Frontera Open Data, con copy genérico para todos los servicios MCP.
- CI: `npm install`, pruebas, TypeScript y build completados correctamente.
- Pendiente de aceptación: completar una conexión OAuth real desde un cliente MCP con una cuenta de usuario, incluyendo magic link, consentimiento, intercambio de token y una llamada autenticada a herramienta. No declarar ese flujo E2E como probado hasta ejecutarlo.
