import fs from 'node:fs';

async function run() {
  if (!fs.existsSync('admin.js')) throw new Error('admin.js missing');

  const adminRu = fs.readFileSync('admin_ru.html', 'utf8');
  if (!adminRu.includes('id="adminOrdersTable"') || !adminRu.includes('src="admin.js"')) {
    throw new Error('admin_ru.html missing admin bindings or scripts');
  }

  const adminEn = fs.readFileSync('admin_en.html', 'utf8');
  if (!adminEn.includes('id="adminOrdersTable"') || !adminEn.includes('src="admin.js"')) {
    throw new Error('admin_en.html missing admin bindings or scripts');
  }

  // 1. Check live admin metrics endpoint
  const metricsRes = await fetch('http://127.0.0.1:4000/api/admin/metrics');
  if (!metricsRes.ok) throw new Error('Failed to fetch admin metrics: ' + metricsRes.status);
  const metrics = await metricsRes.json();
  if (typeof metrics.revenue !== 'number' || typeof metrics.ordersCount !== 'number') {
    throw new Error('Invalid metrics response format');
  }

  // 2. Check live admin orders endpoint
  const ordersRes = await fetch('http://127.0.0.1:4000/api/admin/orders');
  if (!ordersRes.ok) throw new Error('Failed to fetch admin orders: ' + ordersRes.status);
  const orders = await ordersRes.json();
  if (!Array.isArray(orders)) throw new Error('Admin orders should be an array');

  // 3. Test status PATCH on existing or newly placed order
  let targetOrderId;
  if (orders.length > 0) {
    targetOrderId = orders[0].id;
  } else {
    // Create an order first
    const createRes = await fetch('http://127.0.0.1:4000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: 'Admin Test Order', email: 'adm@test.com', phone: '123', address: 'Test' },
        items: [{ productId: 'prod_1', quantity: 1, size: 'M', color: 'White' }]
      })
    });
    const created = await createRes.json();
    targetOrderId = created.orderId;
  }

  const newStatus = 'shipped';
  const patchRes = await fetch(`http://127.0.0.1:4000/api/admin/orders/${targetOrderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });

  if (!patchRes.ok) throw new Error('PATCH status failed: ' + patchRes.status);
  const patchData = await patchRes.json();
  if (!patchData.success || patchData.status !== newStatus) {
    throw new Error('PATCH response did not confirm updated status');
  }

  // Verify through single order endpoint
  const checkRes = await fetch(`http://127.0.0.1:4000/api/orders/${targetOrderId}`);
  const orderObj = await checkRes.json();
  if (orderObj.status !== newStatus) {
    throw new Error(`Expected status ${newStatus}, got ${orderObj.status}`);
  }

  console.log('admin verification passed');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
