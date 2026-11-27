# Registro de la decisión de autenticación — Frontera Funds Data MCP

Las observaciones de infraestructura y despliegue de este registro corresponden a la integración anterior; no acreditan el estado actual. Para la configuración y los créditos vigentes, consultar [AUTHENTICATION.md](./AUTHENTICATION.md).

**Decisión:** adoptar OAuth 2.1 + Supabase Auth compartido con Frontera OpenData, con consumo separado por usuario y producto.

**Estado:** implementado en `main` y desplegado en Production. Commit de integración: `e102b5144b3ef75526870bde82db40a32718f50c`. Deployment Vercel: `dpl_FyypaFNt7tssrHAayiSX457UvAx5` (`READY`).

## Fundamento

- El proyecto Supabase `laankpkyvzeierrnktte` está activo y saludable.
- El acceso por correo/magic link está habilitado; Google no está habilitado.
- Las migraciones `202611130001_mcp_usage_quotas` y `202611150001_mcp_multi_source_quotas` ya están aplicadas.
- El código actual consulta `public.check_mcp_quota` y registra el resultado con `public.record_mcp_usage`, por usuario y `product_key`. El plan gratuito incluye 1.500 créditos por mes calendario UTC y por MCP, compartidos entre los asistentes de la misma cuenta. Un crédito equivale a una llamada `tools/call` exitosa. Los errores de fuente no consumen créditos mensuales, pero cuentan dentro del límite Free de 30 intentos por minuto.
- El Data MCP comparte identidad Supabase, pero mantiene su propio saldo de créditos mediante `product_key=funds_data`. La Suite otorga una cuota por cada MCP.

El Data MCP mantiene su independencia funcional y de datos: comparte identidad y la infraestructura de control de consumo, con saldos separados por producto. No depende de Firebase ni de la sesión privada de Frontera Funds SaaS.

La cuota actual requiere la migración `202611220001_mcp_product_quotas_and_billable_usage.sql` del repositorio OpenData. Verificar su aplicación en el proyecto destino; esta documentación no acredita su estado en producción.

La implementación se documenta en [`AUTHENTICATION.md`](./AUTHENTICATION.md).

## Evidencia histórica de producción (anterior al dominio oficial)

- Protected Resource Metadata: `https://mcp-sfc-fics-colombia.vercel.app/api/mcp/oauth-protected-resource` responde HTTP 200 y anuncia como Authorization Server `https://laankpkyvzeierrnktte.supabase.co/auth/v1`.
- El endpoint de recursos permanece en `https://mcp-sfc-fics-colombia.vercel.app/api/mcp`.
- La experiencia de inicio de sesión/consentimiento usa la página compartida de Frontera Open Data, con copy genérico para todos los servicios MCP.
- CI: `npm install`, pruebas, TypeScript y build completados correctamente.
- Pendiente de aceptación: completar una conexión OAuth real desde un cliente MCP con una cuenta de usuario, incluyendo magic link, consentimiento, intercambio de token y una llamada autenticada a herramienta. No declarar ese flujo E2E como probado hasta ejecutarlo.
