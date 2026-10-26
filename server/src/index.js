const express = require('express');
const cors = require('cors');
const path = require('node:path');

const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files (prototypes, hub, assets)
const publicDir = path.join(__dirname, '..', '..');
app.use(express.static(publicDir));

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

// Global 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`===============================================`);
  console.log(`🚀 Mango Marketplace API Server is running!`);
  console.log(`📡 Base URL: http://127.0.0.1:${PORT}`);
  console.log(`📦 REST Endpoints:`);
  console.log(`   - GET  http://127.0.0.1:${PORT}/api/products`);
  console.log(`   - GET  http://127.0.0.1:${PORT}/api/categories`);
  console.log(`   - POST http://127.0.0.1:${PORT}/api/orders`);
  console.log(`   - GET  http://127.0.0.1:${PORT}/api/admin/metrics`);
  console.log(`   - GET  http://127.0.0.1:${PORT}/api/admin/orders`);
  console.log(`===============================================`);
});

module.exports = app;
