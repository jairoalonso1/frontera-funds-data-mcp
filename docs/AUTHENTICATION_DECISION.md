# Decisión de autenticación — Frontera Funds Data MCP

**Estado:** propuesta recomendada; implementación pendiente.

## Estado actual verificado

- El endpoint usa `checkMcpAuth` con `MCP_API_KEY` opcional.
- Si `MCP_API_KEY` no existe o está vacío, `checkMcpAuth` permite la solicitud.
- La configuración actual del proyecto Vercel no presenta variables de entorno configuradas. Por tanto, el endpoint está actualmente abierto.
- `x-socrata-app-token` / `app_token` entrega una credencial al proveedor Socrata para consumir sus límites; no autentica al usuario ante Frontera.

## Referencia Frontera Open Data

El repositorio `MCP-Frontera-OpenData` implementa OAuth 2.1 con Supabase Auth, consentimiento, verificación de identidad y control de cuotas por usuario/fuente mediante RPC. Es una referencia más completa que proteger el endpoint con una API key compartida.

## Recomendación

Adoptar el mismo patrón de producto de Frontera Open Data: OAuth 2.1 + Supabase Auth + cuotas de consumo por usuario/plan/fuente. Reutilizar componentes y decisiones técnicas probadas, no copiar indiscriminadamente todo el código.

- Mantener el Data MCP independiente de Firebase y de la sesión privada de Frontera Funds SaaS.
- Mantener la credencial Socrata BYOK separada de la identidad Frontera.
- Preferir `Authorization: Bearer` y no enviar credenciales de identidad en query strings.
- Diseñar cuotas por herramientas/dataset y plan comercial.
- Mantener la procedencia y fecha de recuperación de cada respuesta.

## Antes de activar OAuth en producción

1. Definir si Data MCP será abierto, freemium o de pago y sus cuotas.
2. Decidir si comparte el proyecto Supabase de Frontera Open Data o usa un proyecto/tenant separado.
3. Definir el vínculo de identidad entre Supabase y Firebase (si se requiere experiencia de cuenta unificada); no asumir que compartir correo equivale a vincular cuentas.
4. Crear y probar las tablas/RPC de cuotas, con pruebas de concurrencia y límites.
5. Configurar secretos en Vercel Preview y probar clientes MCP compatibles antes del cambio de producción.
6. Activar autenticación con una transición documentada; no bloquear consumidores actuales sin aviso.

La propuesta es reutilizar el patrón OAuth/cuotas de Open Data. No se ha cambiado el comportamiento de acceso del endpoint en esta reorganización.
