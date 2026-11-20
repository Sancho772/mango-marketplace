/**
 * VERDANT Commerce — Catalog Interactive Controller
 * Powers catalog_ru.html & catalog_en.html with complete interactive filtration,
 * quick view modal, wishlist drawer, real-time pagination, and API sync.
 */

document.addEventListener('DOMContentLoaded', () => {
  const isEn = window.location.pathname.includes('_en');
  const grid = document.getElementById('productsGrid');
  const searchInput = document.querySelector('input[type="search"]');
  const priceSlider = document.getElementById('priceSlider');
  const maxPriceInput = document.getElementById('maxPriceInput');
  const priceDisplay = document.getElementById('priceDisplay');
  const sortSelect = document.querySelector('select');
  const resetBtn = document.getElementById('resetFiltersBtn');
  const applyBtn = document.querySelector('aside button.h-11');
  const totalCounter = document.querySelector('span.font-semibold.text-on-surface');

  // Filter state
  let currentCategory = 'all';
  let currentSort = 'new';
  let currentMaxPrice = 500;
  let currentMinPrice = 20;
  let currentSearch = '';
  let selectedSize = null;
  let selectedColor = null;
  let selectedBrands = [];
  let minRating = 0;
  let currentPage = 1;
  const ITEMS_PER_PAGE = 6;

  let allProducts = [];

  // --- Wishlist Management ---
  function getWishlist() {
    try {
      const data = localStorage.getItem('verdant_wishlist_items_v1');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveWishlist(list) {
    try {
      localStorage.setItem('verdant_wishlist_items_v1', JSON.stringify(list));
      updateWishlistBadge();
    } catch (e) {
      console.error(e);
    }
  }

  function updateWishlistBadge() {
    const list = getWishlist();
    const count = list.length;
    document.querySelectorAll('[data-path="wishlist"]').forEach(btn => {
      let badge = btn.querySelector('.wishlist-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'wishlist-badge absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center';
        btn.appendChild(badge);
      }
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  window.toggleWishlistProduct = (product, btn) => {
    let list = getWishlist();
    const idx = list.findIndex(p => p.id === product.id);
    if (idx > -1) {
      list.splice(idx, 1);
      if (btn) btn.classList.remove('text-rose-500');
      VerdantStore.showToast(`«${(product.title_ru || product.title_en || product.title).slice(0, 24)}...» удален из избранного`);
    } else {
      list.push(product);
      if (btn) btn.classList.add('text-rose-500');
      VerdantStore.showToast(`«${(product.title_ru || product.title_en || product.title).slice(0, 24)}...» добавлен в избранное`);
    }
    saveWishlist(list);
  };

  // --- Load Products from API ---
  async function fetchProductsFromApi() {
    if (!grid) return;
    try {
      grid.style.opacity = '0.5';
      const params = {};
      if (currentCategory && currentCategory !== 'all') params.category = currentCategory;
      if (currentSearch) params.search = currentSearch;
      if (currentSort) params.sort = currentSort;

      const data = await VerdantStore.fetchProducts(params);
      grid.style.opacity = '1';
      allProducts = data.products || [];
      renderFilteredProducts();
    } catch (err) {
      console.error('Error fetching products:', err);
      if (grid) {
        grid.innerHTML = `<div class="col-span-full py-8 text-center text-rose-500 text-xs">Ошибка загрузки каталога товаров (${err.message})</div>`;
      }
    }
  }

  // --- Render Products with Client Filters & Pagination ---
  function renderFilteredProducts() {
    if (!grid) return;

    const wishlist = getWishlist();

    // Client multi-filter
    const filtered = allProducts.filter(p => {
      if (p.price > currentMaxPrice) return false;
      if (p.price < currentMinPrice) return false;
      if (minRating > 0 && (p.rating_score || 5) < minRating) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (selectedColor && p.color !== selectedColor) return false;
      if (selectedSize) {
        const sizesArr = Array.isArray(p.sizes)
          ? p.sizes
          : (typeof p.sizes === 'string' && p.sizes.startsWith('[')
              ? JSON.parse(p.sizes)
              : [p.sizes]);
        if (!sizesArr.some(s => s.toLowerCase().includes(selectedSize.toLowerCase()))) {
          return false;
        }
      }
      return true;
    });

    if (totalCounter) {
      totalCounter.textContent = `${filtered.length} уникальных товаров`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-on-surface-variant space-y-3 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30">
          <span class="material-symbols-outlined text-4xl text-primary">search_off</span>
          <p class="font-headline-sm text-on-surface">${isEn ? 'No products found' : 'Товары не найдены'}</p>
          <p class="text-xs text-on-surface-variant">${isEn ? 'Try adjusting filters or keywords.' : 'Попробуйте изменить параметры фильтрации или сбросить фильтры.'}</p>
          <button id="emptyResetBtn" class="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover">
            ${isEn ? 'Reset all filters' : 'Сбросить фильтры'}
          </button>
        </div>
      `;
      const emptyBtn = document.getElementById('emptyResetBtn');
      if (emptyBtn) emptyBtn.addEventListener('click', resetAllFilters);
      renderPagination(0);
      return;
    }

    // Pagination slice
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = 1;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

    grid.innerHTML = paginated.map(p => {
      const title = isEn ? (p.title_en || p.title_ru) : (p.title_ru || p.title_en);
      const desc = isEn ? (p.description_en || p.description_ru) : (p.description_ru || p.description_en);
      const isFav = wishlist.some(item => item.id === p.id);

      const oldPriceHtml = p.old_price 
        ? `<span class="font-body-md text-body-md text-outline line-through">$${Number(p.old_price).toFixed(2)}</span>` 
        : '';

      let badgeHtml = '';
      if (p.discount_percent > 0) {
        badgeHtml = `<span class="absolute top-3 left-3 px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container font-badge-xs text-badge-xs font-bold shadow-xs">-${p.discount_percent}% ${isEn ? 'OFF' : 'СКИДКА'}</span>`;
      } else if (p.is_bestseller) {
        badgeHtml = `<span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-badge-xs text-badge-xs font-bold shadow-xs">${isEn ? 'BESTSELLER' : 'ХИТ'}</span>`;
      }

      const prodJson = JSON.stringify(p).replace(/"/g, '&quot;');

      return `
        <article class="group bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden relative border border-outline-variant/30">
          <div class="relative w-full aspect-square bg-surface-container overflow-hidden cursor-pointer" onclick='openQuickView(${prodJson})'>
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                 src="${p.image_url}" 
                 alt="${title}"
                 loading="lazy">
            ${badgeHtml}

            <!-- Quick View Overlay Pill -->
            <div class="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
              <span class="px-3 py-1.5 rounded-full bg-white/95 text-xs font-semibold text-on-surface shadow-md flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">visibility</span>
                ${isEn ? 'Quick view' : 'Быстрый просмотр'}
              </span>
            </div>

            <button class="wishlist-btn absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface-variant hover:text-rose-500 flex items-center justify-center transition-colors shadow-xs ${isFav ? 'text-rose-500' : ''}" 
                    title="${isEn ? 'Wishlist' : 'В избранное'}"
                    onclick="event.stopPropagation(); toggleWishlistProduct(${prodJson}, this)">
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
              <h3 class="font-headline-sm text-headline-sm text-on-surface tracking-tight group-hover:text-primary transition-colors line-clamp-1 cursor-pointer" onclick='openQuickView(${prodJson})'>
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
              <button class="add-cart-btn w-full h-10 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      onclick='handleAddToCart(${prodJson}, this)'>
                <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
                <span>${isEn ? 'Add to Bag' : 'В корзину'}</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    renderPagination(totalPages);
  }

  // --- Pagination Controls ---
  function renderPagination(totalPages) {
    let container = document.getElementById('catalogPagination');
    if (!container) {
      const parent = grid?.parentElement;
      if (!parent) return;
      container = document.createElement('div');
      container.id = 'catalogPagination';
      parent.appendChild(container);
    }

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let buttonsHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      const active = i === currentPage;
      buttonsHtml += `
        <button onclick="goToPage(${i})" class="w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          active ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
        }">
          ${i}
        </button>
      `;
    }

    container.innerHTML = `
      <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <p class="font-body-sm text-body-sm text-on-surface-variant">
          ${isEn ? 'Page' : 'Стр.'} <span class="font-bold text-on-surface">${currentPage}</span> ${isEn ? 'of' : 'из'} <span class="font-bold text-on-surface">${totalPages}</span>
        </p>
        <div class="flex items-center gap-1.5">
          <button onclick="goToPage(${Math.max(1, currentPage - 1)})" ${currentPage === 1 ? 'disabled' : ''} class="w-9 h-9 rounded-xl border border-outline-variant/30 text-on-surface flex items-center justify-center disabled:opacity-40 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          ${buttonsHtml}
          <button onclick="goToPage(${Math.min(totalPages, currentPage + 1)})" ${currentPage === totalPages ? 'disabled' : ''} class="w-9 h-9 rounded-xl border border-outline-variant/30 text-on-surface flex items-center justify-center disabled:opacity-40 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    `;
  }

  window.goToPage = (page) => {
    currentPage = page;
    renderFilteredProducts();
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // --- Quick View Modal ---
  window.openQuickView = (product) => {
    let modal = document.getElementById('quickViewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'quickViewModal';
      document.body.appendChild(modal);
    }

    const title = isEn ? (product.title_en || product.title_ru) : (product.title_ru || product.title_en);
    const desc = isEn ? (product.description_en || product.description_ru) : (product.description_ru || product.description_en);
    const sizes = Array.isArray(product.sizes)
      ? product.sizes
      : (typeof product.sizes === 'string' && product.sizes.startsWith('[')
          ? JSON.parse(product.sizes)
          : [product.sizes || 'One Size']);

    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs';
    modal.innerHTML = `
      <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        <button onclick="closeQuickView()" class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-surface-container flex items-center justify-center text-on-surface cursor-pointer">
          ✕
        </button>
        <div class="w-full md:w-1/2 bg-surface-container-low p-6 flex items-center justify-center">
          <img src="${product.image_url}" alt="${title}" class="w-full max-h-[300px] object-contain rounded-xl">
        </div>
        <div class="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div class="space-y-2">
            <span class="text-xs font-semibold text-primary uppercase">${product.brand}</span>
            <h2 class="font-headline-sm font-bold text-on-surface">${title}</h2>
            <div class="flex items-baseline gap-2">
              <span class="font-headline-md font-bold text-primary">$${Number(product.price).toFixed(2)}</span>
              ${product.old_price ? `<span class="text-sm text-outline line-through">$${Number(product.old_price).toFixed(2)}</span>` : ''}
            </div>
            <p class="text-xs text-on-surface-variant leading-relaxed">${desc}</p>
            <div class="pt-2">
              <label class="text-xs font-bold text-on-surface block mb-1">Размер:</label>
              <div class="flex flex-wrap gap-1.5" id="modalSizeGroup">
                ${sizes.map((s, idx) => `
                  <button onclick="selectModalSize(this, '${s}')" class="px-2.5 py-1 rounded-lg text-xs font-medium border ${idx === 0 ? 'bg-primary text-white border-primary' : 'bg-surface-low border-outline-variant/30'}">
                    ${s}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
          <button onclick="addModalProductToCart('${product.id}')" class="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>${isEn ? 'Add to Cart' : 'В корзину'}</span>
          </button>
        </div>
      </div>
    `;

    window.selectedModalSize = sizes[0] || 'Standard';
  };

  window.selectModalSize = (btn, size) => {
    window.selectedModalSize = size;
    document.querySelectorAll('#modalSizeGroup button').forEach(b => {
      b.className = 'px-2.5 py-1 rounded-lg text-xs font-medium border bg-surface-low border-outline-variant/30';
    });
    btn.className = 'px-2.5 py-1 rounded-lg text-xs font-medium border bg-primary text-white border-primary';
  };

  window.addModalProductToCart = (productId) => {
    const prod = allProducts.find(p => p.id === productId);
    if (prod) {
      VerdantStore.addToCart(prod, 1, window.selectedModalSize || 'Standard', prod.color || 'Standard');
      closeQuickView();
    }
  };

  window.closeQuickView = () => {
    const modal = document.getElementById('quickViewModal');
    if (modal) modal.remove();
  };

  // --- Add To Cart Handler ---
  window.handleAddToCart = (product, btn) => {
    VerdantStore.addToCart(product, 1);
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">check</span><span>${isEn ? 'Added!' : 'Добавлено!'}</span>`;
      btn.classList.add('bg-emerald-800');
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.classList.remove('bg-emerald-800');
      }, 1200);
    }
  };

  // --- Reset Filters ---
  function resetAllFilters() {
    currentCategory = 'all';
    currentMaxPrice = 500;
    currentMinPrice = 20;
    currentSearch = '';
    selectedSize = null;
    selectedColor = null;
    selectedBrands = [];
    minRating = 0;
    currentPage = 1;

    if (priceSlider) priceSlider.value = 500;
    if (maxPriceInput) maxPriceInput.value = 500;
    if (priceDisplay) priceDisplay.textContent = '$20 – $500';
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.size-chip').forEach(b => {
      b.className = 'size-chip px-3.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-all cursor-pointer';
    });

    document.querySelectorAll('aside .grid button').forEach(b => {
      b.classList.remove('ring-2', 'ring-primary');
    });

    document.querySelectorAll('aside input[type="checkbox"]').forEach(c => {
      c.checked = false;
    });

    fetchProductsFromApi();
  }

  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
  if (applyBtn) applyBtn.addEventListener('click', () => { renderFilteredProducts(); });

  // --- Wire Search ---
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        currentSearch = e.target.value.trim();
        currentPage = 1;
        fetchProductsFromApi();
      }, 300);
    });
  }

  // --- Wire Price Slider ---
  if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
      currentMaxPrice = Number(e.target.value);
      if (maxPriceInput) maxPriceInput.value = currentMaxPrice;
      if (priceDisplay) priceDisplay.textContent = `$20 – $${currentMaxPrice}`;
      currentPage = 1;
      renderFilteredProducts();
    });
  }

  if (maxPriceInput) {
    maxPriceInput.addEventListener('change', (e) => {
      currentMaxPrice = Number(e.target.value) || 500;
      if (priceSlider) priceSlider.value = currentMaxPrice;
      renderFilteredProducts();
    });
  }

  // --- Wire Size Chips ---
  document.querySelectorAll('.size-chip').forEach(btn => {
    btn.classList.add('cursor-pointer');
    btn.addEventListener('click', () => {
      const size = btn.textContent.trim();
      if (selectedSize === size) {
        selectedSize = null;
        btn.className = 'size-chip px-3.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-all cursor-pointer';
      } else {
        document.querySelectorAll('.size-chip').forEach(b => {
          b.className = 'size-chip px-3.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-all cursor-pointer';
        });
        selectedSize = size;
        btn.className = 'size-chip px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm cursor-pointer';
      }
      currentPage = 1;
      renderFilteredProducts();
    });
  });

  // --- Wire Color Swatches ---
  document.querySelectorAll('aside .grid-cols-3 button, aside .grid button').forEach(btn => {
    btn.classList.add('cursor-pointer');
    btn.addEventListener('click', () => {
      const colorText = btn.querySelector('span:last-child')?.textContent?.trim() || '';
      if (selectedColor === colorText) {
        selectedColor = null;
        btn.classList.remove('ring-2', 'ring-primary', 'bg-emerald-50');
      } else {
        document.querySelectorAll('aside .grid-cols-3 button, aside .grid button').forEach(b => {
          b.classList.remove('ring-2', 'ring-primary', 'bg-emerald-50');
        });
        selectedColor = colorText;
        btn.classList.add('ring-2', 'ring-primary', 'bg-emerald-50');
      }
      currentPage = 1;
      renderFilteredProducts();
    });
  });

  // --- Wire Brand Checkboxes ---
  document.querySelectorAll('aside input[type="checkbox"]').forEach(chk => {
    chk.addEventListener('change', () => {
      const brandName = chk.parentElement?.querySelector('span')?.textContent?.trim();
      if (!brandName) return;
      if (chk.checked) {
        if (!selectedBrands.includes(brandName)) selectedBrands.push(brandName);
      } else {
        selectedBrands = selectedBrands.filter(b => b !== brandName);
      }
      currentPage = 1;
      renderFilteredProducts();
    });
  });

  // --- Wire Rating Radio ---
  document.querySelectorAll('aside input[name="rating-filter"]').forEach(r => {
    r.addEventListener('change', () => {
      minRating = 4.0;
      renderFilteredProducts();
    });
  });

  // --- Wire Sorting Selector ---
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val.includes('дешевле') || val.includes('Low')) currentSort = 'price_asc';
      else if (val.includes('дороже') || val.includes('High')) currentSort = 'price_desc';
      else if (val.includes('рейтинг') || val.includes('Rating')) currentSort = 'rating';
      else currentSort = 'new';
      fetchProductsFromApi();
    });
  }

  // --- Wire Categories Sidebar & Header Nav ---
  document.querySelectorAll('aside .space-y-1 button, nav a[data-path]').forEach(btn => {
    const path = btn.getAttribute('data-path');
    if (path === 'cart' || path === 'wishlist' || path === 'storefront-home' || path === 'admin') {
      return; // DO NOT prevent navigation for cart, admin, home!
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.textContent.toLowerCase();
      if (text.includes('одежда') || text.includes('apparel')) currentCategory = 'cat_apparel';
      else if (text.includes('посуда') || text.includes('living') || text.includes('дом')) currentCategory = 'cat_living';
      else if (text.includes('кожи') || text.includes('accessories') || text.includes('аксессуар') || text.includes('обувь')) currentCategory = 'cat_accessories';
      else if (text.includes('аромат') || text.includes('fragrance')) currentCategory = 'cat_fragrance';
      else currentCategory = 'all';

      // Update active highlight
      document.querySelectorAll('aside .space-y-1 button').forEach(b => {
        b.className = 'w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md text-left transition-all cursor-pointer';
      });
      btn.className = 'w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-md text-label-md text-left transition-all font-semibold cursor-pointer';

      currentPage = 1;
      fetchProductsFromApi();
    });
  });

  // --- Wire Wishlist Drawer Button in Header ---
  document.querySelectorAll('a[data-path="wishlist"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openWishlistDrawer();
    });
  });

  function openWishlistDrawer() {
    let drawer = document.getElementById('wishlistDrawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'wishlistDrawer';
      document.body.appendChild(drawer);
    }

    const list = getWishlist();
    drawer.className = 'fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs';
    drawer.innerHTML = `
      <div class="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        <div class="p-6 border-b border-surface-container flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-rose-500">favorite</span>
            <h3 class="font-headline-sm font-bold text-on-surface">${isEn ? 'Wishlist' : 'Избранное'} (${list.length})</h3>
          </div>
          <button onclick="document.getElementById('wishlistDrawer').remove()" class="w-8 h-8 rounded-full bg-surface-low hover:bg-surface-container flex items-center justify-center cursor-pointer">✕</button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 divide-y divide-surface-container space-y-3">
          ${list.length === 0 ? `
            <div class="py-16 text-center text-on-surface-variant space-y-2">
              <span class="material-symbols-outlined text-4xl text-rose-300">favorite_border</span>
              <p class="font-bold text-sm text-on-surface">${isEn ? 'Wishlist is empty' : 'В избранном пока пусто'}</p>
            </div>
          ` : list.map(item => `
            <div class="pt-3 first:pt-0 flex items-center gap-3">
              <img src="${item.image_url}" class="w-14 h-14 rounded-lg object-cover">
              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-bold text-on-surface truncate">${item.title_ru || item.title_en || item.title}</h4>
                <p class="text-xs font-bold text-primary mt-0.5">$${Number(item.price).toFixed(2)}</p>
              </div>
              <button onclick='handleAddToCart(${JSON.stringify(item).replace(/"/g, '&quot;')}, this)' class="p-2 rounded-lg bg-primary-fixed text-emerald-950 hover:bg-primary hover:text-white cursor-pointer" title="В корзину">
                <span class="material-symbols-outlined text-[16px]">shopping_bag</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Initial load
  updateWishlistBadge();
  fetchProductsFromApi();
});
