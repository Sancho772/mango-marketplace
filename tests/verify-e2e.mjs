async function run() {
  // Step 1: Browse catalog
  const productsRes = await fetch('http://127.0.0.1:4000/api/products');
  if (!productsRes.ok) throw new Error('Browse failed');
  const data = await productsRes.json();
  const products = Array.isArray(data) ? data : data.products;
  if (!Array.isArray(products) || products.length === 0) throw new Error('No products in catalog');
  
  const chosenProduct = products[0];
  const itemQty = 2;
  const expectedItemTotal = chosenProduct.price * itemQty;

  // Step 2: Snapshot admin metrics before order
  const preMetricsRes = await fetch('http://127.0.0.1:4000/api/admin/metrics');
  const preMetrics = await preMetricsRes.json();

  // Step 3: Checkout order (simulate customer submitting bag)
  const orderPayload = {
    customer: {
      name: 'E2E Test User',
      email: 'e2e@mango.test',
      phone: '+7 999 777-88-99',
      address: 'Москва, ул. Арбат, д. 15'
    },
    items: [
      {
        productId: chosenProduct.id,
        quantity: itemQty,
        size: chosenProduct.sizes ? chosenProduct.sizes[0] : 'Standard',
        color: chosenProduct.colors ? chosenProduct.colors[0] : 'Natural'
      }
    ],
    paymentMethod: 'card'
  };

  const orderRes = await fetch('http://127.0.0.1:4000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  if (!orderRes.ok) throw new Error('E2E Checkout failed: ' + orderRes.status);
  const orderData = await orderRes.json();
  if (!orderData.success || !orderData.orderId) throw new Error('Invalid order response');

  // Step 4: Verify order persistence & item integrity
  const getOrderRes = await fetch(`http://127.0.0.1:4000/api/orders/${orderData.orderId}`);
  const orderDetails = await getOrderRes.json();
  if (Math.abs(orderDetails.total_amount - expectedItemTotal) > 0.01) {
    throw new Error(`Order total mismatch. Expected ${expectedItemTotal}, got ${orderDetails.total_amount}`);
  }

  // Step 5: Verify admin metrics updated
  const postMetricsRes = await fetch('http://127.0.0.1:4000/api/admin/metrics');
  const postMetrics = await postMetricsRes.json();

  if (postMetrics.ordersCount !== preMetrics.ordersCount + 1) {
    throw new Error('Admin ordersCount was not incremented');
  }

  const revenueDelta = postMetrics.revenue - preMetrics.revenue;
  if (Math.abs(revenueDelta - expectedItemTotal) > 0.01) {
    throw new Error(`Admin revenue delta mismatch. Expected ${expectedItemTotal}, got ${revenueDelta}`);
  }

  // Step 6: Admin updates status to delivered
  const patchRes = await fetch(`http://127.0.0.1:4000/api/admin/orders/${orderData.orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'delivered' })
  });
  if (!patchRes.ok) throw new Error('Status update failed');

  console.log('e2e flow passed');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
