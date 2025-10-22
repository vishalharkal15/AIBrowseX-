# 🚀 AIBrowseX - Quick Start

## ⚡ Fast Setup (5 minutes)

### 1️⃣ Install Dependencies
```bash
# If on Linux/macOS
chmod +x setup.sh && ./setup.sh

# If on Windows
setup.bat
```

### 2️⃣ Add Your API Key
```bash
# Edit .env file
nano .env  # or use any text editor
```

Add your Anthropic API key:
```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get your API key: https://console.anthropic.com/

### 3️⃣ Run the App
```bash
npm run dev
```

That's it! 🎉

## 📖 What Just Happened?

- ✅ Installed all Node.js dependencies (Electron, better-sqlite3, axios, etc.)
- ✅ Created Python virtual environment
- ✅ Installed FastAPI backend dependencies (fastapi, anthropic, uvicorn)
- ✅ Created configuration file from template
- ✅ Ready to run!

## 🎮 Usage

### Browse the Web
- Use the address bar to navigate
- Multiple tabs supported
- Full Chromium browser capabilities

### AI Features
1. **Click the AI button** (💬) to open the sidebar
2. **Chat Tab**: Ask questions about the current page
3. **Summary Tab**: Generate page summaries
4. **Analyze Tab**: Deep content analysis

### Bookmarks & History
- Star icon: Bookmark current page
- Clock icon: View browsing history

## 🛠️ Common Commands

```bash
# Development mode (recommended)
npm run dev

# Start only Electron
npm start

# Start only backend
npm run backend

# Build for production
npm run build
```

## 🆘 Quick Troubleshooting

**Backend not starting?**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**AI not working?**
- Check if `.env` file has valid `ANTHROPIC_API_KEY`
- Verify backend is running: http://localhost:8000/health

**Want to start fresh?**
```bash
rm -rf node_modules backend/venv
./setup.sh  # or setup.bat on Windows
```

## 📚 Documentation

- **Full Setup Guide**: See `SETUP.md`
- **Architecture**: See `README.md`
- **API Docs**: http://localhost:8000/docs (when backend is running)

## 🌟 Features at a Glance

### Browser Features
- ✅ Multi-tab browsing
- ✅ Navigation controls (back/forward/reload/home)
- ✅ Smart address bar with search
- ✅ Bookmarks management
- ✅ Browsing history
- ✅ Modern dark theme UI

### AI Features (powered by Claude Sonnet 4.5)
- 🤖 Context-aware chat about current page
- 📝 Automatic page summarization
- 🔍 Content analysis (sentiment, key points, entities)
- 💾 Conversation history saved locally

### Technical Features
- ⚡ Built with Electron 28 + Chromium
- 🐍 FastAPI backend (Python 3.10+)
- 🗄️ SQLite local storage
- 🔒 Secure IPC communication
- 📦 Cross-platform builds (Windows, macOS, Linux)

## 🎯 First Steps

1. **Browse** to any website (try Wikipedia, news sites, blogs)
2. **Open AI sidebar** by clicking the chat icon
3. **Ask a question** like "Summarize this page" or "What is this about?"
4. **Try Summary tab** to get automated summaries
5. **Experiment with Analysis** - try different analysis types

## 💡 Pro Tips

- **Ctrl+Shift+I** (Cmd+Option+I on Mac) opens DevTools
- **Conversations are saved** - check database for history
- **Backend runs on port 8000** - configurable in `.env`
- **Database location**: `~/.config/AIBrowseX/` (Linux/Mac) or `%APPDATA%\AIBrowseX\` (Windows)

## 🤝 Need Help?

Check these in order:
1. Console logs (DevTools and terminal)
2. `SETUP.md` for detailed troubleshooting
3. Backend health: http://localhost:8000/health
4. API documentation: http://localhost:8000/docs

---

**Ready to build?** 🚀
```bash
npm run build
```

**Enjoy AIBrowseX!** 🌐✨
