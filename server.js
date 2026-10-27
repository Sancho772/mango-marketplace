// Mango Marketplace — Unified Full-Stack Server
// Serves static frontend + live SQLite REST API
process.env.PORT = process.env.PORT || 4000;
const app = require('./server/src/index.js');

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  // If not already listening
  try {
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`🚀 Mango Marketplace unified server listening on http://127.0.0.1:${PORT}`);
    });
  } catch (_) {}
}

module.exports = app;
