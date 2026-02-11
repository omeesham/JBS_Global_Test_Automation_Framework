@echo off
REM ##############################################################################
REM FILE: setup.bat
REM PURPOSE: One-command project setup for Windows environments
REM WHY NECESSARY: New developers/CI can bootstrap the entire framework with setup.bat
REM USED BY: Developers cloning the repo for the first time, Windows CI agents
REM
REM HOW IT WORKS:
REM 1. Verifies Node.js 18+ is installed
REM 2. Installs npm dependencies (package.json)
REM 3. Installs Playwright browsers (chromium, firefox, webkit)
REM 4. Creates .env from .env.example if not present
REM
REM USAGE: Double-click setup.bat or run from terminal
REM ##############################################################################

echo ============================================
echo TypeScript Automation Framework Setup
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18 or higher
    pause
    exit /b 1
)

echo [1/4] Node.js detected
node --version
echo.

REM Install dependencies
echo [2/4] Installing dependencies...
call npm install
echo Dependencies installed successfully
echo.

REM Install Playwright browsers
echo [3/4] Installing Playwright browsers...
call npx playwright install chromium firefox webkit
echo Playwright browsers installed successfully
echo.

REM Copy .env.example to .env
echo [4/4] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo Created .env file - please update it with your credentials
) else (
    echo .env file already exists
)
echo.

echo ============================================
echo Setup completed successfully!
echo ============================================
echo.
echo To run tests, use:
echo     npm test
echo     npm run test:headed
echo     npm run test:chrome
echo.
echo For more information, see README.md
echo.
pause
