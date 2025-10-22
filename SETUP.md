# 🚀 AIBrowseX - Complete Setup Guide

This guide will walk you through setting up and running AIBrowseX on your system.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js 18+** and npm
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` && `npm --version`

2. **Python 3.10+**
   - Download from: https://www.python.org/downloads/
   - Verify installation: `python --version` or `python3 --version`

3. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

### Required API Keys

4. **Anthropic API Key**
   - Sign up at: https://console.anthropic.com/
   - Navigate to API Keys section
   - Create a new API key
   - Keep it safe - you'll need it in the setup

## 🛠️ Installation Methods

### Method 1: Automated Setup (Recommended)

#### On Linux/macOS:
```bash
cd /home/vishal/Desktop/dev
chmod +x setup.sh
./setup.sh
```

#### On Windows:
```cmd
cd C:\path\to\dev
setup.bat
```

The setup script will:
- ✅ Check prerequisites
- ✅ Install Node.js dependencies
- ✅ Create Python virtual environment
- ✅ Install Python dependencies
- ✅ Create .env file from template

### Method 2: Manual Setup

#### Step 1: Install Node.js Dependencies
```bash
cd /home/vishal/Desktop/dev
npm install
```

#### Step 2: Setup Python Backend

**On Linux/macOS:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
```

**On Windows:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
deactivate
cd ..
```

#### Step 3: Configure Environment Variables
```bash
cp .env.example .env
```

Edit the `.env` file:
```bash
nano .env  # or use your preferred editor
```

Add your Anthropic API key:
```env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# Optional configurations
BACKEND_HOST=localhost
BACKEND_PORT=8000
DATABASE_PATH=./db/aibrowsex.db
DEFAULT_HOME_URL=https://www.google.com
```

## 🎯 Running the Application

### Option 1: Development Mode (Recommended)

This starts both the backend and Electron app automatically:

```bash
npm run dev
```

The command will:
1. Start the FastAPI backend on `http://localhost:8000`
2. Wait for backend to be ready
3. Launch the Electron app

### Option 2: Run Components Separately

Useful for debugging or development:

**Terminal 1 - Start Backend:**
```bash
npm run backend
# Or manually:
# cd backend && source venv/bin/activate && python -m uvicorn main:app --reload
```

**Terminal 2 - Start Electron:**
```bash
npm start
```

### Option 3: Run Frontend Only

If you want to test the UI without AI features:
```bash
npm start
```

## 🏗️ Building for Production

### Build for All Platforms
```bash
npm run build
```

This creates installers for Windows, macOS, and Linux in the `dist/` folder.

### Build for Specific Platforms

**Windows:**
```bash
npm run build:win
```
Creates: `dist/AIBrowseX Setup.exe` (NSIS installer)

**macOS:**
```bash
npm run build:mac
```
Creates: `dist/AIBrowseX.dmg`

**Linux:**
```bash
npm run build:linux
```
Creates: `dist/AIBrowseX.AppImage` and `dist/aibrowsex.deb`

## 🧪 Testing the Setup

### 1. Check Backend Health

Open your browser and visit:
```
http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "AIBrowseX Backend",
  "version": "1.0.0",
  "ai_available": true
}
```

### 2. Test API Documentation

Visit the interactive API docs:
```
http://localhost:8000/docs
```

### 3. Test in Electron

1. Launch the app: `npm run dev`
2. Navigate to any website
3. Click the AI button (💬) to open the sidebar
4. Try asking a question about the page
5. Test the Summary and Analyze features

## 📁 Project Structure

```
AIBrowseX/
├── main.js                 # Electron main process
├── preload.js             # Secure IPC bridge
├── package.json           # Node.js configuration
├── .env                   # Environment variables (create this!)
├── .env.example           # Environment template
│
├── renderer/              # Frontend UI
│   ├── index.html        # Main interface
│   ├── styles.css        # Styling
│   └── renderer.js       # UI logic
│
├── db/                    # Database layer
│   └── database.js       # SQLite operations
│
├── backend/               # FastAPI backend
│   ├── main.py           # API endpoints
│   ├── requirements.txt  # Python dependencies
│   └── venv/             # Python virtual environment (created by setup)
│
├── assets/               # Application assets
│   └── icon.png          # App icon (add your own)
│
└── dist/                 # Build output (created by npm run build)
```

## 🔧 Troubleshooting

### Backend Won't Start

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### AI Features Don't Work

**Problem:** "AI backend is not available"

**Solutions:**
1. Ensure `.env` file exists with valid `ANTHROPIC_API_KEY`
2. Check backend is running: `curl http://localhost:8000/health`
3. Verify API key at https://console.anthropic.com/

### Electron Window Blank

**Problem:** White/blank screen on startup

**Solutions:**
1. Open DevTools (Ctrl+Shift+I / Cmd+Option+I)
2. Check console for errors
3. Ensure `renderer/` files exist
4. Try: `npm install` and restart

### Build Errors

**Problem:** `electron-builder` fails

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use

**Problem:** Backend fails with "Address already in use"

**Solutions:**
```bash
# Find and kill process on port 8000
# Linux/macOS:
lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

## 🔒 Security Notes

1. **Never commit `.env` file** - It contains your API key
2. **API Key Safety** - Keep your Anthropic API key secret
3. **Context Isolation** - Enabled by default for security
4. **IPC Security** - Uses secure preload script

## 📊 Database Location

The SQLite database is stored at:
- **Linux/macOS:** `~/.config/AIBrowseX/aibrowsex.db`
- **Windows:** `%APPDATA%\AIBrowseX\aibrowsex.db`

To reset the database, delete this file and restart the app.

## 🚀 Next Steps

After successful setup:

1. **Explore Features:**
   - Browse websites with the Chromium engine
   - Use AI chat to ask questions about pages
   - Generate summaries of articles
   - Analyze content with different analysis types

2. **Customize:**
   - Modify `renderer/styles.css` for UI changes
   - Add new analysis types in `backend/main.py`
   - Extend database schema in `db/database.js`

3. **Deploy:**
   - Build production versions with `npm run build`
   - Distribute installers from `dist/` folder
   - Consider adding auto-update functionality

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review error messages in:
  - Electron DevTools Console
  - Terminal/Command Prompt output
  - Backend logs at `http://localhost:8000/docs`

## 🎉 Success Checklist

- [ ] Node.js and Python installed
- [ ] Dependencies installed (`npm install` successful)
- [ ] Python venv created and dependencies installed
- [ ] `.env` file created with valid `ANTHROPIC_API_KEY`
- [ ] Backend starts successfully (`npm run backend`)
- [ ] Health check passes (`/health` returns healthy)
- [ ] Electron app launches (`npm start`)
- [ ] Can browse websites
- [ ] AI sidebar opens and responds
- [ ] Summary and analysis features work

---

**Congratulations! 🎊** You've successfully set up AIBrowseX. Happy browsing with AI! 🌐🤖
