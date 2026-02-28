#!/bin/bash
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
# 4. Creates .env from .env.example if not present
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

echo "[1/4] Node.js detected"
node --version
echo ""

# Install dependencies
echo "[2/4] Installing dependencies..."
npm install
echo "Dependencies installed successfully"
echo ""

# Install Playwright browsers
echo "[3/4] Installing Playwright browsers..."
npx playwright install chromium firefox webkit
echo "Playwright browsers installed successfully"
echo ""

# Copy config/environments/.env.example to config/environments/.env.local
echo "[4/4] Setting up environment..."
if [ ! -f config/environments/.env.local ]; then
    cp config/environments/.env.example config/environments/.env.local
    echo "Created config/environments/.env.local - please update it with your credentials"
else
    echo "config/environments/.env.local already exists"
fi
echo ""

echo "============================================"
echo "Setup completed successfully!"
echo "============================================"
echo ""
echo "To run tests, use:"
echo "    npm test"
echo "    npm run test:headed"
echo "    npm run test:chrome"
echo ""
echo "For more information, see README.md"
echo ""
