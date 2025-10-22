@echo off
REM AIBrowseX Setup Script for Windows

echo ==================================
echo 🚀 AIBrowseX Setup
echo ==================================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.10+ first.
    exit /b 1
)

node --version
python --version
echo.

REM Install Node dependencies
echo 📦 Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    exit /b 1
)
echo ✅ Node.js dependencies installed
echo.

REM Setup Python backend
echo 🐍 Setting up Python backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    exit /b 1
)
echo ✅ Python dependencies installed
call deactivate

cd ..

REM Setup environment file
if not exist ".env" (
    echo.
    echo ⚙️  Setting up environment file...
    copy .env.example .env
    echo ✅ .env file created from .env.example
    echo.
    echo ⚠️  IMPORTANT: Edit .env file and add your ANTHROPIC_API_KEY
    echo.
)

echo ==================================
echo ✅ Setup Complete!
echo ==================================
echo.
echo 📝 Next Steps:
echo 1. Edit .env file and add your ANTHROPIC_API_KEY
echo 2. Get your API key from: https://console.anthropic.com/
echo 3. Run 'npm run dev' to start the application
echo.
echo 💡 Commands:
echo   npm run dev     - Start development mode
echo   npm start       - Start Electron only
echo   npm run backend - Start backend only
echo   npm run build   - Build for production
echo.
pause
