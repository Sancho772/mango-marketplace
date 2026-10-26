import fs from 'node:fs';

async function run() {
  if (!fs.existsSync('checkout.js')) throw new Error('checkout.js missing');
  
  const checkoutHtml = fs.readFileSync('checkout_ru.html', 'utf8');
  if (!checkoutHtml.includes('src="ecommerce.js"') || !checkoutHtml.includes('src="checkout.js"')) {
    throw new Error('checkout_ru.html missing script tags');
  }

  // Test real order creation
  const orderRes = await fetch('http://127.0.0.1:4000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        name: 'Gate Verification Customer',
        email: 'verify@example.com',
        phone: '+7 999 555-44-33',
        address: 'г. Москва, ул. Тверская 1'
      },
      items: [
        { productId: 'prod_2', quantity: 1, size: 'One Size', color: 'Слоновая кость' }
      ],
      paymentMethod: 'card'
    })
  });

  if (!orderRes.ok) throw new Error('Order creation failed with status: ' + orderRes.status);
  const order = await orderRes.json();
  if (!order.success || !order.orderId) throw new Error('Order response invalid');

  // Verify fetching order
  const fetchRes = await fetch(`http://127.0.0.1:4000/api/orders/${order.orderId}`);
  if (!fetchRes.ok) throw new Error('Order fetch failed');
  const fetched = await fetchRes.json();
  if (fetched.id !== order.orderId || !fetched.items || fetched.items.length === 0) {
    throw new Error('Fetched order items missing');
  }

  console.log('checkout verification passed');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
