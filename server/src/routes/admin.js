const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/admin/metrics
router.get('/metrics', (req, res) => {
  try {
    const totalRevenueRow = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders').get();
    const ordersCountRow = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const productsCountRow = db.prepare('SELECT COUNT(*) as count FROM products').get();

    const revenue = totalRevenueRow ? totalRevenueRow.total : 0;
    const orderCount = ordersCountRow ? ordersCountRow.count : 0;
    const avgCheck = orderCount > 0 ? (revenue / orderCount) : 0;

    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `).all();

    res.json({
      revenue: parseFloat(revenue.toFixed(2)),
      ordersCount: orderCount,
      averageCheck: parseFloat(avgCheck.toFixed(2)),
      productsCount: productsCountRow ? productsCountRow.count : 0,
      conversionRate: '3.4%',
      statusCounts
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin metrics', details: err.message });
  }
});

// GET /api/admin/orders
router.get('/orders', (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    const orders = db.prepare(query).all(...params);

    // Fetch items for each order
    const ordersWithItems = orders.map(ord => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return {
        ...ord,
        items
      };
    });

    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin orders', details: err.message });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус заказа' });
    }

    const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json({ success: true, orderId: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// POST /api/admin/products
router.post('/products', (req, res) => {
  try {
    const {
      title_ru,
      title_en,
      category_id,
      description_ru,
      description_en,
      price,
      old_price,
      brand,
      image_url,
      color,
      sizes,
      stock,
      is_bestseller,
      discount_percent
    } = req.body;

    if (!title_ru || !price || !category_id) {
      return res.status(400).json({ error: 'Название, категория и цена обязательны' });
    }

    const id = 'prod_' + Date.now();
    const sizesJson = Array.isArray(sizes) ? JSON.stringify(sizes) : (typeof sizes === 'string' ? sizes : JSON.stringify(['One Size']));

    db.prepare(`
      INSERT INTO products (
        id, category_id, title_ru, title_en, description_ru, description_en,
        price, old_price, rating_score, rating_count, brand,
        image_url, color, sizes, stock, is_bestseller, discount_percent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      category_id,
      title_ru.trim(),
      (title_en || title_ru).trim(),
      description_ru || '',
      description_en || description_ru || '',
      Number(price),
      old_price ? Number(old_price) : null,
      5.0,
      1,
      brand || 'VERDANT',
      image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
      color || 'Естественный',
      sizesJson,
      Number(stock) || 10,
      is_bestseller ? 1 : 0,
      discount_percent ? Number(discount_percent) : 0
    );

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json({ success: true, product: { ...created, sizes: JSON.parse(created.sizes || '[]') } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const {
      title_ru,
      title_en,
      category_id,
      description_ru,
      description_en,
      price,
      old_price,
      brand,
      image_url,
      color,
      sizes,
      stock,
      is_bestseller,
      discount_percent
    } = req.body;

    const sizesJson = Array.isArray(sizes) ? JSON.stringify(sizes) : (sizes ? String(sizes) : existing.sizes);

    db.prepare(`
      UPDATE products SET
        title_ru = ?,
        title_en = ?,
        category_id = ?,
        description_ru = ?,
        description_en = ?,
        price = ?,
        old_price = ?,
        brand = ?,
        image_url = ?,
        color = ?,
        sizes = ?,
        stock = ?,
        is_bestseller = ?,
        discount_percent = ?
      WHERE id = ?
    `).run(
      title_ru !== undefined ? title_ru : existing.title_ru,
      title_en !== undefined ? title_en : existing.title_en,
      category_id !== undefined ? category_id : existing.category_id,
      description_ru !== undefined ? description_ru : existing.description_ru,
      description_en !== undefined ? description_en : existing.description_en,
      price !== undefined ? Number(price) : existing.price,
      old_price !== undefined ? (old_price ? Number(old_price) : null) : existing.old_price,
      brand !== undefined ? brand : existing.brand,
      image_url !== undefined ? image_url : existing.image_url,
      color !== undefined ? color : existing.color,
      sizesJson,
      stock !== undefined ? Number(stock) : existing.stock,
      is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : existing.is_bestseller,
      discount_percent !== undefined ? Number(discount_percent) : existing.discount_percent,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json({ success: true, product: { ...updated, sizes: JSON.parse(updated.sizes || '[]') } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    try {
      db.prepare('DELETE FROM order_items WHERE product_id = ?').run(id);
    } catch (_) {}

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true, message: 'Товар успешно удален', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

module.exports = router;
