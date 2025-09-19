#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'db.sqlite');
const db = new Database(dbPath);

console.log('🚀 Initializing database...');

// Create auth-related tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_configs (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    user_id TEXT UNIQUE NOT NULL,
    providers TEXT DEFAULT '{}',
    models TEXT DEFAULT '{}',
    custom_openai_base_url TEXT,
    custom_openai_key TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Check if chats table exists and add user_id column if missing
const tablesInfo = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table'")
  .all();
const chatTableExists = tablesInfo.some((table) => table.name === 'chats');

if (chatTableExists) {
  // Check if user_id column exists in chats table
  const chatsColumns = db.prepare('PRAGMA table_info(chats)').all();
  const hasUserIdColumn = chatsColumns.some((col) => col.name === 'user_id');

  if (!hasUserIdColumn) {
    console.log('Adding user_id column to chats table...');
    db.exec('ALTER TABLE chats ADD COLUMN user_id TEXT REFERENCES users(id)');
  }
} else {
  // Create chats table with user_id
  db.exec(`
    CREATE TABLE chats (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      title TEXT,
      user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

// Check if messages table exists and add user_id column if missing
const messageTableExists = tablesInfo.some(
  (table) => table.name === 'messages',
);

if (messageTableExists) {
  const messagesColumns = db.prepare('PRAGMA table_info(messages)').all();
  const hasUserIdColumn = messagesColumns.some((col) => col.name === 'user_id');

  if (!hasUserIdColumn) {
    console.log('Adding user_id column to messages table...');
    db.exec(
      'ALTER TABLE messages ADD COLUMN user_id TEXT REFERENCES users(id)',
    );
  }
} else {
  // Create messages table with user_id
  db.exec(`
    CREATE TABLE messages (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      content TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      chat_id TEXT NOT NULL,
      user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

// Create indexes
db.exec('CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);');
db.exec(
  'CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);',
);
db.exec(
  'CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);',
);
db.exec(
  'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);',
);
db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);');

db.close();

console.log('✅ Database initialized successfully!');
console.log('📍 Database location:', dbPath);
