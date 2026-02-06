@echo off
REM Quick Setup Script for TypeScript Automation Framework

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
