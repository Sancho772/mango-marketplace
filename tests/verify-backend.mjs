async function run() {
  const healthRes = await fetch('http://127.0.0.1:4000/api/health');
  if (!healthRes.ok) throw new Error('Health check failed: ' + healthRes.status);
  const health = await healthRes.json();
  if (health.status !== 'ok') throw new Error('Health check invalid');

  const prodsRes = await fetch('http://127.0.0.1:4000/api/products');
  if (!prodsRes.ok) throw new Error('Products check failed: ' + prodsRes.status);
  const prods = await prodsRes.json();
  if (!Array.isArray(prods.products) || prods.products.length === 0) {
    throw new Error('Products array empty or missing');
  }

  const catsRes = await fetch('http://127.0.0.1:4000/api/categories');
  if (!catsRes.ok) throw new Error('Categories check failed: ' + catsRes.status);
  const cats = await catsRes.json();
  if (!Array.isArray(cats) || cats.length === 0) {
    throw new Error('Categories array empty or missing');
  }

  const metricsRes = await fetch('http://127.0.0.1:4000/api/admin/metrics');
  if (!metricsRes.ok) throw new Error('Admin metrics check failed: ' + metricsRes.status);
  const metrics = await metricsRes.json();
  if (typeof metrics.revenue !== 'number') {
    throw new Error('Admin revenue not a number');
  }

  console.log('backend api checks passed');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
