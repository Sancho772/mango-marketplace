const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ecommerce.db');
const db = new DatabaseSync(dbPath);

// Enable performance optimizations
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES categories(id),
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ru TEXT,
    description_en TEXT,
    price REAL NOT NULL,
    old_price REAL,
    rating_score REAL DEFAULT 5.0,
    rating_count INTEGER DEFAULT 0,
    brand TEXT NOT NULL,
    image_url TEXT,
    color TEXT,
    sizes TEXT,
    stock INTEGER DEFAULT 10,
    is_bestseller INTEGER DEFAULT 0,
    discount_percent INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    product_title TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    selected_size TEXT,
    selected_color TEXT
  );
`);

module.exports = db;
