import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔄 Bundling storefront assets from root directory...');

const catalogHtml = fs.readFileSync(path.join(rootDir, 'catalog_ru.html'), 'utf-8');
const checkoutHtml = fs.readFileSync(path.join(rootDir, 'checkout_ru.html'), 'utf-8');
const adminHtml = fs.readFileSync(path.join(rootDir, 'admin_ru.html'), 'utf-8');
const hubHtml = fs.readFileSync(path.join(rootDir, 'hub.html'), 'utf-8');
const ecommerceJs = fs.readFileSync(path.join(rootDir, 'ecommerce.js'), 'utf-8');
const catalogJs = fs.readFileSync(path.join(rootDir, 'catalog.js'), 'utf-8');
const checkoutJs = fs.readFileSync(path.join(rootDir, 'checkout.js'), 'utf-8');
const adminJs = fs.readFileSync(path.join(rootDir, 'admin.js'), 'utf-8');

const bundle = {
  catalogHtml,
  checkoutHtml,
  adminHtml,
  hubHtml,
  ecommerceJs,
  catalogJs,
  checkoutJs,
  adminJs,
};

const fileContent = `// Auto-generated self-contained storefront assets for Vercel Serverless
module.exports = ${JSON.stringify(bundle, null, 2)};
`;

const serverStorefrontPath = path.join(rootDir, 'server', 'src', 'storefront.js');
const apiStorefrontPath = path.join(rootDir, 'api', 'storefront.js');

fs.writeFileSync(serverStorefrontPath, fileContent, 'utf-8');
console.log(`✅ Written ${serverStorefrontPath} (${fileContent.length} bytes)`);

fs.writeFileSync(apiStorefrontPath, fileContent, 'utf-8');
console.log(`✅ Written ${apiStorefrontPath} (${fileContent.length} bytes)`);

console.log('🎉 Storefront assets bundled successfully!');
