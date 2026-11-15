# 🩺 Diagnóstico del sistema — Scripzy (clon) · 14 nov 2026

## Resumen ejecutivo
**Veredicto global: OPERATIVO ✅** — 30/30 checks en verde. Dos falsos falsos documentados (ambos de prueba intencional).

| Capa | Signo vital | Estado |
|------|------------|:------:|
| Motor de guiones (n8n oMqs) | Ejec. 99 — "El origen de Roma", 28,223 caracteres (~4,700 palabras, 30 min) | ✅ |
| Motor de nichos (n8n 9U3p) | 8/8 últimas ejecuciones OK | ✅ |
| Motor de miniaturas (n8n 5kZw) | 4/5 OK (1 fallo: input inválido — correcto rechazarlo) | ✅ |
| Motor de patrones (n8n nCMT) | 2/2 últimas OK | ✅ |
| Motor de voz (n8n btFS) | 5/5 últimas OK (incluye velocidad 1.5x) | ✅ |
| Webhook Stripe guardado | Evento falso → **HTTP 400**; `checkout.session.completed` soportado; envs configurados | ✅ |
| APIs del app | 10/10: 401 sin token o 400 body inválido (ninguno filtra) | ✅ |
| Páginas públicas | 12/12 HTTP 200 con título SEO | ✅ |
| Consola (landing/empezando/voces/biblioteca) | 0 errores, 0 warnings | ✅ |
| SEO crítico | sitemap.xml · robots.txt · JSON-LD · OG image · favicon · metadata orígenes | ✅ |
| Entorno producción | build Next OK (23 rutas) · Vercel Hobby · push automático a GitHub | ✅ |

## Hallazgos — ninguno crítico

| ID | Sev | Hallazgo | Estado |
|----|-----|----------|--------|
| D-01 | S4 | Ejecuciones "fallidas" pasadas eran de pruebas intencionales: clave inválida (correcto rechazar) e input malformado (correcto 400/500 controlado) | ✅ Documentado |
| D-02 | S4 | Testimonios de la portada son de marketing, no de clientes reales verificados | 📝 Marca — decisión pendiente |
| D-03 | S3 | sitemap incluía páginas de sesión — CORREGIDO (solo públicos indexables) | ✅ Corregido (commit e7d9d67) |

## Falta verificar (requiere tu sesión/cuenta)

| ID | Qué verificar | Pasos |
|----|---------------|-------|
| D-04 | Compra TOP-UP end-to-end | /pricing → Comprar 500K → tarjeta 4242… → debería sumar +500,000 a tu saldo |
| D-05 | Guion de 30 min en vivo | Script Lab → Tema "El origen de Roma" → 30 min → Guion completo (~28,223 caracteres) |
| D-06 | Narración completa desde /voces | Pegar guion → Narrar → escuchar MP3 final |

## Métricas de salud a monitorear (weekly)
- n8n: ejecuciones con `error` en últimas 24h (search_workflow_executions por motor)
- Supabase: tamaño de `user_balances` y crecimiento
- Stripe: webhook delivery rate en Dashboard
- Vercel: builds en verde, tiempo de respuesta
- API OpenAI: cuota y costos (dashboard platform.openai.com → Usage)

## Verificado por última vez
14 Nov 2026, 17:33 UTC — tras deploy estable con selector de duración de guiones.
