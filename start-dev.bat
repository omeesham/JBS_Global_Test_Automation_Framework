@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   Encore Framework - Development Startup
echo ============================================
echo.

:: -------------------------------------------
:: Check prerequisites
:: -------------------------------------------

:: Check Docker (optional — needed only for PostgreSQL)
where docker >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker found
    docker info >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Docker daemon is running
        echo      Starting PostgreSQL via docker-compose...
        docker-compose up -d
        echo      Waiting 3s for PostgreSQL to be ready...
        timeout /t 3 /nobreak >nul
    ) else (
        echo [WARN] Docker found but daemon not running — skipping PostgreSQL
        echo        Start Docker Desktop manually if you need the database.
    )
) else (
    echo [WARN] Docker not installed — skipping PostgreSQL
    echo        Install Docker Desktop or run PostgreSQL natively for full demo.
)

:: Check if PostgreSQL is reachable (native or Docker)
where psql >nul 2>&1
if %errorlevel% equ 0 (
    psql -h localhost -U postgres -d postgres -c "SELECT 1" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] PostgreSQL is reachable on :5432
    ) else (
        echo [WARN] PostgreSQL not responding on :5432 — backends may fail on DB calls
    )
) else (
    echo [INFO] psql not in PATH — cannot verify PostgreSQL, continuing anyway
)

:: Check Claude CLI (needed for worker)
where claude >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Claude CLI found
) else (
    echo [WARN] Claude CLI not found — worker will not start
    echo        Install: https://docs.anthropic.com/claude-code
)

echo.

:: -------------------------------------------
:: Start services with auto-restart loops
:: Each runs in its own window and restarts on crash
:: -------------------------------------------

echo Starting Encore backend on :3100 (auto-restart) ...
start "Encore Backend :3100" cmd /c "%~dp0scripts\restart-loop.bat" "Encore" "cd /d %~dp0 && npm run server:dev"

echo Starting Website backend on :3001 (auto-restart) ...
start "Website Backend :3001" cmd /c "%~dp0scripts\restart-loop.bat" "Backend" "cd /d %~dp0website\backend && npm run dev"

echo Starting Frontend on :5173 (auto-restart) ...
start "Frontend :5173" cmd /c "%~dp0scripts\restart-loop.bat" "Frontend" "cd /d %~dp0website\frontend && npm run dev"

echo Starting Worker (auto-restart) ...
start "Worker" cmd /c "%~dp0scripts\restart-loop.bat" "Worker" "cd /d %~dp0 && npm run worker:start"

echo.
echo ============================================
echo   All servers starting (with auto-restart):
echo.
echo   Frontend:        http://localhost:5173
echo   Website Backend: http://localhost:3001
echo   Encore Backend:  http://localhost:3100
echo.
echo   Login: superadmin / EncoreAdmin@2026
echo ============================================
echo.
echo Close this window or press Ctrl+C to stop.
pause
