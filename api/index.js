const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Pre-load static storefront files into memory
const staticFiles = [
  'index.html',
  'catalog_ru.html',
  'catalog_en.html',
  'checkout_ru.html',
  'checkout_en.html',
  'admin_ru.html',
  'admin_en.html',
  'hub.html',
  'mobile_ru.html',
  'mobile_en.html',
  'ecommerce.js',
  'catalog.js',
  'checkout.js',
  'admin.js'
];

const fileCache = {};
for (const file of staticFiles) {
  try {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      fileCache[file] = fs.readFileSync(fullPath);
    }
  } catch (err) {
    console.warn('Could not read static file:', file, err.message);
  }
}

function serveFile(res, filename) {
  const content = fileCache[filename];
  if (!content) {
    try {
      const fullPath = path.join(__dirname, '..', filename);
      if (fs.existsSync(fullPath)) {
        if (filename.endsWith('.js')) res.type('application/javascript');
        else if (filename.endsWith('.html')) res.type('text/html');
        return res.sendFile(fullPath);
      }
    } catch (_) {}
    return res.status(404).send('File not found: ' + filename);
  }

  if (filename.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  } else if (filename.endsWith('.html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  }
  res.send(content);
}

// Storefront static page routes
app.get('/', (req, res) => serveFile(res, 'index.html'));
app.get('/index.html', (req, res) => serveFile(res, 'index.html'));

for (const file of staticFiles) {
  app.get('/' + file, (req, res) => serveFile(res, file));
}

// In-Memory Database for Live API
const categories = [
  { id: 'cat_all', slug: 'all', name_ru: 'Все новинки', name_en: 'All New Arrivals', sort_order: 1 },
  { id: 'cat_apparel', slug: 'apparel', name_ru: 'Одежда и трикотаж', name_en: 'Apparel & Knitwear', sort_order: 2 },
  { id: 'cat_living', slug: 'living', name_ru: 'Посуда и декор', name_en: 'Living & Decor', sort_order: 3 },
  { id: 'cat_accessories', slug: 'accessories', name_ru: 'Изделия из кожи', name_en: 'Leather & Accessories', sort_order: 4 },
  { id: 'cat_fragrance', slug: 'fragrance', name_ru: 'Ароматы для дома', name_en: 'Home Fragrance', sort_order: 5 }
];

const products = [
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
    sizes: ['S', 'M', 'L', 'XL'],
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
    sizes: ['One Size'],
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
    sizes: ['One Size'],
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
    sizes: ['30/32', '32/32', '34/32'],
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
    sizes: ['250g'],
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
    sizes: ['140x220cm', '160x260cm'],
    stock: 12,
    is_bestseller: 0,
    discount_percent: 18
  }
];

const orders = [
  {
    id: 'ord_101',
    customer_name: 'Алексей Смирнов',
    customer_email: 'alex@example.com',
    customer_phone: '+7 999 111-22-33',
    shipping_address: 'г. Москва, Пресненская наб. 12',
    payment_method: 'card',
    total_amount: 150.00,
    status: 'delivered',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    items: [
      { id: 'item_1', order_id: 'ord_101', product_id: 'prod_1', product_title: 'Рубашка из мериносовой шерсти', quantity: 1, unit_price: 96.00, selected_size: 'L', selected_color: 'Графит' },
      { id: 'item_2', order_id: 'ord_101', product_id: 'prod_2', product_title: 'Керамическая воронка для кофе', quantity: 1, unit_price: 54.00, selected_size: 'One Size', selected_color: 'Слоновая кость' }
    ]
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
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    items: [
      { id: 'item_3', order_id: 'ord_102', product_id: 'prod_3', product_title: 'Кожаный городской рюкзак', quantity: 1, unit_price: 310.00, selected_size: 'One Size', selected_color: 'Янтарь' }
    ]
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
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    items: [
      { id: 'item_4', order_id: 'ord_103', product_id: 'prod_1', product_title: 'Рубашка из мериносовой шерсти', quantity: 1, unit_price: 96.00, selected_size: 'M', selected_color: 'Графит' }
    ]
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
    created_at: new Date(Date.now() - 600000).toISOString(),
    items: [
      { id: 'item_5', order_id: 'ord_104', product_id: 'prod_2', product_title: 'Керамическая воронка для кофе', quantity: 1, unit_price: 54.00, selected_size: 'One Size', selected_color: 'Слоновая кость' }
    ]
  }
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mango-marketplace-api',
    timestamp: new Date().toISOString()
  });
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json([...categories].sort((a, b) => a.sort_order - b.sort_order));
});

// Products
app.get('/api/products', (req, res) => {
  const { category, search, minPrice, maxPrice, brand, sort } = req.query;
  let result = [...products];

  if (category && category !== 'all' && category !== 'cat_all') {
    result = result.filter(p => p.category_id === category || categories.find(c => c.slug === category && c.id === p.category_id));
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p => 
      (p.title_ru && p.title_ru.toLowerCase().includes(q)) ||
      (p.title_en && p.title_en.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q))
    );
  }

  if (minPrice) {
    result = result.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    result = result.filter(p => p.price <= Number(maxPrice));
  }

  if (brand) {
    result = result.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  switch (sort) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => b.rating_score - a.rating_score);
      break;
    case 'new':
    default:
      result.sort((a, b) => (b.is_bestseller || 0) - (a.is_bestseller || 0) || b.rating_score - a.rating_score);
      break;
  }

  res.json({
    total: result.length,
    products: result
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  res.json(product);
});

// Orders
app.post('/api/orders', (req, res) => {
  const { customer, items, paymentMethod } = req.body;

  if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
    return res.status(400).json({ error: 'Заполните все контактные данные покупателя' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }

  const orderId = 'ord_' + Date.now();
  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) {
      return res.status(400).json({ error: `Товар с ID ${item.productId} не найден` });
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const itemTotal = prod.price * qty;
    totalAmount += itemTotal;

    validatedItems.push({
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      productId: prod.id,
      title: prod.title_ru,
      unitPrice: prod.price,
      quantity: qty,
      size: item.size || 'Standard',
      color: item.color || 'Standard'
    });
  }

  const newOrder = {
    id: orderId,
    customer_name: customer.name.trim(),
    customer_email: customer.email.trim(),
    customer_phone: customer.phone.trim(),
    shipping_address: customer.address.trim(),
    payment_method: paymentMethod || 'card',
    total_amount: totalAmount,
    status: 'pending',
    created_at: new Date().toISOString(),
    items: validatedItems
  };

  orders.unshift(newOrder);

  res.status(201).json({
    success: true,
    orderId,
    totalAmount,
    status: 'pending',
    message: 'Заказ успешно создан'
  });
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }
  res.json(order);
});

// Admin
app.get('/api/admin/metrics', (req, res) => {
  const revenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const orderCount = orders.length;
  const avgCheck = orderCount > 0 ? (revenue / orderCount) : 0;

  const statusMap = {};
  for (const o of orders) {
    statusMap[o.status] = (statusMap[o.status] || 0) + 1;
  }
  const statusCounts = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  res.json({
    revenue: parseFloat(revenue.toFixed(2)),
    ordersCount: orderCount,
    averageCheck: parseFloat(avgCheck.toFixed(2)),
    productsCount: products.length,
    conversionRate: '3.4%',
    statusCounts
  });
});

app.get('/api/admin/orders', (req, res) => {
  const { status, limit = 50 } = req.query;
  let result = [...orders];
  if (status) {
    result = result.filter(o => o.status === status);
  }
  res.json(result.slice(0, Number(limit)));
});

app.patch('/api/admin/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }
  order.status = status;
  res.json({ success: true, orderId: req.params.id, status });
});

module.exports = app;
