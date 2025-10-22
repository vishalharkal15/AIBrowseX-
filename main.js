const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const db = require('./db/database');

let mainWindow;
const BACKEND_URL = `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.BACKEND_PORT || 8000}`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#1a1a1a'
  });

  mainWindow.loadFile('renderer/index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  // Initialize database
  db.init();
  
  createWindow();

  // Configure session for webview
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:"]
      }
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ======================
// IPC Handlers - Bookmarks
// ======================

ipcMain.handle('get-bookmarks', async () => {
  try {
    return db.getAllBookmarks();
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
});

ipcMain.handle('add-bookmark', async (event, { title, url }) => {
  try {
    const id = db.addBookmark(title, url);
    return { success: true, id };
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-bookmark', async (event, id) => {
  try {
    db.deleteBookmark(id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return { success: false, error: error.message };
  }
});

// ======================
// IPC Handlers - History
// ======================

ipcMain.handle('get-history', async (event, limit = 50) => {
  try {
    return db.getHistory(limit);
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
});

ipcMain.handle('add-history', async (event, { title, url }) => {
  try {
    const id = db.addHistory(title, url);
    return { success: true, id };
  } catch (error) {
    console.error('Error adding history:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clear-history', async () => {
  try {
    db.clearHistory();
    return { success: true };
  } catch (error) {
    console.error('Error clearing history:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('search-history', async (event, query) => {
  try {
    return db.searchHistory(query);
  } catch (error) {
    console.error('Error searching history:', error);
    return [];
  }
});

// ======================
// IPC Handlers - Settings
// ======================

ipcMain.handle('get-setting', async (event, key) => {
  try {
    return db.getSetting(key);
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
});

ipcMain.handle('set-setting', async (event, { key, value }) => {
  try {
    db.setSetting(key, value);
    return { success: true };
  } catch (error) {
    console.error('Error setting setting:', error);
    return { success: false, error: error.message };
  }
});

// ======================
// IPC Handlers - AI Features
// ======================

ipcMain.handle('ask-ai', async (event, { question, context }) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/askAI`, {
      question,
      context
    }, {
      timeout: 60000
    });
    
    // Save conversation
    db.saveConversation(question, response.data.answer, context);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error asking AI:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message 
    };
  }
});

ipcMain.handle('summarize-page', async (event, { url, content }) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/summary`, {
      url,
      content
    }, {
      timeout: 60000
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error summarizing page:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message 
    };
  }
});

ipcMain.handle('analyze-content', async (event, { url, content, analysisType }) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/analyze`, {
      url,
      content,
      analysis_type: analysisType
    }, {
      timeout: 60000
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error analyzing content:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message 
    };
  }
});

ipcMain.handle('check-backend-health', async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 5000
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { success: false, error: 'Backend not available' };
  }
});

ipcMain.handle('get-conversations', async (event, limit = 20) => {
  try {
    return db.getConversations(limit);
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
});

// ======================
// Utility Handlers
// ======================

ipcMain.handle('get-page-content', async (event, url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return { success: true, content: response.data };
  } catch (error) {
    console.error('Error fetching page content:', error);
    return { success: false, error: error.message };
  }
});

console.log('AIBrowseX main process started');
console.log(`Backend URL: ${BACKEND_URL}`);
