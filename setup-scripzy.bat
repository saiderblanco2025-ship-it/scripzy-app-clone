@echo off
title Scripzy.app Clone - Setup Script
cd D:\Desktop\N8N CODE2

echo.
echo ==========================================
echo   SCRIPZY.APP CLONE - SETUP INICIAL
echo ==========================================
echo.

echo [1/6] Verificando archivos necesarios...
if not exist package.json (
    echo ERROR: package.json no encontrado.
    pause
    exit /b 1
)
if not exist tailwind.config.js (
    echo ERROR: tailwind.config.js no encontrado.
    pause
    exit /b 1
)
if not exist next.config.js (
    echo ERROR: next.config.js no encontrado.
    pause
    exit /b 1
)
if not exist tsconfig.json (
    echo ERROR: tsconfig.json no encontrado.
    pause
    exit /b 1
)
if not exist .env.local (
    echo WARNING: Archivo .env.local no existe. Se creará uno básico...
    echo NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co > .env.local
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key >> .env.local
    echo STRIPE_SECRET_KEY=sk_test_tu_clave >> .env.local
    echo STRIPE_WEBHOOK_SECRET=whsec_tu_secreto >> .env.local
    echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local
    echo.
    echo Archivo .env.local creado automáticamente.
    echo Por favor, edítalo con tus credenciales reales.
)

echo.
echo [2/6] Instalando dependencias de npm...
npm install 2>&1 | find "failed" >nul
if %errorlevel% equ 0 (
    echo ✅ Dependencias instaladas correctamente.
) else (
    echo ⚠️ Algunas dependencias pudieron no instalarse. Revisar salida anterior.
)

echo.
echo [3/6] Configurando Supabase...
echo Por favor, ve a https://supabase.com y crea un proyecto.
echo 1. Ve a SQL Editor
echo 2. Ejecuta el contenido de: supabase/sql/20240101_initial_schema.sql
echo 3. Crea un bucket llamado "thumbnails" en Storage
echo.

echo.
echo [4/6] Configurando Stripe...
echo Ve a https://dashboard.stripe.com/dashboard
echo 1. Crea 5 Products: free, starter, pro, premium, ultra
echo 2. Crea Prices mensuales para cada producto
echo 3. Configura Webhooks en: http://localhost:3000/api/webhooks/stripe
echo 4. Copia tus claves a .env.local
echo.

echo.
echo [5/6] Levantando el servidor...
echo Ejecutando: npm run dev
echo.

echo.
echo [6/6] Accediendo a la aplicación...
echo Abre tu navegador en: http://localhost:3000
echo.

echo ==========================================
echo   INSTRUCCIONES DETALLADAS
echo ==========================================
echo 1. Espera a que npm install termine
echo 2. Configura Supabase ejecutando el SQL migration
echo 3. Configura Stripe en el dashboard
echo 4. Revisa que .env.local tenga tus claves reales
echo 5. Ejecuta "npm run dev"
echo 6. Abre http://localhost:3000
echo.
pause