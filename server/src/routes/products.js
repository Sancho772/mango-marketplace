const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

// GET /api/products
router.get('/products', (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, brand, sort } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all' && category !== 'cat_all') {
      query += ' AND (category_id = ? OR category_id IN (SELECT id FROM categories WHERE slug = ?))';
      params.push(category, category);
    }

    if (search) {
      query += ' AND (title_ru LIKE ? OR title_en LIKE ? OR brand LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (minPrice) {
      query += ' AND price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(Number(maxPrice));
    }

    if (brand) {
      query += ' AND brand = ?';
      params.push(brand);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price DESC';
        break;
      case 'rating':
        query += ' ORDER BY rating_score DESC';
        break;
      case 'new':
      default:
        query += ' ORDER BY is_bestseller DESC, rating_score DESC';
        break;
    }

    const rows = db.prepare(query).all(...params);

    // Parse JSON sizes
    const products = rows.map(p => ({
      ...p,
      sizes: p.sizes ? JSON.parse(p.sizes) : []
    }));

    res.json({
      total: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

// GET /api/products/:id
router.get('/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.sizes = product.sizes ? JSON.parse(product.sizes) : [];
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product', details: err.message });
  }
});

module.exports = router;
