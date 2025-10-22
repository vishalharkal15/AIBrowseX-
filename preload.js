const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  addBookmark: (data) => ipcRenderer.invoke('add-bookmark', data),
  deleteBookmark: (id) => ipcRenderer.invoke('delete-bookmark', id),
  
  // History
  getHistory: (limit) => ipcRenderer.invoke('get-history', limit),
  addHistory: (data) => ipcRenderer.invoke('add-history', data),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  searchHistory: (query) => ipcRenderer.invoke('search-history', query),
  
  // Settings
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  setSetting: (data) => ipcRenderer.invoke('set-setting', data),
  
  // AI Features
  askAI: (data) => ipcRenderer.invoke('ask-ai', data),
  summarizePage: (data) => ipcRenderer.invoke('summarize-page', data),
  analyzeContent: (data) => ipcRenderer.invoke('analyze-content', data),
  checkBackendHealth: () => ipcRenderer.invoke('check-backend-health'),
  getConversations: (limit) => ipcRenderer.invoke('get-conversations', limit),
  
  // Utilities
  getPageContent: (url) => ipcRenderer.invoke('get-page-content', url)
});

console.log('Preload script loaded - IPC bridge ready');
