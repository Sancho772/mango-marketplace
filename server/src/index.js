const express = require('express');
const cors = require('cors');
const path = require('node:path');

const storefront = require('./storefront');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', productsRouter);
app.use('/api', ordersRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mango-marketplace-api',
    timestamp: new Date().toISOString()
  });
});

// Storefront routes (HTML pages)
app.get(['/', '/index.html', '/catalog_ru.html', '/catalog_en.html', '/catalog'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(storefront.catalogHtml);
});

app.get(['/checkout_ru.html', '/checkout_en.html', '/checkout'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(storefront.checkoutHtml);
});

app.get(['/admin_ru.html', '/admin_en.html', '/admin'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(storefront.adminHtml);
});

app.get(['/hub.html', '/hub'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(storefront.hubHtml);
});

// Static JavaScript assets
app.get('/ecommerce.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.send(storefront.ecommerceJs);
});

app.get('/catalog.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.send(storefront.catalogJs);
});

app.get('/checkout.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.send(storefront.checkoutJs);
});

app.get('/admin.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.send(storefront.adminJs);
});

// Fallback static files for local disk development
const publicDir = path.join(__dirname, '..', '..');
app.use(express.static(publicDir));

// Global 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Catch-all route returns catalog storefront
app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(storefront.catalogHtml);
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

if (require.main === module) {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`===============================================`);
    console.log(`🚀 Mango Marketplace API Server is running!`);
    console.log(`📡 Base URL: http://127.0.0.1:${PORT}`);
    console.log(`===============================================`);
  });
}

module.exports = app;
