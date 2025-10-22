// ============================
// State Management
// ============================
const state = {
  tabs: [],
  activeTabId: null,
  currentUrl: '',
  backendHealthy: false
};

// ============================
// DOM Elements
// ============================
const elements = {
  webview: document.getElementById('webview'),
  addressBar: document.getElementById('address-bar'),
  backBtn: document.getElementById('back-btn'),
  forwardBtn: document.getElementById('forward-btn'),
  reloadBtn: document.getElementById('reload-btn'),
  homeBtn: document.getElementById('home-btn'),
  goBtn: document.getElementById('go-btn'),
  bookmarkBtn: document.getElementById('bookmark-btn'),
  historyBtn: document.getElementById('history-btn'),
  aiToggleBtn: document.getElementById('ai-toggle-btn'),
  aiSidebar: document.getElementById('ai-sidebar'),
  closeSidebarBtn: document.getElementById('close-sidebar-btn'),
  tabsContainer: document.getElementById('tabs-container'),
  newTabBtn: document.getElementById('new-tab-btn'),
  chatMessages: document.getElementById('chat-messages'),
  chatInput: document.getElementById('chat-input'),
  sendChatBtn: document.getElementById('send-chat-btn'),
  generateSummaryBtn: document.getElementById('generate-summary-btn'),
  summaryContent: document.getElementById('summary-content'),
  analyzeBtn: document.getElementById('analyze-btn'),
  analysisType: document.getElementById('analysis-type'),
  analyzeContent: document.getElementById('analyze-content'),
  bookmarksModal: document.getElementById('bookmarks-modal'),
  historyModal: document.getElementById('history-modal'),
  loadingOverlay: document.getElementById('loading-overlay'),
  toastContainer: document.getElementById('toast-container')
};

// ============================
// Initialization
// ============================
async function init() {
  console.log('Initializing AIBrowseX...');
  
  // Check backend health
  checkBackendHealth();
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize first tab
  createTab('https://www.google.com');
  
  // Load bookmarks and history
  loadBookmarks();
  
  showToast('AIBrowseX initialized', 'success');
}

// ============================
// Backend Health Check
// ============================
async function checkBackendHealth() {
  try {
    const result = await window.electronAPI.checkBackendHealth();
    if (result.success) {
      state.backendHealthy = true;
      console.log('Backend is healthy:', result.data);
    } else {
      state.backendHealthy = false;
      showToast('AI Backend unavailable. Some features may not work.', 'error');
    }
  } catch (error) {
    console.error('Backend health check failed:', error);
    state.backendHealthy = false;
  }
}

// ============================
// Event Listeners
// ============================
function setupEventListeners() {
  // Navigation
  elements.backBtn.addEventListener('click', () => elements.webview.goBack());
  elements.forwardBtn.addEventListener('click', () => elements.webview.goForward());
  elements.reloadBtn.addEventListener('click', () => elements.webview.reload());
  elements.homeBtn.addEventListener('click', () => navigateTo('https://www.google.com'));
  elements.goBtn.addEventListener('click', handleNavigation);
  elements.addressBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleNavigation();
  });
  
  // Bookmarks & History
  elements.bookmarkBtn.addEventListener('click', addBookmark);
  elements.historyBtn.addEventListener('click', showHistoryModal);
  
  // AI Sidebar
  elements.aiToggleBtn.addEventListener('click', toggleAISidebar);
  elements.closeSidebarBtn.addEventListener('click', toggleAISidebar);
  
  // Tabs
  elements.newTabBtn.addEventListener('click', () => createTab('https://www.google.com'));
  
  // Chat
  elements.sendChatBtn.addEventListener('click', sendChatMessage);
  elements.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
  
  // Summary & Analysis
  elements.generateSummaryBtn.addEventListener('click', generateSummary);
  elements.analyzeBtn.addEventListener('click', analyzeContent);
  
  // Sidebar tabs
  document.querySelectorAll('.sidebar-tab').forEach(tab => {
    tab.addEventListener('click', () => switchSidebarTab(tab.dataset.tab));
  });
  
  // Modal close buttons
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal').classList.add('hidden');
    });
  });
  
  // Webview events
  elements.webview.addEventListener('did-start-loading', () => {
    elements.reloadBtn.disabled = true;
  });
  
  elements.webview.addEventListener('did-stop-loading', () => {
    elements.reloadBtn.disabled = false;
    updateAddressBar();
    addToHistory();
  });
  
  elements.webview.addEventListener('did-fail-load', (e) => {
    if (e.errorCode !== -3) { // Ignore aborted loads
      showToast(`Failed to load page: ${e.errorDescription}`, 'error');
    }
  });
  
  elements.webview.addEventListener('page-title-updated', (e) => {
    updateTabTitle(e.title);
  });
  
  elements.webview.addEventListener('new-window', (e) => {
    createTab(e.url);
  });
}

// ============================
// Navigation
// ============================
function handleNavigation() {
  const input = elements.addressBar.value.trim();
  if (!input) return;
  
  let url = input;
  
  // Check if it's a URL or search query
  if (!url.includes('.') || url.includes(' ')) {
    // Search query
    url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  navigateTo(url);
}

function navigateTo(url) {
  elements.webview.src = url;
  state.currentUrl = url;
  elements.addressBar.value = url;
}

function updateAddressBar() {
  const url = elements.webview.getURL();
  state.currentUrl = url;
  elements.addressBar.value = url;
  
  // Update navigation buttons
  elements.backBtn.disabled = !elements.webview.canGoBack();
  elements.forwardBtn.disabled = !elements.webview.canGoForward();
}

// ============================
// Tab Management
// ============================
function createTab(url = 'https://www.google.com') {
  const tabId = Date.now().toString();
  const tab = {
    id: tabId,
    url: url,
    title: 'New Tab'
  };
  
  state.tabs.push(tab);
  state.activeTabId = tabId;
  
  renderTabs();
  navigateTo(url);
}

function switchTab(tabId) {
  const tab = state.tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  state.activeTabId = tabId;
  navigateTo(tab.url);
  renderTabs();
}

function closeTab(tabId) {
  const index = state.tabs.findIndex(t => t.id === tabId);
  if (index === -1) return;
  
  state.tabs.splice(index, 1);
  
  if (state.tabs.length === 0) {
    createTab('https://www.google.com');
  } else if (state.activeTabId === tabId) {
    const newIndex = Math.min(index, state.tabs.length - 1);
    switchTab(state.tabs[newIndex].id);
  } else {
    renderTabs();
  }
}

function updateTabTitle(title) {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (tab) {
    tab.title = title || 'Untitled';
    tab.url = state.currentUrl;
    renderTabs();
  }
}

function renderTabs() {
  elements.tabsContainer.innerHTML = '';
  
  state.tabs.forEach(tab => {
    const tabEl = document.createElement('div');
    tabEl.className = `tab ${tab.id === state.activeTabId ? 'active' : ''}`;
    tabEl.innerHTML = `
      <span class="tab-title">${escapeHtml(tab.title)}</span>
      <button class="tab-close" data-tab-id="${tab.id}">×</button>
    `;
    
    tabEl.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close')) {
        switchTab(tab.id);
      }
    });
    
    tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });
    
    elements.tabsContainer.appendChild(tabEl);
  });
}

// ============================
// Bookmarks
// ============================
async function addBookmark() {
  const title = elements.webview.getTitle() || 'Untitled';
  const url = state.currentUrl;
  
  if (!url || url === 'about:blank') {
    showToast('Cannot bookmark this page', 'error');
    return;
  }
  
  const result = await window.electronAPI.addBookmark({ title, url });
  
  if (result.success) {
    showToast('Bookmark added', 'success');
  } else {
    showToast('Failed to add bookmark', 'error');
  }
}

async function loadBookmarks() {
  const bookmarks = await window.electronAPI.getBookmarks();
  return bookmarks;
}

async function showBookmarksModal() {
  const bookmarks = await loadBookmarks();
  const listContainer = document.getElementById('bookmarks-list');
  
  listContainer.innerHTML = '';
  
  if (bookmarks.length === 0) {
    listContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No bookmarks yet</p>';
  } else {
    bookmarks.forEach(bookmark => {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.innerHTML = `
        <div class="list-item-content">
          <div class="list-item-title">${escapeHtml(bookmark.title)}</div>
          <div class="list-item-url">${escapeHtml(bookmark.url)}</div>
        </div>
        <button class="delete-btn" data-id="${bookmark.id}">Delete</button>
      `;
      
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('delete-btn')) {
          navigateTo(bookmark.url);
          elements.bookmarksModal.classList.add('hidden');
        }
      });
      
      item.querySelector('.delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.electronAPI.deleteBookmark(bookmark.id);
        showBookmarksModal();
        showToast('Bookmark deleted', 'success');
      });
      
      listContainer.appendChild(item);
    });
  }
  
  elements.bookmarksModal.classList.remove('hidden');
}

// ============================
// History
// ============================
async function addToHistory() {
  const title = elements.webview.getTitle() || 'Untitled';
  const url = state.currentUrl;
  
  if (!url || url === 'about:blank' || url.startsWith('chrome://')) {
    return;
  }
  
  await window.electronAPI.addHistory({ title, url });
}

async function showHistoryModal() {
  const history = await window.electronAPI.getHistory(100);
  const listContainer = document.getElementById('history-list');
  const searchInput = document.getElementById('history-search');
  const clearBtn = document.getElementById('clear-history-btn');
  
  function renderHistory(items) {
    listContainer.innerHTML = '';
    
    if (items.length === 0) {
      listContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No history</p>';
    } else {
      items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'list-item';
        el.innerHTML = `
          <div class="list-item-content">
            <div class="list-item-title">${escapeHtml(item.title)}</div>
            <div class="list-item-url">${escapeHtml(item.url)}</div>
            <div class="list-item-time">${formatDate(item.visited_at)}</div>
          </div>
        `;
        
        el.addEventListener('click', () => {
          navigateTo(item.url);
          elements.historyModal.classList.add('hidden');
        });
        
        listContainer.appendChild(el);
      });
    }
  }
  
  renderHistory(history);
  
  // Search functionality
  searchInput.value = '';
  searchInput.oninput = async (e) => {
    const query = e.target.value.trim();
    if (query) {
      const results = await window.electronAPI.searchHistory(query);
      renderHistory(results);
    } else {
      renderHistory(history);
    }
  };
  
  // Clear history
  clearBtn.onclick = async () => {
    if (confirm('Are you sure you want to clear all history?')) {
      await window.electronAPI.clearHistory();
      showToast('History cleared', 'success');
      showHistoryModal();
    }
  };
  
  elements.historyModal.classList.remove('hidden');
}

// ============================
// AI Sidebar
// ============================
function toggleAISidebar() {
  elements.aiSidebar.classList.toggle('hidden');
  
  if (!elements.aiSidebar.classList.contains('hidden') && !state.backendHealthy) {
    addChatMessage('AI backend is not available. Please ensure the backend is running.', 'system');
  }
}

function switchSidebarTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.sidebar-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // Update content
  document.querySelectorAll('.sidebar-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });
}

// ============================
// Chat
// ============================
async function sendChatMessage() {
  const question = elements.chatInput.value.trim();
  if (!question) return;
  
  if (!state.backendHealthy) {
    showToast('AI backend is not available', 'error');
    return;
  }
  
  addChatMessage(question, 'user');
  elements.chatInput.value = '';
  elements.sendChatBtn.disabled = true;
  
  // Get page content as context
  const context = await getPageContext();
  
  showLoading();
  
  try {
    const result = await window.electronAPI.askAI({ question, context });
    
    hideLoading();
    elements.sendChatBtn.disabled = false;
    
    if (result.success) {
      addChatMessage(result.data.answer, 'ai');
    } else {
      addChatMessage(`Error: ${result.error}`, 'system');
      showToast('Failed to get AI response', 'error');
    }
  } catch (error) {
    hideLoading();
    elements.sendChatBtn.disabled = false;
    addChatMessage(`Error: ${error.message}`, 'system');
    showToast('Failed to communicate with AI', 'error');
  }
}

function addChatMessage(text, type) {
  const messageEl = document.createElement('div');
  messageEl.className = `chat-message ${type}`;
  messageEl.textContent = text;
  
  elements.chatMessages.appendChild(messageEl);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// ============================
// Summary
// ============================
async function generateSummary() {
  if (!state.backendHealthy) {
    showToast('AI backend is not available', 'error');
    return;
  }
  
  const url = state.currentUrl;
  const content = await getPageContext();
  
  if (!content) {
    showToast('Unable to extract page content', 'error');
    return;
  }
  
  showLoading();
  elements.generateSummaryBtn.disabled = true;
  
  try {
    const result = await window.electronAPI.summarizePage({ url, content });
    
    hideLoading();
    elements.generateSummaryBtn.disabled = false;
    
    if (result.success) {
      elements.summaryContent.textContent = result.data.summary;
    } else {
      showToast('Failed to generate summary', 'error');
    }
  } catch (error) {
    hideLoading();
    elements.generateSummaryBtn.disabled = false;
    showToast('Failed to generate summary', 'error');
  }
}

// ============================
// Analysis
// ============================
async function analyzeContent() {
  if (!state.backendHealthy) {
    showToast('AI backend is not available', 'error');
    return;
  }
  
  const url = state.currentUrl;
  const content = await getPageContext();
  const analysisType = elements.analysisType.value;
  
  if (!content) {
    showToast('Unable to extract page content', 'error');
    return;
  }
  
  showLoading();
  elements.analyzeBtn.disabled = true;
  
  try {
    const result = await window.electronAPI.analyzeContent({ url, content, analysisType });
    
    hideLoading();
    elements.analyzeBtn.disabled = false;
    
    if (result.success) {
      elements.analyzeContent.textContent = result.data.analysis;
    } else {
      showToast('Failed to analyze content', 'error');
    }
  } catch (error) {
    hideLoading();
    elements.analyzeBtn.disabled = false;
    showToast('Failed to analyze content', 'error');
  }
}

// ============================
// Utility Functions
// ============================
async function getPageContext() {
  try {
    // Try to execute script in webview to get page content
    const content = await elements.webview.executeJavaScript(`
      (function() {
        const title = document.title;
        const text = document.body.innerText.substring(0, 5000); // Limit to 5000 chars
        const url = window.location.href;
        return JSON.stringify({ title, text, url });
      })();
    `);
    
    const parsed = JSON.parse(content);
    return `Title: ${parsed.title}\nURL: ${parsed.url}\n\nContent:\n${parsed.text}`;
  } catch (error) {
    console.error('Failed to get page context:', error);
    return `URL: ${state.currentUrl}\n\nUnable to extract page content.`;
  }
}

function showLoading() {
  elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  elements.loadingOverlay.classList.add('hidden');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return date.toLocaleDateString();
}

// ============================
// Add slideOutRight animation
// ============================
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ============================
// Start Application
// ============================
window.addEventListener('DOMContentLoaded', init);
