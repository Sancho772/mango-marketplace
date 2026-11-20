async function run() {
  console.log('--- STARTING ECC VERIFICATION SUITE ---');

  // 1. Promo Code Validation Test
  console.log('1. Testing Promo Code Validation...');
  const validPromoRes = await fetch('http://127.0.0.1:4000/api/promocodes/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'VERDANT10' })
  });
  if (!validPromoRes.ok) throw new Error('Valid promo check failed: ' + validPromoRes.status);
  const validPromo = await validPromoRes.json();
  if (!validPromo.valid || validPromo.discountPercent !== 10) {
    throw new Error('Promo VERDANT10 expected 10% discount, got: ' + JSON.stringify(validPromo));
  }

  const invalidPromoRes = await fetch('http://127.0.0.1:4000/api/promocodes/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'BOGUSCODE999' })
  });
  if (invalidPromoRes.ok) throw new Error('Invalid promo code should have returned 400 error');

  // 2. Product Management CRUD (Admin)
  console.log('2. Testing Admin Product CRUD...');
  const newProductPayload = {
    title_ru: 'Эко-плед из органического хлопка',
    title_en: 'Organic Cotton Eco Throw',
    category_id: 'cat_living',
    description_ru: '100% органический хлопок ручного плетения',
    description_en: '100% handwoven organic cotton throw blanket',
    price: 85.00,
    old_price: 110.00,
    brand: 'VERDANT HOME',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    color: 'Шалфей',
    sizes: ['140x200', '180x220'],
    stock: 15,
    is_bestseller: 1,
    discount_percent: 22
  };

  const createProdRes = await fetch('http://127.0.0.1:4000/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProductPayload)
  });
  if (!createProdRes.ok) throw new Error('Create product failed: ' + createProdRes.status);
  const createProdData = await createProdRes.json();
  if (!createProdData.success || !createProdData.product?.id) {
    throw new Error('Product creation response invalid');
  }
  const createdId = createProdData.product.id;
  console.log(`   -> Created product: ${createdId}`);

  // Update product
  const updateProdRes = await fetch(`http://127.0.0.1:4000/api/admin/products/${createdId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price: 79.00,
      stock: 12
    })
  });
  if (!updateProdRes.ok) throw new Error('Update product failed');
  const updateProdData = await updateProdRes.json();
  if (updateProdData.product.price !== 79 || updateProdData.product.stock !== 12) {
    throw new Error('Product update data mismatch');
  }
  console.log('   -> Updated product successfully');

  // 3. Order Placement with Promo Code & Stock Decrement
  console.log('3. Testing Order Placement with Promo Code & Inventory Decrement...');
  const initialStock = updateProdData.product.stock; // 12
  const orderQty = 2;

  const orderRes = await fetch('http://127.0.0.1:4000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        name: 'ECC Tester',
        email: 'ecc-test@verdant.local',
        phone: '+7 900 111-22-33',
        address: 'г. Санкт-Петербург, Невский пр. 1'
      },
      items: [
        { productId: createdId, quantity: orderQty, size: '140x200', color: 'Шалфей' }
      ],
      paymentMethod: 'card',
      promoCode: 'VERDANT10'
    })
  });
  if (!orderRes.ok) throw new Error('Order placement failed: ' + orderRes.status);
  const orderData = await orderRes.json();
  if (!orderData.success || !orderData.orderId) throw new Error('Order creation invalid');

  // Verify discount was applied: 79 * 2 = 158. 10% of 158 is 15.8. Final = 142.2
  const expectedTotal = parseFloat((79 * orderQty * 0.9).toFixed(2));
  if (Math.abs(orderData.totalAmount - expectedTotal) > 0.05) {
    throw new Error(`Discount total mismatch. Expected ${expectedTotal}, got ${orderData.totalAmount}`);
  }
  console.log(`   -> Order placed with 10% promo: ID ${orderData.orderId}, total: $${orderData.totalAmount}`);

  // Verify stock was decremented
  const checkProdRes = await fetch(`http://127.0.0.1:4000/api/products/${createdId}`);
  const refreshedProd = await checkProdRes.json();
  if (refreshedProd.stock !== initialStock - orderQty) {
    throw new Error(`Stock decrement failed. Expected ${initialStock - orderQty}, got ${refreshedProd.stock}`);
  }
  console.log(`   -> Stock successfully decremented from ${initialStock} to ${refreshedProd.stock}`);

  // 4. Delete product
  console.log('4. Testing Product Deletion...');
  const delRes = await fetch(`http://127.0.0.1:4000/api/admin/products/${createdId}`, {
    method: 'DELETE'
  });
  if (!delRes.ok) throw new Error('Delete product failed');
  console.log('   -> Deleted product successfully');

  console.log('--- ALL ECC VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

run().catch(err => {
  console.error('ECC VERIFICATION FAILED:', err);
  process.exit(1);
});
