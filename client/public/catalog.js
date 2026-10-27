/**
 * Mango Marketplace — Catalog Dynamic Controller
 * Powers catalog_ru.html and catalog_en.html with live REST API data
 */

document.addEventListener('DOMContentLoaded', () => {
  const isEn = window.location.pathname.includes('_en');
  const grid = document.getElementById('productsGrid');
  const searchInput = document.querySelector('input[type="search"]');
  const priceSlider = document.getElementById('priceSlider');
  const maxPriceInput = document.getElementById('maxPriceInput');
  const priceDisplay = document.getElementById('priceDisplay');
  const sortSelect = document.querySelector('select');
  const categoryButtons = document.querySelectorAll('aside button');
  const totalCounter = document.querySelector('span.font-semibold.text-on-surface');
  const headerCounter = document.querySelector('section div.space-y-space-xs span.font-label-md');

  let currentCategory = 'all';
  let currentSort = 'new';
  let currentMaxPrice = 500;
  let currentSearch = '';

  async function loadProducts() {
    if (!grid) return;

    try {
      grid.style.opacity = '0.5';
      const params = {};
      if (currentCategory && currentCategory !== 'all') params.category = currentCategory;
      if (currentSearch) params.search = currentSearch;
      if (currentMaxPrice) params.maxPrice = currentMaxPrice;
      if (currentSort) params.sort = currentSort;

      const data = await MangoStore.fetchProducts(params);
      grid.style.opacity = '1';

      if (!data || !data.products || data.products.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full py-16 text-center text-on-surface-variant space-y-2">
            <span class="material-symbols-outlined text-4xl text-primary">search_off</span>
            <p class="font-headline-sm text-on-surface">${isEn ? 'No products found' : 'Товары не найдены'}</p>
            <p class="text-xs">${isEn ? 'Try adjusting your filters or search keywords.' : 'Попробуйте изменить параметры поиска или сбросить фильтры.'}</p>
          </div>
        `;
        return;
      }

      if (totalCounter) {
        totalCounter.textContent = `1 – ${data.products.length}`;
      }

      grid.innerHTML = data.products.map(p => {
        const title = isEn ? (p.title_en || p.title_ru) : (p.title_ru || p.title_en);
        const desc = isEn ? (p.description_en || p.description_ru) : (p.description_ru || p.description_en);
        const oldPriceHtml = p.old_price 
          ? `<span class="font-body-md text-body-md text-outline line-through">$${Number(p.old_price).toFixed(2)}</span>` 
          : '';
        
        let badgeHtml = '';
        if (p.discount_percent > 0) {
          badgeHtml = `<span class="absolute top-3 left-3 px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container font-badge-xs text-badge-xs font-bold shadow-xs">-${p.discount_percent}% ${isEn ? 'OFF' : 'СКИДКА'}</span>`;
        } else if (p.is_bestseller) {
          badgeHtml = `<span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-badge-xs text-badge-xs font-bold shadow-xs">${isEn ? 'BESTSELLER' : 'ХИТ'}</span>`;
        }

        const prodJson = JSON.stringify({
          id: p.id,
          title: title,
          title_ru: p.title_ru,
          title_en: p.title_en,
          price: p.price,
          brand: p.brand,
          image_url: p.image_url
        }).replace(/"/g, '&quot;');

        return `
          <article class="group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative border border-outline-variant/20">
            <div class="relative w-full aspect-square bg-surface-container overflow-hidden">
              <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                   src="${p.image_url}" 
                   alt="${title}">
              ${badgeHtml}
              <button class="wishlist-btn absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface-variant hover:text-tertiary flex items-center justify-center transition-colors shadow-xs" 
                      title="${isEn ? 'Add to Wishlist' : 'Добавить в избранное'}"
                      onclick="this.classList.toggle('text-rose-500')">
                <span class="material-symbols-outlined text-[18px]">favorite</span>
              </button>
            </div>
            
            <div class="p-space-md flex-1 flex flex-col justify-between space-y-space-sm">
              <div class="space-y-1">
                <div class="flex items-center justify-between text-secondary-container font-label-sm text-label-sm">
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
                    <span class="font-bold text-on-surface">${p.rating_score || 5.0}</span>
                    <span class="text-on-surface-variant">(${p.rating_count || 10})</span>
                  </div>
                  <span class="text-[11px] uppercase tracking-wider font-semibold text-primary truncate max-w-[120px]">${p.brand}</span>
                </div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                  ${title}
                </h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  ${desc}
                </p>
              </div>

              <div class="pt-space-xs space-y-space-sm">
                <div class="flex items-baseline gap-2">
                  <span class="font-headline-md text-headline-md text-on-surface font-semibold">$${Number(p.price).toFixed(2)}</span>
                  ${oldPriceHtml}
                </div>
                <button class="add-cart-btn w-full h-10 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 shadow-xs transition-colors"
                        onclick='handleAddToCart(${prodJson}, this)'>
                  <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
                  <span>${isEn ? 'Add to Bag' : 'В корзину'}</span>
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');

    } catch (err) {
      console.error('Error loading products:', err);
      if (grid) {
        grid.innerHTML = `<div class="col-span-full py-8 text-center text-rose-500 text-sm">Ошибка подключения к серверу API (${err.message})</div>`;
      }
    }
  }

  // Handle Add To Cart with micro-animation
  window.handleAddToCart = (product, btn) => {
    MangoStore.addToCart(product, 1);
    if (btn) {
      const textSpan = btn.querySelector('span:last-child');
      if (textSpan) {
        const orig = textSpan.textContent;
        textSpan.textContent = isEn ? 'Added!' : 'Добавлено!';
        btn.classList.add('bg-emerald-800');
        setTimeout(() => {
          textSpan.textContent = orig;
          btn.classList.remove('bg-emerald-800');
        }, 1200);
      }
    }
  };

  // Wire search input with debounce
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        currentSearch = e.target.value.trim();
        loadProducts();
      }, 300);
    });
  }

  // Wire price slider
  if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
      currentMaxPrice = Number(e.target.value);
      if (maxPriceInput) maxPriceInput.value = currentMaxPrice;
      if (priceDisplay) priceDisplay.textContent = `$20 – $${currentMaxPrice}`;
      loadProducts();
    });
  }

  // Wire sorting dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val.includes('дешевле') || val.includes('Low')) currentSort = 'price_asc';
      else if (val.includes('дороже') || val.includes('High')) currentSort = 'price_desc';
      else if (val.includes('рейтинг') || val.includes('Rating')) currentSort = 'rating';
      else currentSort = 'new';
      loadProducts();
    });
  }

  // Wire categories sidebar
  document.querySelectorAll('aside .space-y-1 button, nav a[data-path]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.textContent.toLowerCase();
      if (text.includes('одежда') || text.includes('apparel')) currentCategory = 'apparel';
      else if (text.includes('посуда') || text.includes('living') || text.includes('дом')) currentCategory = 'living';
      else if (text.includes('кожи') || text.includes('accessories')) currentCategory = 'accessories';
      else if (text.includes('аромат') || text.includes('fragrance')) currentCategory = 'fragrance';
      else currentCategory = 'all';

      // Update button highlights
      document.querySelectorAll('aside .space-y-1 button').forEach(b => {
        b.className = 'w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md text-left transition-all';
      });
      btn.className = 'w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-md text-label-md text-left transition-all font-semibold';

      loadProducts();
    });
  });

  // Initial load
  loadProducts();
});
