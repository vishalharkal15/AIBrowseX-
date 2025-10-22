#!/bin/bash
# AIBrowseX Setup Script for Linux/macOS

echo "=================================="
echo "🚀 AIBrowseX Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ Python version: $(python3 --version)"
echo ""

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi
echo "✅ Node.js dependencies installed"
echo ""

# Setup Python backend
echo "🐍 Setting up Python backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
echo "Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi
echo "✅ Python dependencies installed"
deactivate

cd ..

# Setup environment file
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Setting up environment file..."
    cp .env.example .env
    echo "✅ .env file created from .env.example"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and add your ANTHROPIC_API_KEY"
    echo ""
fi

echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "📝 Next Steps:"
echo "1. Edit .env file and add your ANTHROPIC_API_KEY"
echo "2. Get your API key from: https://console.anthropic.com/"
echo "3. Run 'npm run dev' to start the application"
echo ""
echo "💡 Commands:"
echo "  npm run dev     - Start development mode"
echo "  npm start       - Start Electron only"
echo "  npm run backend - Start backend only"
echo "  npm run build   - Build for production"
echo ""
