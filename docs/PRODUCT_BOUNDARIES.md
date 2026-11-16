# Frontera Funds Data MCP — límites de producto

Este repositorio ofrece acceso independiente a datos públicos de FIC/FCP publicados por la SFC en datos.gov.co. Su función es consultar, normalizar y exponer datos; no necesita ni depende de Frontera Funds SaaS.

El motor de categorización se mantiene en el repositorio independiente `Frontera-Indices`. Las Skills pueden consumir los resultados de categorización y los datos del MCP, pero el algoritmo de clasificación no se duplica aquí.

El Connector de Frontera Funds mantiene su autenticación Firebase para operaciones ligadas a la cuenta SaaS. Este Data MCP tendrá su propio esquema de identidad y cuotas, desacoplado de las operaciones privadas de la SaaS.
