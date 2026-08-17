@echo off
REM Ensure we're running in cmd.exe, not Git Bash
if defined MSYSTEM (
    echo ERROR: This script must be run in Command Prompt, not Git Bash.
    echo Right-click setup.bat and select "Open" or run: cmd /c setup.bat
    exit /b 1
)

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

echo [1/3] Node.js detected
node --version
echo.

REM Install dependencies
echo [2/3] Installing dependencies...
call npm install
echo Dependencies installed successfully
echo.

REM Install Playwright browsers
echo [3/3] Installing Playwright browsers...
call npx playwright install chromium firefox webkit
echo Playwright browsers installed successfully
echo.

echo.
echo ============================================
echo Setup completed successfully!
echo ============================================
echo.
echo NOTE: Each client has its own .env files under clients\^<id^>.
echo       See the client README or clients\^<id^>\.env.e2e for the required keys.
echo       Create a .env.local in the client directory for local credentials.
echo.
echo To run tests, use:
echo     npm test
echo     npm run test:headed
echo     npm run test:chrome
echo.
echo For more information, see README.md
echo.
pause
