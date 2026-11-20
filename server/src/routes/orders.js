const express = require('express');
const router = express.Router();
const db = require('../db/database');

const PROMO_CODES = {
  'VERDANT10': { discountPercent: 10, description: 'Скидка 10% на весь заказ' },
  'ECO2025': { discountPercent: 15, description: 'Эко-скидка 15%' },
  'MANGO': { discountPercent: 5, description: 'Специальная скидка 5%' }
};

// POST /api/promocodes/validate
router.post('/promocodes/validate', (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, error: 'Введите промокод' });
    }

    const cleanCode = code.trim().toUpperCase();
    const promo = PROMO_CODES[cleanCode];

    if (!promo) {
      return res.status(400).json({ valid: false, error: 'Неверный или устаревший промокод' });
    }

    res.json({
      valid: true,
      code: cleanCode,
      discountPercent: promo.discountPercent,
      description: promo.description
    });
  } catch (err) {
    res.status(500).json({ valid: false, error: 'Ошибка проверки промокода', details: err.message });
  }
});

// POST /api/orders
router.post('/orders', (req, res) => {
  try {
    const { customer, items, paymentMethod, promoCode } = req.body;

    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({ error: 'Заполните все контактные данные покупателя' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    const orderId = 'ord_' + Date.now();
    let subtotal = 0;
    const validatedItems = [];

    // Verify each product and price against database
    for (const item of items) {
      const prod = db.prepare('SELECT id, title_ru, price, stock FROM products WHERE id = ?').get(item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Товар с ID ${item.productId} не найден` });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const itemTotal = prod.price * qty;
      subtotal += itemTotal;

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

    // Calculate discount if promoCode provided
    let discountAmount = 0;
    let appliedPromo = null;
    if (promoCode && typeof promoCode === 'string') {
      const cleanCode = promoCode.trim().toUpperCase();
      if (PROMO_CODES[cleanCode]) {
        appliedPromo = cleanCode;
        discountAmount = parseFloat(((subtotal * PROMO_CODES[cleanCode].discountPercent) / 100).toFixed(2));
      }
    }

    const totalAmount = Math.max(0, parseFloat((subtotal - discountAmount).toFixed(2)));

    // Insert order in database
    db.prepare(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, promo_code, discount_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(
      orderId,
      customer.name.trim(),
      customer.email.trim(),
      customer.phone.trim(),
      customer.address.trim(),
      paymentMethod || 'card',
      totalAmount,
      appliedPromo,
      discountAmount
    );

    // Insert items & deduct stock
    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, product_title, quantity, unit_price, selected_size, selected_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateStock = db.prepare(`
      UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?
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
      try {
        updateStock.run(vItem.quantity, vItem.productId);
      } catch (_) {}
    }

    res.status(201).json({
      success: true,
      orderId,
      subtotal,
      discountAmount,
      promoCode: appliedPromo,
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
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
});

module.exports = router;
