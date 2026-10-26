const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/orders
router.post('/orders', (req, res) => {
  try {
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

    // Verify each product and price against database (NO MOCKS, secure calculation)
    for (const item of items) {
      const prod = db.prepare('SELECT id, title_ru, price, stock FROM products WHERE id = ?').get(item.productId);
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

    // Insert order in database
    db.prepare(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(
      orderId,
      customer.name.trim(),
      customer.email.trim(),
      customer.phone.trim(),
      customer.address.trim(),
      paymentMethod || 'card',
      totalAmount
    );

    // Insert items
    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, product_title, quantity, unit_price, selected_size, selected_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const vItem of validatedItems) {
      insertItem.run(
        vItem.id,
        orderId,
        vItem.productId,
        vItem.title,
        vItem.quantity,
        vItem.unitPrice,
        vItem.size,
        vItem.color
      );
    }

    res.status(201).json({
      success: true,
      orderId,
      totalAmount,
      status: 'pending',
      message: 'Заказ успешно создан'
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при оформлении заказа', details: err.message });
  }
});

// GET /api/orders/:id
router.get('/orders/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    res.json({
      ...order,
      items
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении заказа', details: err.message });
  }
});

module.exports = router;
