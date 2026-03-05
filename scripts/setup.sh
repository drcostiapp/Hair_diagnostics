#!/bin/bash
# Dr. Costi AR Avatar - Development Setup Script

set -e

echo "========================================="
echo "Dr. Costi AR Avatar - Development Setup"
echo "========================================="

# Check prerequisites
echo ""
echo "[1/5] Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is required. Install Node.js 20+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "ERROR: Node.js 20+ required. Current version: $(node --version)"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

echo "  Node.js: $(node --version)"
echo "  pnpm: $(pnpm --version)"
echo "  OK"

# Install dependencies
echo ""
echo "[2/5] Installing dependencies..."
pnpm install

# Setup environment
echo ""
echo "[3/5] Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "  Created .env from .env.example"
    echo "  IMPORTANT: Update .env with your actual API keys"
else
    echo "  .env already exists, skipping"
fi

# Check Docker (optional)
echo ""
echo "[4/5] Checking Docker (optional)..."
if command -v docker &> /dev/null; then
    echo "  Docker: $(docker --version)"
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        echo "  Docker Compose: available"
        echo "  To start databases: cd infrastructure && docker compose up -d postgres redis"
    fi
else
    echo "  Docker not found (optional - needed for local PostgreSQL/Redis)"
    echo "  You can use external PostgreSQL and Redis instances instead"
fi

# Summary
echo ""
echo "[5/5] Setup complete!"
echo ""
echo "========================================="
echo "Quick Start Commands:"
echo "========================================="
echo ""
echo "  Start databases (Docker):   cd infrastructure && docker compose up -d postgres redis"
echo "  Run migrations:             pnpm --filter backend-api db:migrate"
echo "  Seed knowledge base:        pnpm --filter backend-api db:seed"
echo "  Start backend API:          pnpm dev:api"
echo "  Start web client:           pnpm dev:web"
echo "  Start everything (Docker):  cd infrastructure && docker compose up"
echo ""
echo "========================================="
echo "IMPORTANT: Update .env with your API keys:"
echo "  - HEYGEN_API_KEY"
echo "  - JWT_SECRET (generate a secure secret)"
echo "  - ENCRYPTION_KEY (generate a 32-byte hex key)"
echo "========================================="
