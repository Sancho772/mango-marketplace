const path = require('node:path');
const fs = require('node:fs');

const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.NOW_REGION;

// Canonical Seed Data
const initialCategories = [
  { id: 'cat_all', slug: 'all', name_ru: 'Все новинки', name_en: 'All New Arrivals', sort_order: 1 },
  { id: 'cat_apparel', slug: 'apparel', name_ru: 'Одежда и трикотаж', name_en: 'Apparel & Knitwear', sort_order: 2 },
  { id: 'cat_living', slug: 'living', name_ru: 'Посуда и декор', name_en: 'Living & Decor', sort_order: 3 },
  { id: 'cat_accessories', slug: 'accessories', name_ru: 'Изделия из кожи', name_en: 'Leather & Accessories', sort_order: 4 },
  { id: 'cat_fragrance', slug: 'fragrance', name_ru: 'Ароматы для дома', name_en: 'Home Fragrance', sort_order: 5 }
];

const initialProducts = [
  {
    id: 'prod_1',
    category_id: 'cat_apparel',
    title_ru: 'Рубашка из мериносовой шерсти',
    title_en: 'Merino Wool Overshirt',
    description_ru: '100% ультратонкая австралийская шерсть мериноса (21 микрон), пуговицы из натурального рога.',
    description_en: '100% extra-fine Australian merino wool with genuine horn buttons.',
    price: 96.00,
    old_price: 120.00,
    rating_score: 4.9,
    rating_count: 128,
    brand: 'Verdant Craft',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-dhE2nGIGxhDMdE8a8TL9KkxNb3NSgfIy9CoqElBuJFAduN-8GDmdmTUi6so8TF8zQ7VFIG1mC6op2xFcsrGtSly03jctOzLZVCnhVD0dA9Nf10qvMSZIBIwoa2xk6DriWxtFrP7qLifb-pS3GdsG3O125bYgyIb3xXrPPK5NDh9IC6wCvTRoroI_6bFGSGnEdTshmO1q8LzfAqdZXA3dyCXv7DaPFcQo6xt9ilshdM_ohHfvQ6VpEw',
    color: 'Графит',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    stock: 24,
    is_bestseller: 0,
    discount_percent: 20
  },
  {
    id: 'prod_2',
    category_id: 'cat_living',
    title_ru: 'Керамическая воронка для кофе',
    title_en: 'Artisanal Ceramic Pour-Over',
    description_ru: 'Гончарная керамика ручной формовки с матовой глазурью для идеальной фильтрации.',
    description_en: 'Hand-thrown pottery pour-over with textured matte glaze.',
    price: 54.00,
    old_price: 68.00,
    rating_score: 5.0,
    rating_count: 64,
    brand: 'Norse Studio',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzm7Nck3bkHzdyNjRRbw-c3jucFurZ_JHniQ0HwGXszdUYLOBDWfyJ1ibeKB0zenHaWTxQxfOCefdmNcdG7Y_s-J26elFo3CqEzuJ0E4hBHQo-sjbZqySmLLCEija9umnXCfRtrGOOg2X3q3ZZ-P7zUTDDJDAdvASRs7FdMMzmkgHjvx3rRR9sG-E8xgDnkijAvZ1VLvynchAyZWtiUsxQqv0o_o67LymxS-zhy6y7ig0_tliia7rc_Q',
    color: 'Слоновая кость',
    sizes: JSON.stringify(['One Size']),
    stock: 15,
    is_bestseller: 1,
    discount_percent: 20
  },
  {
    id: 'prod_3',
    category_id: 'cat_accessories',
    title_ru: 'Кожаный городской рюкзак',
    title_en: 'Cognac Leather Daypack',
    description_ru: 'Тосканская кожа растительного дубления со специальным отсеком для ноутбука до 16 дюймов.',
    description_en: 'Tuscan vegetable-tanned leather backpack with padded 16-inch laptop pocket.',
    price: 310.00,
    old_price: 360.00,
    rating_score: 4.9,
    rating_count: 210,
    brand: 'Atelier Minimal',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBV7ucfh4Tm9K3g8Rof6X1M8XGIDds_G0yIt7rmG-u2-sj6RjY9TwGXNEQFJ8XabQbJ6hkjYBUDhx0GgaawpgFNOHve3MRC6OuvcE2BPQ8iSIYdQJLWjf3FL7RDG9vDiF6srXJsx_BHpOEEwr6THUWFdqXfMmTY1lYOgrvhpqTmODVHho9i1N3RHtgb4TLE5Wa9ErblSGoZmudZkJt795qCFWXpkfcsekZZ4rsUu3PTiZz9Ecyuxp6ig',
    color: 'Янтарь',
    sizes: JSON.stringify(['One Size']),
    stock: 8,
    is_bestseller: 1,
    discount_percent: 14
  },
  {
    id: 'prod_4',
    category_id: 'cat_apparel',
    title_ru: 'Селвидж-деним ручной работы',
    title_en: 'Raw Selvedge Denim',
    description_ru: 'Японский деним Kurabo плотностью 14.5 унций. Нестираный, медная фурнитура.',
    description_en: 'Japanese Kurabo 14.5oz raw selvedge denim with solid copper rivets.',
    price: 155.00,
    old_price: 180.00,
    rating_score: 4.8,
    rating_count: 92,
    brand: 'Form & Function',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqf6wXcnhKxv1pzYb5psr5P26boHSSUCeYuK4NFHDgleAmrmH5BtOLyim77_gHDKooFMd1_TxqwPzq09pLUHosjVCyyB6CwTnk4SOO6M2gINkHyQrG9a981fNhGbil-B2EcOUxo2JGo94yUOvqTgr0vh_Mq8q_n3Hum4gFsHAZExcqk3gA1H5r5R2sW-YLJ3mB004B9Js_P-FLf-XcSJlpBHyUp0h5tQkPohAYLCpAcHkkH_NQKolPuw',
    color: 'Графит',
    sizes: JSON.stringify(['30/32', '32/32', '34/32']),
    stock: 19,
    is_bestseller: 0,
    discount_percent: 15
  },
  {
    id: 'prod_5',
    category_id: 'cat_living',
    title_ru: 'Ароматическая свеча из сои',
    title_en: 'Botanical Soy Candle',
    description_ru: 'Дикий кедр, японский кипарис Хиноки и чёрный янтарь. 65 часов чистого горения.',
    description_en: 'Wild cedar, Japanese Hinoki cypress, and black amber. 65-hour clean burn.',
    price: 38.00,
    old_price: 48.00,
    rating_score: 5.0,
    rating_count: 144,
    brand: 'Verdant Craft',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATt_IxIVtSqdwKjFgqd01A2K60B-4p1hYJiBafOXeR7IFAnNa3YtCX-N8Ic4SPzwb2xUp0jSpFAyO5kdNJK4vh_E4kVVmf8BQfX82_n-0X63xp0rDBBVRoHvV6R44wIK_grMd46385xAYYI_GW55T1Y0lQ4qrR-lA26riKA6fiYB1WRI9nu213WLgbHo3MZAOC-VBrISnPHb1T3oj13jEyRa4sXy3UrNCMAZNvpb8Q7HFDNiZHB2trtw',
    color: 'Янтарь',
    sizes: JSON.stringify(['250g']),
    stock: 42,
    is_bestseller: 1,
    discount_percent: 20
  },
  {
    id: 'prod_6',
    category_id: 'cat_living',
    title_ru: 'Льняная скатерть ручного плетения',
    title_en: 'Handwoven Linen Tablecloth',
    description_ru: '100% органический европейский лён плотностью 240 г/м², стирка с камнями (stonewashed).',
    description_en: '100% organic stonewashed European linen, 240 GSM heavy texture.',
    price: 78.00,
    old_price: 95.00,
    rating_score: 4.9,
    rating_count: 51,
    brand: 'Norse Studio',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzm7Nck3bkHzdyNjRRbw-c3jucFurZ_JHniQ0HwGXszdUYLOBDWfyJ1ibeKB0zenHaWTxQxfOCefdmNcdG7Y_s-J26elFo3CqEzuJ0E4hBHQo-sjbZqySmLLCEija9umnXCfRtrGOOg2X3q3ZZ-P7zUTDDJDAdvASRs7FdMMzmkgHjvx3rRR9sG-E8xgDnkijAvZ1VLvynchAyZWtiUsxQqv0o_o67LymxS-zhy6y7ig0_tliia7rc_Q',
    color: 'Песок',
    sizes: JSON.stringify(['140x220cm', '160x260cm']),
    stock: 12,
    is_bestseller: 0,
    discount_percent: 18
  }
];

const demoOrders = [
  {
    id: 'ord_101',
    customer_name: 'Алексей Смирнов',
    customer_email: 'alex@example.com',
    customer_phone: '+7 999 111-22-33',
    shipping_address: 'г. Москва, Пресненская наб. 12',
    payment_method: 'card',
    total_amount: 150.00,
    status: 'delivered',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'ord_102',
    customer_name: 'Елена Ковалева',
    customer_email: 'elena@example.com',
    customer_phone: '+7 999 222-33-44',
    shipping_address: 'г. Санкт-Петербург, Невский пр. 45',
    payment_method: 'card',
    total_amount: 310.00,
    status: 'shipped',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'ord_103',
    customer_name: 'Дмитрий Волков',
    customer_email: 'dmitry@example.com',
    customer_phone: '+7 999 333-44-55',
    shipping_address: 'г. Казань, ул. Баумана 8',
    payment_method: 'cash',
    total_amount: 96.00,
    status: 'processing',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'ord_104',
    customer_name: 'Анна Морозова',
    customer_email: 'anna@example.com',
    customer_phone: '+7 999 444-55-66',
    shipping_address: 'г. Екатеринбург, ул. Ленина 22',
    payment_method: 'card',
    total_amount: 54.00,
    status: 'pending',
    created_at: new Date(Date.now() - 600000).toISOString()
  }
];

function createSchema(sqliteDb) {
  sqliteDb.exec(`
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
}

function autoSeedIfNeeded(sqliteDb) {
  const countRow = sqliteDb.prepare('SELECT COUNT(*) as count FROM products').get();
  if (countRow && countRow.count > 0) return;

  const insertCategory = sqliteDb.prepare(`
    INSERT INTO categories (id, slug, name_ru, name_en, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const c of initialCategories) {
    insertCategory.run(c.id, c.slug, c.name_ru, c.name_en, c.sort_order);
  }

  const insertProduct = sqliteDb.prepare(`
    INSERT INTO products (
      id, category_id, title_ru, title_en, description_ru, description_en,
      price, old_price, rating_score, rating_count, brand,
      image_url, color, sizes, stock, is_bestseller, discount_percent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of initialProducts) {
    insertProduct.run(
      p.id, p.category_id, p.title_ru, p.title_en, p.description_ru, p.description_en,
      p.price, p.old_price, p.rating_score, p.rating_count, p.brand,
      p.image_url, p.color, p.sizes, p.stock, p.is_bestseller, p.discount_percent
    );
  }

  const insertOrder = sqliteDb.prepare(`
    INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const o of demoOrders) {
    insertOrder.run(o.id, o.customer_name, o.customer_email, o.customer_phone, o.shipping_address, o.payment_method, o.total_amount, o.status, o.created_at);
  }

  const insertOrderItem = sqliteDb.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_title, quantity, unit_price, selected_size, selected_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertOrderItem.run('item_1', 'ord_101', 'prod_1', 'Рубашка из мериносовой шерсти', 1, 96.00, 'L', 'Графит');
  insertOrderItem.run('item_2', 'ord_101', 'prod_2', 'Керамическая воронка для кофе', 1, 54.00, 'One Size', 'Слоновая кость');
  insertOrderItem.run('item_3', 'ord_102', 'prod_3', 'Кожаный городской рюкзак', 1, 310.00, 'One Size', 'Янтарь');
  insertOrderItem.run('item_4', 'ord_103', 'prod_1', 'Рубашка из мериносовой шерсти', 1, 96.00, 'M', 'Графит');
  insertOrderItem.run('item_5', 'ord_104', 'prod_2', 'Керамическая воронка для кофе', 1, 54.00, 'One Size', 'Слоновая кость');
}

// In-Memory Fallback Store if node:sqlite is not supported in the serverless environment
function createMemoryStore() {
  const store = {
    categories: [...initialCategories],
    products: [...initialProducts],
    orders: [...demoOrders],
    order_items: [
      { id: 'item_1', order_id: 'ord_101', product_id: 'prod_1', product_title: 'Рубашка из мериносовой шерсти', quantity: 1, unit_price: 96.00, selected_size: 'L', selected_color: 'Графит' },
      { id: 'item_2', order_id: 'ord_101', product_id: 'prod_2', product_title: 'Керамическая воронка для кофе', quantity: 1, unit_price: 54.00, selected_size: 'One Size', selected_color: 'Слоновая кость' },
      { id: 'item_3', order_id: 'ord_102', product_id: 'prod_3', product_title: 'Кожаный городской рюкзак', quantity: 1, unit_price: 310.00, selected_size: 'One Size', selected_color: 'Янтарь' },
      { id: 'item_4', order_id: 'ord_103', product_id: 'prod_1', product_title: 'Рубашка из мериносовой шерсти', quantity: 1, unit_price: 96.00, selected_size: 'M', selected_color: 'Графит' },
      { id: 'item_5', order_id: 'ord_104', product_id: 'prod_2', product_title: 'Керамическая воронка для кофе', quantity: 1, unit_price: 54.00, selected_size: 'One Size', selected_color: 'Слоновая кость' }
    ]
  };

  return {
    exec() {},
    prepare(sql) {
      const trimmed = sql.trim();
      return {
        all(...params) {
          if (trimmed.includes('FROM categories')) {
            return [...store.categories].sort((a, b) => a.sort_order - b.sort_order);
          }
          if (trimmed.includes('FROM products')) {
            return store.products;
          }
          if (trimmed.includes('FROM order_items WHERE order_id = ?')) {
            return store.order_items.filter(item => item.order_id === params[0]);
          }
          if (trimmed.includes('FROM orders') && trimmed.includes('status, COUNT(*)')) {
            const counts = {};
            for (const o of store.orders) counts[o.status] = (counts[o.status] || 0) + 1;
            return Object.entries(counts).map(([status, count]) => ({ status, count }));
          }
          if (trimmed.includes('FROM orders')) {
            return [...store.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          }
          return [];
        },
        get(...params) {
          if (trimmed.includes('SELECT * FROM products WHERE id = ?')) {
            return store.products.find(p => p.id === params[0]);
          }
          if (trimmed.includes('SELECT id, title_ru, price, stock FROM products WHERE id = ?')) {
            return store.products.find(p => p.id === params[0]);
          }
          if (trimmed.includes('SELECT * FROM orders WHERE id = ?')) {
            return store.orders.find(o => o.id === params[0]);
          }
          if (trimmed.includes('SUM(total_amount)')) {
            const total = store.orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
            return { total };
          }
          if (trimmed.includes('COUNT(*) as count FROM orders')) {
            return { count: store.orders.length };
          }
          if (trimmed.includes('COUNT(*) as count FROM products')) {
            return { count: store.products.length };
          }
          return null;
        },
        run(...params) {
          if (trimmed.includes('INSERT INTO orders')) {
            const [id, customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status] = params;
            store.orders.unshift({
              id, customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status: status || 'pending',
              created_at: new Date().toISOString()
            });
            return { changes: 1 };
          }
          if (trimmed.includes('INSERT INTO order_items')) {
            const [id, order_id, product_id, product_title, quantity, unit_price, selected_size, selected_color] = params;
            store.order_items.push({ id, order_id, product_id, product_title, quantity, unit_price, selected_size, selected_color });
            return { changes: 1 };
          }
          if (trimmed.includes('UPDATE orders SET status = ? WHERE id = ?')) {
            const [status, id] = params;
            const order = store.orders.find(o => o.id === id);
            if (order) {
              order.status = status;
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          return { changes: 1 };
        }
      };
    }
  };
}

function initDb() {
  try {
    const { DatabaseSync } = require('node:sqlite');
    let dbPath;

    if (isVercel) {
      dbPath = ':memory:';
    } else {
      const dataDir = path.join(__dirname, '..', '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      dbPath = path.join(dataDir, 'ecommerce.db');
    }

    const sqliteDb = new DatabaseSync(dbPath);
    if (dbPath !== ':memory:') {
      try { sqliteDb.exec('PRAGMA journal_mode = WAL;'); } catch (_) {}
    }
    try { sqliteDb.exec('PRAGMA foreign_keys = ON;'); } catch (_) {}
    createSchema(sqliteDb);
    autoSeedIfNeeded(sqliteDb);
    return sqliteDb;
  } catch (err) {
    console.warn('[DB] Falling back to high-fidelity in-memory store:', err.message);
    return createMemoryStore();
  }
}

const db = initDb();
module.exports = db;