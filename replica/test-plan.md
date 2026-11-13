# Test Plan — Scripzy (clon YouTube IA) · 2026-11-13

Flujos del CLON (no del original). Casos: H=happy, E=edge, N=negative.

## F01 · Landing pública `/`
- H1: carga en <2s, título "Scripzy — Tu Guionista…", video hero visible, CTA "Comenzar prueba gratuita" → /login/registro
- E1: móvil 375px (sin salto de layout), E2: primera visita con caché fría
- N1: /robots.txt servido con 200, N2: /sitemap.xml válido con todas las rutas públicas

## F02 · Registro / Login (`/login`)
- H1: ruta pública, formulario visible, "Iniciar sesión con Google" funciona
- E1: usuario ya autenticado → redirige a /dashboard
- E2: contraseña incorrecta → mensaje de error claro (no página en blanco)
- N1: email con formato inválido → rechazo client-side

## F03 · Dashboard `/dashboard` (requiere sesión)
- H1: usuario autenticado ve saldo en caracteres y miniaturas, barra de uso, guiones recientes
- E1: usuario sin scripts → estado vacío con CTA "Crea el primero"
- E2: con créditos bajos → aviso/estado visible
- N1: sin sesión → redirect a /login

## F04 · Script Lab `/script-lab` (requiere sesión)
- H1: genera guion → detecta créditos descontados y botón "Copiar/Word"
- E1: vacío → validación "escribe un tema"; E2: texto con emojis y tildes
- E3: doble clic en "Generar" → no duplica generación
- E4: refresh a media generación → no se pierde la sesión/historial
- N1: sin sesión → redirect /login; N2: sin créditos → 402 + upsell a /pricing

## F05 · Buscador de Nichos `/nichos`
- H1: "historia antigua" → lista rankeada con RPM/demanda/competencia
- E1: gibberish / 1 carácter → validación
- N1: motor caído (simulado) → mensaje de error legible, no 500 plano

## F06 · Stripe `/pricing` (requiere sesión para comprar)
- H1: elegir plan → redirect a checkout de Stripe (test mode)
- E1: tarjeta declinada 4000000000000002 → fallo claro
- E2: volver a /pricing con ?topup=success → nota de créditos sumados

## F07 · Panel admin `/admin` (requiere superadmin)
- H1: superadmin → métricas y tabla de usuarios, superadmin badge
- N1: usuario normal → "Acceso restringido" (403/contenido) y sin datos globales

## F08 · Voces IA `/voces` (requiere sesión)
- H1: texto largo → MP3 generado, player funcional, "Mis narraciones" lista enlace
- E1: 0 caracteres → botón deshabilitado; E2: 20,000+ caracteres → error 400 legible
- E3: doble clic en "Narrar" → deshabilitado mientras carga

## F09 · Errores y páginas stale
- H1: /ruta-inexistente → 404 con estilo + enlace a /dashboard
- N1: /api/* sin token → 401 JSON (no HTML)
- N2: /terminos, /privacidad → 200 con contenido real
