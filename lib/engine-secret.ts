/**
 * Clave secreta compartida entre la app y los webhooks de n8n.
 * Cada webhook de n8n valida el header `X-Scripzy-Key` contra este valor
 * (nodo "Validar Clave") y rechaza llamadas sin la clave correcta.
 * Solo se usa en el servidor (rutas API); nunca llega al navegador.
 */
export const ENGINE_SECRET = "scripzy_wsk_u73z6fz73t4rxqtg5mwprvwt";

export const ENGINE_SECRET_HEADER = "X-Scripzy-Key";
