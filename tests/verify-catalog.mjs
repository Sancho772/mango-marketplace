import fs from 'node:fs';

async function run() {
  if (!fs.existsSync('ecommerce.js')) throw new Error('ecommerce.js missing');
  if (!fs.existsSync('catalog.js')) throw new Error('catalog.js missing');

  const catalogHtml = fs.readFileSync('catalog_ru.html', 'utf8');
  if (!catalogHtml.includes('id="productsGrid"')) {
    throw new Error('catalog_ru.html missing #productsGrid mount point');
  }
  if (!catalogHtml.includes('src="ecommerce.js"') || !catalogHtml.includes('src="catalog.js"')) {
    throw new Error('catalog_ru.html missing script tags');
  }

  // Validate API connection
  const res = await fetch('http://127.0.0.1:4000/api/products?sort=new');
  if (!res.ok) throw new Error('API fetch failed');
  const data = await res.json();
  if (!data.products || data.products.length < 5) {
    throw new Error('Expected at least 5 products in database');
  }

  console.log('catalog verification passed');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
