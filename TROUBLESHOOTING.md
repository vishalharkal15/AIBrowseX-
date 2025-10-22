# 🔧 AIBrowseX Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Installation Issues

#### Issue: "npm install" fails
**Symptoms:**
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Update npm:
   ```bash
   npm install -g npm@latest
   ```

3. Check Node.js version (need 18+):
   ```bash
   node --version
   ```

#### Issue: Python packages won't install
**Symptoms:**
```
ERROR: Could not find a version that satisfies the requirement...
```

**Solutions:**
1. Check Python version (need 3.10+):
   ```bash
   python3 --version
   ```

2. Upgrade pip:
   ```bash
   cd backend
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. On Windows, use:
   ```cmd
   cd backend
   venv\Scripts\activate
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

---

### 🔴 Backend Issues

#### Issue: Backend won't start
**Symptoms:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solutions:**
1. Activate virtual environment first:
   ```bash
   cd backend
   source venv/bin/activate  # Linux/macOS
   # OR
   venv\Scripts\activate     # Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run backend:
   ```bash
   python -m uvicorn main:app --reload
   ```

#### Issue: "Address already in use"
**Symptoms:**
```
ERROR: [Errno 98] Address already in use
```

**Solutions:**
1. Kill process on port 8000:
   
   **Linux/macOS:**
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```
   
   **Windows:**
   ```cmd
   netstat -ano | findstr :8000
   taskkill /PID <PID_NUMBER> /F
   ```

2. Or use different port in `.env`:
   ```env
   BACKEND_PORT=8001
   ```

#### Issue: API Key not recognized
**Symptoms:**
```
WARNING: ANTHROPIC_API_KEY not found in environment variables!
```

**Solutions:**
1. Create `.env` file if it doesn't exist:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your key:
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
   ```

3. Restart backend

4. Verify at: http://localhost:8000/health
   Should show: `"ai_available": true`

---

### 🔴 Electron Issues

#### Issue: Blank white screen
**Symptoms:**
- Electron window opens but is blank/white

**Solutions:**
1. Open DevTools (Ctrl+Shift+I / Cmd+Option+I)
2. Check console for errors
3. Ensure files exist:
   ```bash
   ls renderer/index.html
   ls renderer/styles.css
   ls renderer/renderer.js
   ```

4. Check file paths in `main.js` are correct

5. Try reinstalling:
   ```bash
   rm -rf node_modules
   npm install
   ```

#### Issue: "Cannot find module 'better-sqlite3'"
**Symptoms:**
```
Error: Cannot find module 'better-sqlite3'
```

**Solutions:**
1. Rebuild native modules:
   ```bash
   npm install better-sqlite3 --build-from-source
   ```

2. Or use electron-rebuild:
   ```bash
   npm install --save-dev electron-rebuild
   npx electron-rebuild
   ```

#### Issue: Webview not loading pages
**Symptoms:**
- Navigation doesn't work
- Pages don't display

**Solutions:**
1. Check webview tag is enabled in `main.js`:
   ```javascript
   webPreferences: {
     webviewTag: true
   }
   ```

2. Check Content Security Policy in `index.html`

3. Try disabling security temporarily for testing:
   ```javascript
   webPreferences: {
     webSecurity: false  // Testing only!
   }
   ```

---

### 🔴 AI Features Issues

#### Issue: "AI backend is not available"
**Symptoms:**
- AI sidebar shows error
- Chat doesn't respond

**Solutions:**
1. Check backend is running:
   ```bash
   curl http://localhost:8000/health
   ```

2. Should return:
   ```json
   {
     "status": "healthy",
     "ai_available": true
   }
   ```

3. If `ai_available: false`, check `.env` file

4. Verify API key is valid at: https://console.anthropic.com/

5. Check API key format:
   ```
   sk-ant-api03-XXXXX...
   ```

#### Issue: AI responses are slow
**Symptoms:**
- Chat takes 30+ seconds
- Timeouts occur

**Solutions:**
1. This is normal for AI processing (10-30 seconds)

2. Check your internet connection

3. Verify Anthropic API status: https://status.anthropic.com/

4. Increase timeout in `main.js`:
   ```javascript
   const response = await axios.post(`${BACKEND_URL}/askAI`, {
     // ...
   }, {
     timeout: 120000  // Increase to 120 seconds
   });
   ```

#### Issue: Context not being sent to AI
**Symptoms:**
- AI doesn't know about current page
- Generic responses

**Solutions:**
1. Check page has loaded completely

2. Try refreshing the page

3. Check DevTools console for JavaScript errors

4. Some pages block JavaScript execution (security)

---

### 🔴 Database Issues

#### Issue: Database locked
**Symptoms:**
```
SQLITE_BUSY: database is locked
```

**Solutions:**
1. Close all Electron instances

2. Delete lock files:
   ```bash
   # Find database location
   # Linux/macOS: ~/.config/AIBrowseX/
   # Windows: %APPDATA%\AIBrowseX\
   
   rm aibrowsex.db-shm aibrowsex.db-wal
   ```

3. Restart application

#### Issue: Want to reset database
**Solutions:**
1. Find database file:
   - **Linux/macOS:** `~/.config/AIBrowseX/aibrowsex.db`
   - **Windows:** `%APPDATA%\AIBrowseX\aibrowsex.db`

2. Close app and delete database:
   ```bash
   # Linux/macOS
   rm ~/.config/AIBrowseX/aibrowsex.db*
   
   # Windows (PowerShell)
   Remove-Item "$env:APPDATA\AIBrowseX\aibrowsex.db*"
   ```

3. Restart app (database will be recreated)

---

### 🔴 Build Issues

#### Issue: electron-builder fails
**Symptoms:**
```
ERROR: Cannot find module 'app-builder-bin'
```

**Solutions:**
1. Clean and reinstall:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. Try building for specific platform:
   ```bash
   npm run build:linux  # Or :win, :mac
   ```

#### Issue: Build works but app won't start
**Symptoms:**
- Built .exe/.dmg/.AppImage doesn't launch

**Solutions:**
1. Check if backend is included:
   - Should be in `resources/backend/`

2. Check `.env` is not included (use defaults)

3. Test in dev mode first:
   ```bash
   npm run dev
   ```

4. Check build logs for errors

---

### 🔴 Development Issues

#### Issue: Changes not reflecting
**Symptoms:**
- Modified code doesn't show up

**Solutions:**
1. For Electron:
   - Completely quit and restart
   - Don't just reload window

2. For backend:
   - Should auto-reload with `--reload` flag
   - Check terminal for reload messages

3. Clear cache:
   ```bash
   rm -rf ~/.config/AIBrowseX/
   ```

#### Issue: Hot reload not working
**Solutions:**
1. Restart with dev command:
   ```bash
   npm run dev
   ```

2. For backend, ensure using `--reload`:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload
   ```

---

### 🔴 Network Issues

#### Issue: Can't connect to backend from Electron
**Symptoms:**
- Frontend works but AI features don't
- CORS errors

**Solutions:**
1. Check backend is running on correct port:
   ```bash
   curl http://localhost:8000/health
   ```

2. Check `.env` matches:
   ```env
   BACKEND_HOST=localhost
   BACKEND_PORT=8000
   ```

3. Try using 127.0.0.1 instead of localhost:
   ```env
   BACKEND_HOST=127.0.0.1
   ```

4. Check firewall settings

---

### 🔴 Platform-Specific Issues

#### macOS: "App is damaged and can't be opened"
**Solutions:**
```bash
xattr -cr /Applications/AIBrowseX.app
```

#### Linux: AppImage won't run
**Solutions:**
```bash
chmod +x AIBrowseX.AppImage
./AIBrowseX.AppImage
```

#### Windows: SmartScreen warning
**Solutions:**
- Click "More info" → "Run anyway"
- Or sign your app with a code signing certificate

---

## 🔍 Debugging Steps

### 1. Check All Services
```bash
# Node/npm version
node --version
npm --version

# Python version
python3 --version

# Backend health
curl http://localhost:8000/health

# Check running processes
ps aux | grep electron
ps aux | grep uvicorn
```

### 2. Check Logs
- **Electron:** Open DevTools (Ctrl+Shift+I)
- **Backend:** Check terminal running backend
- **Database:** Check for `.db-shm` and `.db-wal` files

### 3. Test Components Separately
```bash
# Test backend only
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload

# Test Electron only
npm start

# Test together
npm run dev
```

### 4. Verify File Structure
```bash
tree -L 2  # Or ls -R
```

Should match structure in `PROJECT_STRUCTURE.md`

---

## 📞 Still Having Issues?

### Gather Information
1. Operating System & version
2. Node.js version (`node --version`)
3. Python version (`python3 --version`)
4. Error messages (full text)
5. What you were trying to do
6. What happened vs. what you expected

### Check Documentation
- `README.md` - Overview
- `SETUP.md` - Detailed setup
- `QUICKSTART.md` - Quick start
- `PROJECT_STRUCTURE.md` - Architecture

### Test Basic Functionality
```bash
# Backend API
curl -X POST http://localhost:8000/askAI \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello", "context": "Test"}'

# Should return JSON with answer
```

---

## ✅ Health Check Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed
- [ ] `npm install` completed successfully
- [ ] Python venv created
- [ ] Python dependencies installed
- [ ] `.env` file exists with valid API key
- [ ] Backend starts without errors
- [ ] `/health` endpoint returns "healthy"
- [ ] Electron launches and shows UI
- [ ] Can navigate to websites
- [ ] AI sidebar opens
- [ ] Can send chat messages
- [ ] Summary feature works
- [ ] Analysis feature works

If all checked ✅, your installation is perfect! 🎉

---

**Remember:** Most issues are environment-related. The setup scripts handle 90% of problems automatically!
