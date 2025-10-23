# Building AIBrowseX for Windows

## Option 1: Build on Linux (Current System)

### Prerequisites
Wine is required to build Windows executables on Linux:
```bash
sudo apt-get update
sudo apt-get install -y wine64
```

### Build Command
Once Wine is installed:
```bash
npm run build:win
```

This will create:
- **NSIS Installer**: `dist/AIBrowseX Setup 1.0.0.exe` (recommended for distribution)
- **Portable Version**: `dist/AIBrowseX 1.0.0.exe` (runs without installation)

---

## Option 2: Build on Windows (Easier & Recommended)

If you have access to a Windows PC, the build process is simpler:

### 1. Install Prerequisites on Windows
- **Node.js** 18+ (https://nodejs.org/)
- **Python** 3.12+ (https://www.python.org/)
- **Git** (https://git-scm.com/)

### 2. Clone and Setup
```cmd
git clone https://github.com/vishalharkal15/AIBrowseX-.git
cd AIBrowseX-
npm install
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Build for Windows
```cmd
npm run build:win
```

### 4. Output Location
Your Windows executable will be in: `dist/`
- **AIBrowseX Setup 1.0.0.exe** - Installer (recommended)
- **AIBrowseX 1.0.0.exe** - Portable version

---

## Option 3: GitHub Actions (Automated Cloud Build)

Create `.github/workflows/build.yml` for automatic builds:

```yaml
name: Build

on: [push]

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm install
    - run: npm run build:win
    - uses: actions/upload-artifact@v3
      with:
        name: windows-installer
        path: dist/*.exe
```

---

## Build Outputs Explained

### NSIS Installer (`AIBrowseX Setup 1.0.0.exe`)
- **Size**: ~200-300 MB
- **Features**: 
  - Installs to Program Files
  - Creates desktop shortcut
  - Adds to Start Menu
  - Auto-update support
  - Uninstaller included
- **Best for**: Distribution to end users

### Portable Version (`AIBrowseX 1.0.0.exe`)
- **Size**: ~200-300 MB
- **Features**:
  - No installation required
  - Runs from any location
  - No admin rights needed
  - Portable between PCs
- **Best for**: USB drives, testing, no-install scenarios

---

## Current Build Status

### What's Included in Build:
✅ All frontend files (renderer/)
✅ Database files (db/)
✅ Main Electron process (main.js, preload.js)
✅ Node modules
✅ Backend Python code (backend/)

### Python Backend Handling:
The Python backend is included in the build, but you need to handle Python installation separately or bundle Python with the app (advanced).

**Recommended Approach**: Package backend as standalone executable using PyInstaller:
```bash
cd backend
pip install pyinstaller
pyinstaller --onefile main.py
```

Then update `package.json` to include the backend executable.

---

## Troubleshooting

### Issue: Wine errors on Linux
**Solution**: Install Wine 64-bit:
```bash
sudo apt-get install wine64
```

### Issue: Python not found in built app
**Solution**: Either:
1. User installs Python separately
2. Bundle Python with PyInstaller (see above)
3. Use electron-builder's extraResources to include Python portable

### Issue: Build fails with "Cannot find module"
**Solution**: Clean install:
```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build:win
```

---

## Distribution Checklist

Before distributing your .exe:

- [ ] Test on clean Windows machine
- [ ] Verify Python backend starts correctly
- [ ] Check all UI features work
- [ ] Test database creation
- [ ] Verify AI features (with API key)
- [ ] Include README with setup instructions
- [ ] Document system requirements
- [ ] Create user guide

---

## System Requirements (for end users)

### Minimum:
- Windows 10/11 (64-bit)
- 4 GB RAM
- 500 MB disk space
- Internet connection for AI features

### Recommended:
- Windows 11
- 8 GB RAM
- 1 GB disk space
- Broadband internet

---

## Next Steps

1. Wait for Wine installation to complete
2. Run `npm run build:win`
3. Test the executable in `dist/` folder
4. If issues occur, try building on Windows directly (Option 2)

For advanced packaging (bundling Python), see: `ADVANCED_BUILD.md` (to be created)
