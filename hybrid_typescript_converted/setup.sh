#!/bin/bash

# Quick Setup Script for TypeScript Automation Framework

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

# Copy .env.example to .env
echo "[4/4] Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file - please update it with your credentials"
else
    echo ".env file already exists"
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
