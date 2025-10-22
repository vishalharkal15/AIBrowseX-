const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Database path
const dbPath = path.join(app.getPath('userData'), 'aibrowsex.db');
let db;

// ============================
// Initialize Database
// ============================
function init() {
  try {
    db = new Database(dbPath, { verbose: console.log });
    console.log('Database connected:', dbPath);
    
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    
    createTables();
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

// ============================
// Create Tables
// ============================
function createTables() {
  // Bookmarks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // History table
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      visited_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Create index on history for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_history_visited 
    ON history(visited_at DESC)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_history_url 
    ON history(url)
  `);
  
  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // AI Conversations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      context TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  console.log('Database tables created successfully');
}

// ============================
// Bookmarks Operations
// ============================
function getAllBookmarks() {
  try {
    const stmt = db.prepare('SELECT * FROM bookmarks ORDER BY created_at DESC');
    return stmt.all();
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
}

function addBookmark(title, url) {
  try {
    const stmt = db.prepare('INSERT INTO bookmarks (title, url) VALUES (?, ?)');
    const info = stmt.run(title, url);
    return info.lastInsertRowid;
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Bookmark already exists');
    }
    throw error;
  }
}

function deleteBookmark(id) {
  try {
    const stmt = db.prepare('DELETE FROM bookmarks WHERE id = ?');
    stmt.run(id);
    return true;
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    throw error;
  }
}

function searchBookmarks(query) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM bookmarks 
      WHERE title LIKE ? OR url LIKE ? 
      ORDER BY created_at DESC
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern, searchPattern);
  } catch (error) {
    console.error('Error searching bookmarks:', error);
    return [];
  }
}

// ============================
// History Operations
// ============================
function getHistory(limit = 100) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM history 
      ORDER BY visited_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

function addHistory(title, url) {
  try {
    const stmt = db.prepare('INSERT INTO history (title, url) VALUES (?, ?)');
    const info = stmt.run(title, url);
    
    // Clean old history (keep last 1000 entries)
    cleanOldHistory();
    
    return info.lastInsertRowid;
  } catch (error) {
    console.error('Error adding history:', error);
    throw error;
  }
}

function clearHistory() {
  try {
    const stmt = db.prepare('DELETE FROM history');
    stmt.run();
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
}

function searchHistory(query) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM history 
      WHERE title LIKE ? OR url LIKE ? 
      ORDER BY visited_at DESC 
      LIMIT 100
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern, searchPattern);
  } catch (error) {
    console.error('Error searching history:', error);
    return [];
  }
}

function cleanOldHistory() {
  try {
    const stmt = db.prepare(`
      DELETE FROM history 
      WHERE id NOT IN (
        SELECT id FROM history 
        ORDER BY visited_at DESC 
        LIMIT 1000
      )
    `);
    stmt.run();
  } catch (error) {
    console.error('Error cleaning old history:', error);
  }
}

// ============================
// Settings Operations
// ============================
function getSetting(key) {
  try {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get(key);
    return result ? result.value : null;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
}

function setSetting(key, value) {
  try {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = strftime('%s', 'now')
    `);
    stmt.run(key, value, value);
    return true;
  } catch (error) {
    console.error('Error setting setting:', error);
    throw error;
  }
}

function getAllSettings() {
  try {
    const stmt = db.prepare('SELECT * FROM settings');
    return stmt.all();
  } catch (error) {
    console.error('Error getting all settings:', error);
    return [];
  }
}

// ============================
// AI Conversations Operations
// ============================
function saveConversation(question, answer, context = null) {
  try {
    const stmt = db.prepare(`
      INSERT INTO ai_conversations (question, answer, context) 
      VALUES (?, ?, ?)
    `);
    const info = stmt.run(question, answer, context);
    
    // Clean old conversations (keep last 500)
    cleanOldConversations();
    
    return info.lastInsertRowid;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

function getConversations(limit = 50) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM ai_conversations 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

function cleanOldConversations() {
  try {
    const stmt = db.prepare(`
      DELETE FROM ai_conversations 
      WHERE id NOT IN (
        SELECT id FROM ai_conversations 
        ORDER BY created_at DESC 
        LIMIT 500
      )
    `);
    stmt.run();
  } catch (error) {
    console.error('Error cleaning old conversations:', error);
  }
}

function clearConversations() {
  try {
    const stmt = db.prepare('DELETE FROM ai_conversations');
    stmt.run();
    return true;
  } catch (error) {
    console.error('Error clearing conversations:', error);
    throw error;
  }
}

// ============================
// Database Maintenance
// ============================
function vacuum() {
  try {
    db.exec('VACUUM');
    console.log('Database vacuumed successfully');
    return true;
  } catch (error) {
    console.error('Error vacuuming database:', error);
    return false;
  }
}

function backup(backupPath) {
  try {
    db.backup(backupPath);
    console.log('Database backed up to:', backupPath);
    return true;
  } catch (error) {
    console.error('Error backing up database:', error);
    return false;
  }
}

function close() {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
}

// ============================
// Export Functions
// ============================
module.exports = {
  init,
  
  // Bookmarks
  getAllBookmarks,
  addBookmark,
  deleteBookmark,
  searchBookmarks,
  
  // History
  getHistory,
  addHistory,
  clearHistory,
  searchHistory,
  
  // Settings
  getSetting,
  setSetting,
  getAllSettings,
  
  // AI Conversations
  saveConversation,
  getConversations,
  clearConversations,
  
  // Maintenance
  vacuum,
  backup,
  close
};
