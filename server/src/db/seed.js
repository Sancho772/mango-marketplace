const db = require('./database');

console.log('Seeding database with Stitch catalog products...');

// Clear existing tables
db.exec('DELETE FROM order_items;');
db.exec('DELETE FROM orders;');
db.exec('DELETE FROM products;');
db.exec('DELETE FROM categories;');

// Seed Categories
const insertCategory = db.prepare(`
  INSERT INTO categories (id, slug, name_ru, name_en, sort_order)
  VALUES (?, ?, ?, ?, ?)
`);

const categories = [
  ['cat_all', 'all', 'Все новинки', 'All New Arrivals', 1],
  ['cat_apparel', 'apparel', 'Одежда и трикотаж', 'Apparel & Knitwear', 2],
  ['cat_living', 'living', 'Посуда и декор', 'Living & Decor', 3],
  ['cat_accessories', 'accessories', 'Изделия из кожи', 'Leather & Accessories', 4],
  ['cat_fragrance', 'fragrance', 'Ароматы для дома', 'Home Fragrance', 5]
];

for (const cat of categories) {
  insertCategory.run(...cat);
}

// Seed Products
const insertProduct = db.prepare(`
  INSERT INTO products (
    id, category_id, title_ru, title_en, description_ru, description_en,
    price, old_price, rating_score, rating_count, brand,
    image_url, color, sizes, stock, is_bestseller, discount_percent
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const products = [
  [
    'prod_1',
    'cat_apparel',
    'Рубашка из мериносовой шерсти',
    'Merino Wool Overshirt',
    '100% ультратонкая австралийская шерсть мериноса (21 микрон), пуговицы из натурального рога.',
    '100% extra-fine Australian merino wool with genuine horn buttons.',
    96.00,
    120.00,
    4.9,
    128,
    'Verdant Craft',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC-dhE2nGIGxhDMdE8a8TL9KkxNb3NSgfIy9CoqElBuJFAduN-8GDmdmTUi6so8TF8zQ7VFIG1mC6op2xFcsrGtSly03jctOzLZVCnhVD0dA9Nf10qvMSZIBIwoa2xk6DriWxtFrP7qLifb-pS3GdsG3O125bYgyIb3xXrPPK5NDh9IC6wCvTRoroI_6bFGSGnEdTshmO1q8LzfAqdZXA3dyCXv7DaPFcQo6xt9ilshdM_ohHfvQ6VpEw',
    'Графит',
    JSON.stringify(['S', 'M', 'L', 'XL']),
    24,
    0,
    20
  ],
  [
    'prod_2',
    'cat_living',
    'Керамическая воронка для кофе',
    'Artisanal Ceramic Pour-Over',
    'Гончарная керамика ручной формовки с матовой глазурью для идеальной фильтрации.',
    'Hand-thrown pottery pour-over with textured matte glaze.',
    54.00,
    68.00,
    5.0,
    64,
    'Norse Studio',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCzm7Nck3bkHzdyNjRRbw-c3jucFurZ_JHniQ0HwGXszdUYLOBDWfyJ1ibeKB0zenHaWTxQxfOCefdmNcdG7Y_s-J26elFo3CqEzuJ0E4hBHQo-sjbZqySmLLCEija9umnXCfRtrGOOg2X3q3ZZ-P7zUTDDJDAdvASRs7FdMMzmkgHjvx3rRR9sG-E8xgDnkijAvZ1VLvynchAyZWtiUsxQqv0o_o67LymxS-zhy6y7ig0_tliia7rc_Q',
    'Слоновая кость',
    JSON.stringify(['One Size']),
    15,
    1,
    20
  ],
  [
    'prod_3',
    'cat_accessories',
    'Кожаный городской рюкзак',
    'Cognac Leather Daypack',
    'Тосканская кожа растительного дубления со специальным отсеком для ноутбука до 16 дюймов.',
    'Tuscan vegetable-tanned leather backpack with padded 16-inch laptop pocket.',
    310.00,
    360.00,
    4.9,
    210,
    'Atelier Minimal',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBBV7ucfh4Tm9K3g8Rof6X1M8XGIDds_G0yIt7rmG-u2-sj6RjY9TwGXNEQFJ8XabQbJ6hkjYBUDhx0GgaawpgFNOHve3MRC6OuvcE2BPQ8iSIYdQJLWjf3FL7RDG9vDiF6srXJsx_BHpOEEwr6THUWFdqXfMmTY1lYOgrvhpqTmODVHho9i1N3RHtgb4TLE5Wa9ErblSGoZmudZkJt795qCFWXpkfcsekZZ4rsUu3PTiZz9Ecyuxp6ig',
    'Янтарь',
    JSON.stringify(['One Size']),
    8,
    1,
    14
  ],
  [
    'prod_4',
    'cat_apparel',
    'Селвидж-деним ручной работы',
    'Raw Selvedge Denim',
    'Японский деним Kurabo плотностью 14.5 унций. Нестираный, медная фурнитура.',
    'Japanese Kurabo 14.5oz raw selvedge denim with solid copper rivets.',
    155.00,
    180.00,
    4.8,
    92,
    'Form & Function',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCqf6wXcnhKxv1pzYb5psr5P26boHSSUCeYuK4NFHDgleAmrmH5BtOLyim77_gHDKooFMd1_TxqwPzq09pLUHosjVCyyB6CwTnk4SOO6M2gINkHyQrG9a981fNhGbil-B2EcOUxo2JGo94yUOvqTgr0vh_Mq8q_n3Hum4gFsHAZExcqk3gA1H5r5R2sW-YLJ3mB004B9Js_P-FLf-XcSJlpBHyUp0h5tQkPohAYLCpAcHkkH_NQKolPuw',
    'Графит',
    JSON.stringify(['30/32', '32/32', '34/32']),
    19,
    0,
    15
  ],
  [
    'prod_5',
    'cat_living',
    'Ароматическая свеча из сои',
    'Botanical Soy Candle',
    'Дикий кедр, японский кипарис Хиноки и чёрный янтарь. 65 часов чистого горения.',
    'Wild cedar, Japanese Hinoki cypress, and black amber. 65-hour clean burn.',
    38.00,
    48.00,
    5.0,
    144,
    'Verdant Craft',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuATt_IxIVtSqdwKjFgqd01A2K60B-4p1hYJiBafOXeR7IFAnNa3YtCX-N8Ic4SPzwb2xUp0jSpFAyO5kdNJK4vh_E4kVVmf8BQfX82_n-0X63xp0rDBBVRoHvV6R44wIK_grMd46385xAYYI_GW55T1Y0lQ4qrR-lA26riKA6fiYB1WRI9nu213WLgbHo3MZAOC-VBrISnPHb1T3oj13jEyRa4sXy3UrNCMAZNvpb8Q7HFDNiZHB2trtw',
    'Янтарь',
    JSON.stringify(['250g']),
    42,
    1,
    20
  ],
  [
    'prod_6',
    'cat_living',
    'Льняная скатерть ручного плетения',
    'Handwoven Linen Tablecloth',
    '100% органический европейский лён плотностью 240 г/м², стирка с камнями (stonewashed).',
    '100% organic stonewashed European linen, 240 GSM heavy texture.',
    78.00,
    95.00,
    4.9,
    51,
    'Norse Studio',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCzm7Nck3bkHzdyNjRRbw-c3jucFurZ_JHniQ0HwGXszdUYLOBDWfyJ1ibeKB0zenHaWTxQxfOCefdmNcdG7Y_s-J26elFo3CqEzuJ0E4hBHQo-sjbZqySmLLCEija9umnXCfRtrGOOg2X3q3ZZ-P7zUTDDJDAdvASRs7FdMMzmkgHjvx3rRR9sG-E8xgDnkijAvZ1VLvynchAyZWtiUsxQqv0o_o67LymxS-zhy6y7ig0_tliia7rc_Q',
    'Песок',
    JSON.stringify(['140x220cm', '160x260cm']),
    12,
    0,
    18
  ]
];

for (const prod of products) {
  insertProduct.run(...prod);
}

// Seed Demo Initial Orders for Admin Dashboard
const insertOrder = db.prepare(`
  INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
`);

const insertOrderItem = db.prepare(`
  INSERT INTO order_items (id, order_id, product_id, product_title, quantity, unit_price, selected_size, selected_color)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const demoOrders = [
  ['ord_101', 'Алексей Смирнов', 'alex@example.com', '+7 999 111-22-33', 'г. Москва, Пресненская наб. 12', 'card', 150.00, 'delivered', '-2 days'],
  ['ord_102', 'Елена Ковалева', 'elena@example.com', '+7 999 222-33-44', 'г. Санкт-Петербург, Невский пр. 45', 'card', 310.00, 'shipped', '-1 day'],
  ['ord_103', 'Дмитрий Волков', 'dmitry@example.com', '+7 999 333-44-55', 'г. Казань, ул. Баумана 8', 'cash', 96.00, 'processing', '-3 hours'],
  ['ord_104', 'Анна Морозова', 'anna@example.com', '+7 999 444-55-66', 'г. Екатеринбург, ул. Ленина 22', 'card', 54.00, 'pending', '-10 minutes']
];

for (const ord of demoOrders) {
  insertOrder.run(...ord);
}

// Insert order items
insertOrderItem.run('item_1', 'ord_101', 'prod_1', 'Рубашка из мериносовой шерсти', 1, 96.00, 'L', 'Графит');
insertOrderItem.run('item_2', 'ord_101', 'prod_2', 'Керамическая воронка для кофе', 1, 54.00, 'One Size', 'Слоновая кость');
insertOrderItem.run('item_3', 'ord_102', 'prod_3', 'Кожаный городской рюкзак', 1, 310.00, 'One Size', 'Янтарь');
insertOrderItem.run('item_4', 'ord_103', 'prod_1', 'Рубашка из мериносовой шерсти', 1, 96.00, 'M', 'Графит');
insertOrderItem.run('item_5', 'ord_104', 'prod_2', 'Керамическая воронка для кофе', 1, 54.00, 'One Size', 'Слоновая кость');

console.log('Seeding completed successfully!');
