#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create database directory and file for Heroku deployment
const dbPath = path.join(process.cwd(), 'data', 'db.sqlite');
const dataDir = path.dirname(dbPath);

console.log('Initializing database for deployment...');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

// Create empty database file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
  console.log('✅ Created database file');
}

console.log('✅ Database initialization complete');
console.log('Database will be fully configured by Drizzle schema push.');
