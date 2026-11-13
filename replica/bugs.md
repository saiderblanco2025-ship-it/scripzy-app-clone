# Bug Report — Scripzy (clon) · QA 2026-11-13

## Resumen
- Casos de prueba: 12 páginas públicas (sitemap) + 10 endpoints API + 2 páginas auth-gated
- Bugs encontrados: 1 (S3, corregido) · S1: 0 · S2: 0
- Estado: demo-ready externamente. Falta verificación end-to-end de flujos con sesión (manual, en tu navegador).

## Hallazagos → corregidos
| ID | Sev | Descripción | Estado |
|----|-----|-------------|--------|
| QA-001 | S3 | `sitemap.xml` listaba rutas que requieren sesión (/voces, /dashboard, etc.) — Google solo vería el shell de login vacío 🫠 | ✅ Corregido: sitemap ahora solo lista /, /recursos, /terminos, /privacidad |
| QA-002 | S4 | Portada con 3 testimonios con métricas — son de marketing, no de clientes reales verificados | 📝 Documentado: no bloquear |

## Verificado OK
- 12/12 páginas públicas responden HTTP 200 con `<title>` correcto
- 10/10 endpoints API devuelven 401 sin token o 400 en body vacío (ninguno filtra datos)
- Portada: 0 errores y 0 warnings en consola del navegador
- /voces redirige correctamente (302 client-side) a /login para usuarios sin sesión
- robots.txt servido (/api y /admin fuera del indexado)
- Títulos SEO únicos por página (Research, Voces, Biblioteca con su metadata)

## Para verificar por el usuario (no automatizable aquí)
| ID | Sev | Qué verificar | Pasos |
|----|-----|---------------|-------|
| QA-003 | — | Stripe test end-to-end con 4242 | /pricing → Comprar un TOP-UP → 4242 4242 4242 4242, fecha futura, CVC cualquiera → confirmar banner + saldo +500K |
| QA-004 | — | Stripe declined card | Comprar con 4000 0000 0000 0002 → debe mostrarse error de pago, NO cobrarse nada |
| QA-005 | — | Generación real de guion como Free user con 0 créditos | Crear cuenta de prueba (Gmail), vaciar saldo a 0 → "Generar" debe dar 402 con botón a /pricing |
| QA-006 | — | Voces IA desde el navegador | /voces → pegar texto largo → "Narrar mi guion" → escuchar MP3 |

## No automatizado (por diseño)
- Flujos con sesión (login por contraseña/Google) — sin credenciales aquí
- Emails de bienvenida/Stripe recibos
- Accesibilidad profunda (axe) — nada bloquea visualmente
