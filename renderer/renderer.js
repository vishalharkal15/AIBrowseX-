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
  settingsModal: document.getElementById('settings-modal'),
  settingsBtn: document.getElementById('settings-btn'),
  loadingOverlay: document.getElementById('loading-overlay'),
  toastContainer: document.getElementById('toast-container'),
  // New Chrome-like elements
  securityIndicator: document.getElementById('security-indicator'),
  bookmarkStarBtn: document.getElementById('bookmark-star-btn'),
  shareBtn: document.getElementById('share-btn'),
  zoomOutBtn: document.getElementById('zoom-out-btn'),
  zoomInBtn: document.getElementById('zoom-in-btn'),
  zoomIndicator: document.getElementById('zoom-indicator'),
  downloadsBtn: document.getElementById('downloads-btn'),
  extensionsBtn: document.getElementById('extensions-btn'),
  menuBtn: document.getElementById('menu-btn')
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
  
  // Initialize first tab with custom home page
  createTab('home.html');
  
  // Load bookmarks and history
  loadBookmarks();
  
  // Load initial zoom level
  const zoomLevel = await window.electronAPI.getSetting('zoom_level') || '100';
  elements.zoomIndicator.textContent = zoomLevel + '%';
  applyZoom(parseInt(zoomLevel));
  
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
  elements.backBtn?.addEventListener('click', () => elements.webview.goBack());
  elements.forwardBtn?.addEventListener('click', () => elements.webview.goForward());
  elements.reloadBtn?.addEventListener('click', () => elements.webview.reload());
  elements.homeBtn?.addEventListener('click', () => navigateTo('home.html'));
  elements.addressBar?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleNavigation();
  });
  
  // Bookmarks & History
  elements.bookmarkStarBtn?.addEventListener('click', addBookmark);
  elements.historyBtn?.addEventListener('click', showHistoryModal);
  
  // New Chrome-like features
  elements.shareBtn?.addEventListener('click', shareCurrentPage);
  elements.zoomOutBtn?.addEventListener('click', () => adjustZoom(-10));
  elements.zoomInBtn?.addEventListener('click', () => adjustZoom(10));
  elements.downloadsBtn?.addEventListener('click', showDownloadsModal);
  elements.extensionsBtn?.addEventListener('click', showExtensionsModal);
  elements.menuBtn?.addEventListener('click', showMenuDropdown);
  
  // Settings
  elements.settingsBtn?.addEventListener('click', showSettingsModal);
  
  // AI Sidebar
  elements.aiToggleBtn?.addEventListener('click', toggleAISidebar);
  elements.closeSidebarBtn?.addEventListener('click', toggleAISidebar);
  
  // Tabs
  elements.newTabBtn?.addEventListener('click', () => createTab('home.html'));
  
  // Chat
  elements.sendChatBtn?.addEventListener('click', sendChatMessage);
  elements.chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
  
  // Summary & Analysis
  elements.generateSummaryBtn?.addEventListener('click', generateSummary);
  elements.analyzeBtn?.addEventListener('click', analyzeContent);
  
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
  
  // Context menu for webview
  elements.webview.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e);
  });
  
  // Downloads
  elements.webview.addEventListener('will-download', (e) => {
    showToast('Download started', 'info');
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ============================
// Keyboard Shortcuts
// ============================
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + T: New Tab
  if ((e.ctrlKey || e.metaKey) && e.key === 't') {
    e.preventDefault();
    createTab('home.html');
  }
  
  // Ctrl/Cmd + W: Close Tab
  if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
    e.preventDefault();
    if (state.tabs.length > 1) {
      closeTab(state.activeTabId);
    }
  }
  
  // Ctrl/Cmd + R: Reload
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    elements.webview.reload();
  }
  
  // Ctrl/Cmd + L: Focus address bar
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
    e.preventDefault();
    elements.addressBar.select();
  }
  
  // Ctrl/Cmd + D: Bookmark
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    addBookmark();
  }
  
  // Ctrl/Cmd + H: History
  if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
    e.preventDefault();
    showHistoryModal();
  }
  
  // Ctrl/Cmd + ,: Settings
  if ((e.ctrlKey || e.metaKey) && e.key === ',') {
    e.preventDefault();
    showSettingsModal();
  }
  
  // F5: Reload
  if (e.key === 'F5') {
    e.preventDefault();
    elements.webview.reload();
  }
  
  // Ctrl/Cmd + +: Zoom In
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
    e.preventDefault();
    adjustZoom(10);
  }
  
  // Ctrl/Cmd + -: Zoom Out
  if ((e.ctrlKey || e.metaKey) && e.key === '-') {
    e.preventDefault();
    adjustZoom(-10);
  }
  
  // Ctrl/Cmd + 0: Reset Zoom
  if ((e.ctrlKey || e.metaKey) && e.key === '0') {
    e.preventDefault();
    setZoom(100);
  }
  
  // Alt + Left: Back
  if (e.altKey && e.key === 'ArrowLeft') {
    e.preventDefault();
    if (elements.webview.canGoBack()) {
      elements.webview.goBack();
    }
  }
  
  // Alt + Right: Forward
  if (e.altKey && e.key === 'ArrowRight') {
    e.preventDefault();
    if (elements.webview.canGoForward()) {
      elements.webview.goForward();
    }
  }
}

function adjustZoom(delta) {
  const currentZoom = parseInt(document.getElementById('zoom-level')?.value) || 100;
  const newZoom = Math.min(200, Math.max(50, currentZoom + delta));
  setZoom(newZoom);
}

function setZoom(level) {
  if (document.getElementById('zoom-level')) {
    document.getElementById('zoom-level').value = level;
    document.getElementById('zoom-value').textContent = level + '%';
  }
  elements.zoomIndicator.textContent = level + '%';
  applyZoom(level);
  window.electronAPI.setSetting({ key: 'zoom_level', value: level.toString() });
}

// ============================
// Share Page
// ============================
async function shareCurrentPage() {
  const title = elements.webview.getTitle() || 'Untitled';
  const url = state.currentUrl;
  
  if (!url || url === 'about:blank' || url.startsWith('file://')) {
    showToast('Cannot share this page', 'error');
    return;
  }
  
  try {
    await copyToClipboard(url);
    showToast('URL copied to clipboard', 'success');
  } catch (err) {
    showToast('Failed to copy URL', 'error');
  }
}

// ============================
// Downloads Modal
// ============================
function showDownloadsModal() {
  showToast('Downloads feature - Coming soon!', 'info');
  // TODO: Implement downloads tracking
}

// ============================
// Extensions Modal
// ============================
function showExtensionsModal() {
  showToast('Extensions feature - Coming soon!', 'info');
  // TODO: Implement extensions support
}

// ============================
// Menu Dropdown
// ============================
function showMenuDropdown() {
  // Create menu dropdown
  const existingMenu = document.getElementById('menu-dropdown');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }
  
  const menu = document.createElement('div');
  menu.id = 'menu-dropdown';
  menu.className = 'menu-dropdown';
  menu.innerHTML = `
    <div class="menu-item" data-action="new-tab">
      <span class="menu-icon">📑</span>
      <span>New Tab</span>
      <span class="menu-shortcut">Ctrl+T</span>
    </div>
    <div class="menu-item" data-action="new-window">
      <span class="menu-icon">🪟</span>
      <span>New Window</span>
      <span class="menu-shortcut">Ctrl+N</span>
    </div>
    <div class="menu-divider"></div>
    <div class="menu-item" data-action="bookmarks">
      <span class="menu-icon">⭐</span>
      <span>Bookmarks</span>
      <span class="menu-shortcut">Ctrl+Shift+B</span>
    </div>
    <div class="menu-item" data-action="history">
      <span class="menu-icon">🕐</span>
      <span>History</span>
      <span class="menu-shortcut">Ctrl+H</span>
    </div>
    <div class="menu-item" data-action="downloads">
      <span class="menu-icon">⬇️</span>
      <span>Downloads</span>
      <span class="menu-shortcut">Ctrl+J</span>
    </div>
    <div class="menu-divider"></div>
    <div class="menu-item" data-action="print">
      <span class="menu-icon">🖨️</span>
      <span>Print</span>
      <span class="menu-shortcut">Ctrl+P</span>
    </div>
    <div class="menu-item" data-action="find">
      <span class="menu-icon">🔍</span>
      <span>Find</span>
      <span class="menu-shortcut">Ctrl+F</span>
    </div>
    <div class="menu-divider"></div>
    <div class="menu-item" data-action="zoom-in">
      <span class="menu-icon">🔍+</span>
      <span>Zoom In</span>
      <span class="menu-shortcut">Ctrl++</span>
    </div>
    <div class="menu-item" data-action="zoom-out">
      <span class="menu-icon">🔍-</span>
      <span>Zoom Out</span>
      <span class="menu-shortcut">Ctrl+-</span>
    </div>
    <div class="menu-item" data-action="zoom-reset">
      <span class="menu-icon">🔍↺</span>
      <span>Reset Zoom</span>
      <span class="menu-shortcut">Ctrl+0</span>
    </div>
    <div class="menu-divider"></div>
    <div class="menu-item" data-action="settings">
      <span class="menu-icon">⚙️</span>
      <span>Settings</span>
      <span class="menu-shortcut">Ctrl+,</span>
    </div>
    <div class="menu-item" data-action="help">
      <span class="menu-icon">❓</span>
      <span>Help</span>
      <span class="menu-shortcut">F1</span>
    </div>
    <div class="menu-divider"></div>
    <div class="menu-item" data-action="exit">
      <span class="menu-icon">🚪</span>
      <span>Exit</span>
      <span class="menu-shortcut">Alt+F4</span>
    </div>
  `;
  
  // Position menu
  const menuBtn = elements.menuBtn;
  const rect = menuBtn.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = rect.bottom + 5 + 'px';
  menu.style.right = '10px';
  
  document.body.appendChild(menu);
  
  // Handle menu item clicks
  menu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      handleMenuAction(action);
      menu.remove();
    });
  });
  
  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && e.target !== menuBtn) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 0);
}

function handleMenuAction(action) {
  switch(action) {
    case 'new-tab':
      createTab('home.html');
      break;
    case 'new-window':
      showToast('New Window - Feature coming soon', 'info');
      break;
    case 'bookmarks':
      showBookmarksModal();
      break;
    case 'history':
      showHistoryModal();
      break;
    case 'downloads':
      showDownloadsModal();
      break;
    case 'print':
      elements.webview.print();
      break;
    case 'find':
      showToast('Find in Page - Press Ctrl+F', 'info');
      break;
    case 'zoom-in':
      adjustZoom(10);
      break;
    case 'zoom-out':
      adjustZoom(-10);
      break;
    case 'zoom-reset':
      setZoom(100);
      break;
    case 'settings':
      showSettingsModal();
      break;
    case 'help':
      showToast('Help: Check FEATURES.md for all shortcuts', 'info');
      break;
    case 'exit':
      if (confirm('Are you sure you want to exit AIBrowseX?')) {
        window.close();
      }
      break;
  }
}

// ============================
// Context Menu
// ============================

// ============================
// Navigation
// ============================
async function handleNavigation() {
  const input = elements.addressBar.value.trim();
  if (!input) return;
  
  let url = input;
  
  // Check if it's a URL or search query
  if (!url.includes('.') || url.includes(' ')) {
    // Search query - use configured search engine
    url = await performSearch(url);
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
  
  // Update security indicator
  updateSecurityIndicator(url);
  
  // Update bookmark star
  updateBookmarkStar(url);
}

// Update security indicator
function updateSecurityIndicator(url) {
  const indicator = elements.securityIndicator;
  
  if (url.startsWith('https://')) {
    indicator.classList.add('secure');
    indicator.classList.remove('insecure');
    indicator.title = 'Connection is secure';
  } else if (url.startsWith('http://')) {
    indicator.classList.add('insecure');
    indicator.classList.remove('secure');
    indicator.title = 'Not secure';
  } else {
    indicator.classList.remove('secure', 'insecure');
    indicator.title = 'Local page';
  }
}

// Update bookmark star
async function updateBookmarkStar(url) {
  const bookmarks = await window.electronAPI.getBookmarks();
  const isBookmarked = bookmarks.some(b => b.url === url);
  
  if (isBookmarked) {
    elements.bookmarkStarBtn.classList.add('bookmarked');
    elements.bookmarkStarBtn.title = 'Edit bookmark';
  } else {
    elements.bookmarkStarBtn.classList.remove('bookmarked');
    elements.bookmarkStarBtn.title = 'Bookmark this page';
  }
}

// ============================
// Tab Management
// ============================
function createTab(url = 'home.html') {
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
    createTab('home.html');
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
// Settings
// ============================
async function showSettingsModal() {
  elements.settingsModal.classList.remove('hidden');
  
  // Load current settings
  await loadSettings();
  
  // Setup event listeners
  setupSettingsListeners();
}

async function loadSettings() {
  // Load home URL
  const homeUrl = await window.electronAPI.getSetting('home_url') || 'home.html';
  document.getElementById('home-url-input').value = homeUrl;
  
  // Load search engine
  const searchEngine = await window.electronAPI.getSetting('search_engine') || 'google';
  document.getElementById('search-engine-select').value = searchEngine;
  
  // Load theme
  const theme = await window.electronAPI.getSetting('theme') || 'dark';
  document.getElementById('theme-select').value = theme;
  
  // Load privacy settings
  const autoClearHistory = await window.electronAPI.getSetting('auto_clear_history') === 'true';
  document.getElementById('auto-clear-history').checked = autoClearHistory;
  
  const doNotTrack = await window.electronAPI.getSetting('do_not_track') === 'true';
  document.getElementById('do-not-track').checked = doNotTrack;
  
  // Load zoom level
  const zoomLevel = await window.electronAPI.getSetting('zoom_level') || '100';
  document.getElementById('zoom-level').value = zoomLevel;
  document.getElementById('zoom-value').textContent = zoomLevel + '%';
  
  // Update backend status
  updateBackendStatus();
}

function setupSettingsListeners() {
  // Home URL
  document.getElementById('save-home-url-btn').onclick = async () => {
    const url = document.getElementById('home-url-input').value.trim();
    if (url) {
      await window.electronAPI.setSetting({ key: 'home_url', value: url });
      showToast('Home URL saved', 'success');
      // Update home button to use new URL
      elements.homeBtn.onclick = () => navigateTo(url);
    }
  };
  
  // Search Engine
  document.getElementById('save-search-engine-btn').onclick = async () => {
    const engine = document.getElementById('search-engine-select').value;
    await window.electronAPI.setSetting({ key: 'search_engine', value: engine });
    showToast('Search engine saved', 'success');
  };
  
  // Theme
  document.getElementById('save-theme-btn').onclick = async () => {
    const theme = document.getElementById('theme-select').value;
    await window.electronAPI.setSetting({ key: 'theme', value: theme });
    applyTheme(theme);
    showToast('Theme saved', 'success');
  };
  
  // Zoom Level
  document.getElementById('zoom-level').oninput = (e) => {
    const value = e.target.value;
    document.getElementById('zoom-value').textContent = value + '%';
    applyZoom(value);
  };
  
  document.getElementById('zoom-level').onchange = async (e) => {
    const value = e.target.value;
    await window.electronAPI.setSetting({ key: 'zoom_level', value });
  };
  
  // Privacy settings
  document.getElementById('auto-clear-history').onchange = async (e) => {
    await window.electronAPI.setSetting({ 
      key: 'auto_clear_history', 
      value: e.target.checked.toString() 
    });
    showToast('Privacy setting updated', 'success');
  };
  
  document.getElementById('do-not-track').onchange = async (e) => {
    await window.electronAPI.setSetting({ 
      key: 'do_not_track', 
      value: e.target.checked.toString() 
    });
    showToast('Privacy setting updated', 'success');
  };
  
  // Backend check
  document.getElementById('check-backend-btn').onclick = async () => {
    await checkBackendHealth();
    updateBackendStatus();
  };
}

function updateBackendStatus() {
  const statusEl = document.getElementById('backend-status');
  if (state.backendHealthy) {
    statusEl.textContent = '✓ Connected';
    statusEl.style.color = '#00ff88';
  } else {
    statusEl.textContent = '✗ Disconnected';
    statusEl.style.color = '#ff4444';
  }
}

function applyTheme(theme) {
  // Theme application logic (placeholder for future implementation)
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

function applyZoom(level) {
  const zoomFactor = level / 100;
  elements.webview.setZoomFactor(zoomFactor);
}

// ============================
// Context Menu
// ============================
function showContextMenu(e) {
  // Simple context menu implementation
  const menuItems = [
    { label: 'Back', action: () => elements.webview.canGoBack() && elements.webview.goBack() },
    { label: 'Forward', action: () => elements.webview.canGoForward() && elements.webview.goForward() },
    { label: 'Reload', action: () => elements.webview.reload() },
    { label: 'separator' },
    { label: 'View Page Source', action: () => viewPageSource() },
    { label: 'Inspect Element', action: () => elements.webview.openDevTools() },
    { label: 'separator' },
    { label: 'Copy URL', action: () => copyToClipboard(state.currentUrl) },
    { label: 'Bookmark This Page', action: () => addBookmark() }
  ];
  
  // Note: Full context menu requires electron's Menu API in main process
  // This is a simplified version for demonstration
  console.log('Context menu requested at:', e.x, e.y);
  showToast('Right-click menu (use browser controls)', 'info');
}

function viewPageSource() {
  const url = `view-source:${state.currentUrl}`;
  createTab(url);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('URL copied to clipboard', 'success');
  } catch (err) {
    console.error('Failed to copy:', err);
    showToast('Failed to copy URL', 'error');
  }
}

// ============================
// Enhanced Search
// ============================
async function performSearch(query) {
  const searchEngine = await window.electronAPI.getSetting('search_engine') || 'google';
  
  const searchUrls = {
    google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
    duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
    yahoo: `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`
  };
  
  return searchUrls[searchEngine] || searchUrls.google;
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
