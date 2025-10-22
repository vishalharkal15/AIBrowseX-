# 🌐 AIBrowseX

**AI-Powered Web Browser** built with Electron 28, FastAPI, and Claude Sonnet 4.5

## ✨ Features

- 🌐 **Full-featured Chromium Browser**
  - Multi-tab browsing
  - Navigation controls (back, forward, reload, home)
  - Smart address bar with search
  - Bookmarks and history management

- 🤖 **AI-Powered Features**
  - AI Sidebar Chat with Claude Sonnet 4.5
  - Webpage summarization
  - Content analysis and Q&A
  - Context-aware responses

- 💾 **Local Storage**
  - SQLite database for bookmarks, history, and settings
  - AI conversation logs
  - Cross-session persistence

- 🎨 **Modern UI**
  - Dark theme interface
  - Responsive design
  - Smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Anthropic API Key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone and setup project:**
   ```bash
   cd /home/vishal/Desktop/dev
   npm install
   ```

2. **Setup Python backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

### Running the Application

**Development Mode:**
```bash
npm run dev
```

This will start both the FastAPI backend and Electron app.

**Run separately:**
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm start
```

### Building for Production

```bash
# Build for all platforms
npm run build

# Build for specific platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

Built applications will be in the `dist/` directory.

## 📁 Project Structure

```
AIBrowseX/
├── main.js                 # Electron main process
├── preload.js             # IPC bridge (secure)
├── package.json           # Node dependencies & build config
├── .env                   # Environment variables (create from .env.example)
├── renderer/              # Frontend UI
│   ├── index.html        # Main browser interface
│   ├── styles.css        # Application styles
│   └── renderer.js       # UI logic & IPC calls
├── db/                    # Database layer
│   └── database.js       # SQLite operations
├── backend/               # FastAPI backend
│   ├── main.py           # API endpoints
│   └── requirements.txt  # Python dependencies
└── assets/               # Icons and resources
```

## 🔌 API Endpoints

- `POST /askAI` - Ask AI questions with page context
- `POST /summary` - Generate webpage summaries
- `POST /analyze` - Analyze webpage content
- `GET /health` - Backend health check

## 🛠️ Technologies

- **Frontend:** Electron 28, Chromium WebView, HTML/CSS/JS
- **Backend:** FastAPI, Python 3.10+
- **Database:** SQLite (better-sqlite3)
- **AI:** Claude Sonnet 4.5 via Anthropic API
- **Build:** electron-builder

## 📝 Development

### Adding New Features

1. **Frontend changes:** Edit files in `renderer/`
2. **Backend endpoints:** Add to `backend/main.py`
3. **Database tables:** Modify `db/database.js`
4. **IPC channels:** Update `preload.js` and `main.js`

### Database Schema

- `bookmarks` - Saved websites
- `history` - Browsing history
- `settings` - User preferences
- `ai_conversations` - Chat logs

## 🔒 Security

- Contextual isolation enabled
- Secure IPC communication via preload script
- API keys stored in environment variables
- No direct Node.js access from renderer

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines before submitting PRs.

## 💬 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using Electron, FastAPI, and Claude AI
# AIBrowseX-
