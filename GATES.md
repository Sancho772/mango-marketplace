# Gates: White-Label E-Commerce Platform End-to-End Integration

OWNS: *.html, server/**, tests/**, PROJECT_CONTEXT.md, README.md

Scope: Complete end-to-end integration of frontend screens with live SQLite REST API, dynamic catalog filtering, persistent cart, real order placement, live admin metrics, and zero mock debt.

- [x] G1: Backend API health and core REST endpoints respond with valid data
  CHECK: node tests/verify-backend.mjs
  EXPECT: backend api checks passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=455293996519b52053dea0ae89bed60ee0d25d539355ef1dca8d4185b0573aed; exit=0; EXPECT=matched; output-sha256=a27391645723084f2a30efddbed8e015a773ab89bfe7a6b0f465fb398d9b3d66; output-bytes=26; shell=C:\Windows\system32\cmd.exe; cwd=C:\Users\Asus\.gemini\antigravity-ide\scratch\ecommerce-platform; path=7f5e66e633cb/23 entries

- [x] G2: Catalog UI dynamically loads products, handles category filtering, price sliders, and cart persistence
  CHECK: node tests/verify-catalog.mjs
  EXPECT: catalog verification passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=f02f3588fe071e22580772199cdba057ee1371aa2e7f0f66e99fc8c43e7dfe8b; exit=0; EXPECT=matched; output-sha256=be813616f63be84ae9dc1918a23cf525c6792e70b0aafbad0308a2bdd1daa724; output-bytes=28; shell=C:\Windows\system32\cmd.exe; cwd=C:\Users\Asus\.gemini\antigravity-ide\scratch\ecommerce-platform; path=7f5e66e633cb/23 entries

- [x] G3: Checkout page loads cart state, validates customer data, posts real orders to /api/orders, and shows order confirmation
  CHECK: node tests/verify-checkout.mjs
  EXPECT: checkout verification passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=14215f4270882215c682e853b4e86e79466a514b252966f9f50526bdabb75a6b; exit=0; EXPECT=matched; output-sha256=98ce3616300804822529c33428734346133614d3888f674392adf581a4ea3c16; output-bytes=29; shell=C:\Windows\system32\cmd.exe; cwd=C:\Users\Asus\.gemini\antigravity-ide\scratch\ecommerce-platform; path=7f5e66e633cb/23 entries

- [x] G4: Admin dashboard displays live metrics from database and supports updating order statuses via PATCH
  CHECK: node tests/verify-admin.mjs
  EXPECT: admin verification passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=55d6cf6f5899d9b7aa9b5fcc94d2579e9da8e854e7144de67f715cadc0210da2; exit=0; EXPECT=matched; output-sha256=a7fa062e10da8e681f93a079296b659e384d665cf961a7b329a42e2a7c47f2f0; output-bytes=26; shell=C:\Windows\system32\cmd.exe; cwd=C:\Users\Asus\.gemini\antigravity-ide\scratch\ecommerce-platform; path=7f5e66e633cb/23 entries

- [x] G5: End-to-end customer journey executes cleanly: browse -> add to cart -> checkout order -> admin reflects revenue
  CHECK: node tests/verify-e2e.mjs
  EXPECT: e2e flow passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=ad4e1b41e10ed0a864c1d515435d5323cf306ab323b66dc0d82511f5c22f8c74; exit=0; EXPECT=matched; output-sha256=13e12298b57b72c224a38fb25053731a26371a231e8a47a6e1a42860adc0a43b; output-bytes=16; shell=C:\Windows\system32\cmd.exe; cwd=C:\Users\Asus\.gemini\antigravity-ide\scratch\ecommerce-platform; path=7f5e66e633cb/23 entries

- [x] G6: All code committed and pushed to remote GitHub repository without uncommitted drift
  CHECK: node tests/verify-git-sync.mjs
  EXPECT: git synchronization verified
  EVIDENCE: automatic-evidence=v1; definition-sha256=b734588da7cdab68063d3f321f255904495acf34379e98c44b6a49e1e9089ce8; exit=0; EXPECT=matched; output-sha256=5ce7a8f5ca615d3f1eac9ccedc7b3d10513933c329c76325016b2deefcebf2fd; output-bytes=29; shell=C:\Windows\system32\cmd.exe; cwd=C:\Users\Asus\.gemini\antigravity-ide\scratch\ecommerce-platform; path=7f5e66e633cb/23 entries
