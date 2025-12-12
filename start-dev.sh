#!/bin/bash

echo "🚀 Starting WordIT Development Environment"
echo "=========================================="
echo "Backend: Bun + ExpressJS + TypeScript + Prisma ORM"
echo "Frontend: React + TypeScript + Vite"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required dependencies
echo "📋 Checking dependencies..."

if ! command_exists bun; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Node.js/npm is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ All dependencies found!"

# Start backend
echo ""
echo "🔧 Starting Backend (Bun + Express + Prisma)..."
cd FP-PemrogramanWebsite-BE-2025

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies with Bun..."
    bun install
fi

# Check if database is set up
if [ ! -f ".env.development" ]; then
    echo "⚠️  No .env.development found. Please set up your database configuration."
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
bun run generate

# Start backend in background
echo "🌐 Starting backend server on http://localhost:4000..."
bun run start:dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend
echo ""
echo "🎨 Starting Frontend (React + Vite)..."
cd ..

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies with npm..."
    npm install
fi

# Start frontend
echo "🌐 Starting frontend server on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Development environment is ready!"
echo "=================================="
echo "🔗 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:4000"
echo "🎮 Watch & Memorize Game: http://localhost:5173/watch-and-memorize"
echo ""
echo "📝 Note: Make sure PostgreSQL is running and configured in backend/.env.development"
echo ""
echo "⏹️  Press Ctrl+C to stop both servers"

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap for cleanup
trap cleanup INT TERM

# Wait for user to stop
wait