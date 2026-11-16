# Decisión de autenticación — Frontera Funds Data MCP

**Decisión:** adoptar OAuth 2.1 + Supabase Auth compartido con Frontera Open Data y reutilizar su cuota global por usuario.

**Implementación:** rama `feat/supabase-oauth-shared-quotas`, pendiente de pruebas, revisión y despliegue.

## Fundamento

- El proyecto Supabase `laankpkyvzeierrnktte` está activo y saludable.
- El acceso por correo/magic link está habilitado; Google no está habilitado.
- Las migraciones `202611130001_mcp_usage_quotas` y `202611150001_mcp_multi_source_quotas` ya están aplicadas.
- `public.consume_mcp_quota` registra usuario, fuente y herramienta, serializa solicitudes concurrentes y conserva los límites compartidos de 2.000 llamadas/mes y 50/minuto.
- El Data MCP comparte identidad y saldo de cuota con los demás MCP conectados a este proyecto.

La clave de firma activa del proyecto es ES256; la clave HS256 anterior figura como `previously_used`. El Data MCP verifica los JWT contra JWKS y fija el issuer al proyecto, sin copiar secretos de firma al servidor.

El Data MCP mantiene su independencia funcional y de datos: solo comparte identidad y control de consumo. No depende de Firebase ni de la sesión privada de Frontera Funds SaaS.

La implementación se documenta en [`AUTHENTICATION.md`](./AUTHENTICATION.md).
