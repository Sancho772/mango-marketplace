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

module.exports = router;
