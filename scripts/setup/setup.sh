#!/bin/bash
set -e
###############################################################################
# FILE: setup.sh
# PURPOSE: One-command project setup for Linux/macOS environments
# WHY NECESSARY: New developers/CI can bootstrap the entire framework with ./setup.sh
# USED BY: Developers cloning the repo for the first time, CI/CD environments
#
# HOW IT WORKS:
# 1. Verifies Node.js 18+ is installed
# 2. Installs npm dependencies (package.json)
# 3. Installs Playwright browsers (chromium, firefox, webkit)
#
# USAGE: chmod +x setup.sh && ./setup.sh
###############################################################################

echo "============================================"
echo "TypeScript Automation Framework Setup"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 18 or higher"
    exit 1
fi

echo "[1/3] Node.js detected"
node --version
echo ""

# Install dependencies
echo "[2/3] Installing dependencies..."
npm install
echo "Dependencies installed successfully"
echo ""

# Install Playwright browsers
echo "[3/3] Installing Playwright browsers..."
npx playwright install chromium firefox webkit
echo "Playwright browsers installed successfully"
echo ""

echo "============================================"
echo "Setup completed successfully!"
echo "============================================"
echo ""
echo "NOTE: Each client has its own .env files under clients/<id>/."
echo "      See the client README or clients/<id>/.env.e2e for the required keys."
echo "      Create a .env.local in the client directory for local credentials."
echo ""
echo "To run tests, use:"
echo "    npm test"
echo "    npm run test:headed"
echo "    npm run test:chrome"
echo ""
echo "For more information, see README.md"
echo ""
