# Autenticación y créditos — Frontera Funds Data MCP

El endpoint oficial es `https://funds-data.fronteraeficiente.com/api/mcp`. Usa OAuth 2.1 con Supabase Auth, acceso por correo y consentimiento del usuario. Comparte identidad con Frontera OpenData; mantiene su consumo separado mediante `product_key=funds_data`.

## Plan gratuito

- 1.500 créditos por mes calendario UTC y por MCP, compartidos entre los asistentes de la misma cuenta.
- Un crédito equivale a una llamada de herramienta `tools/call` exitosa. En un lote se contabiliza cada llamada exitosa.
- Los errores de fuente no consumen créditos mensuales, pero cuentan en el límite Free de 30 intentos por minuto.
- `initialize`, `tools/list` y los metadatos OAuth no consumen créditos.
- La Suite otorga una cuota por cada MCP; no mezcla ambos saldos.

El código consulta `public.check_mcp_quota` antes de ejecutar y registra el resultado con `public.record_mcp_usage`. La cuota requiere la migración `202611220001_mcp_product_quotas_and_billable_usage.sql` del repositorio OpenData. Verificar su aplicación en el proyecto destino; esta documentación no acredita el estado de producción.

## Configuración y validación

Configurar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y la clave de servidor `SUPABASE_SERVICE_ROLE_KEY`. La credencial opcional `SOCRATA_APP_TOKEN` pertenece al proveedor de datos y no sustituye la identidad OAuth. No exponer la clave de servidor en el navegador.

El cliente descubre el recurso en `/.well-known/oauth-protected-resource` y el servidor de autorización en `/.well-known/oauth-authorization-server`. El emisor real continúa siendo Supabase; no debe sustituirse por el dominio del MCP. Los tokens se verifican con JWKS.

Validar en el proyecto destino: acceso por correo, consentimiento, canje de tokens, llamada de herramienta autenticada, renovación, separación de saldos por producto y límites del plan gratuito. Las pruebas locales y las evidencias históricas no sustituyen esa comprobación.

Este MCP no depende de Firebase ni de una sesión privada de Frontera Funds SaaS. El registro de la integración anterior se conserva en [AUTHENTICATION_DECISION.md](./AUTHENTICATION_DECISION.md).
