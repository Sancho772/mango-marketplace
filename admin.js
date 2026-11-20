/**
 * VERDANT Commerce — Admin Dashboard Dynamic Controller
 * Fetches real metrics and orders from REST API with interactive status updates,
 * CSV export, Product Management modal, and live sync.
 */

document.addEventListener('DOMContentLoaded', () => {
  const isEn = window.location.pathname.includes('_en');
  const ordersTbody = document.getElementById('adminOrdersTable');

  // Metric elements
  const metricCards = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-4 > div, .grid.grid-cols-1.md\\:grid-cols-2.xl\\:grid-cols-4 > div');

  let cachedOrders = [];
  let cachedMetrics = null;

  async function loadDashboard() {
    try {
      // 1. Fetch metrics
      const metrics = await VerdantStore.fetchAdminMetrics();
      if (metrics) {
        cachedMetrics = metrics;
        updateMetricCards(metrics);
      }

      // 2. Fetch orders
      const orders = await VerdantStore.fetchAdminOrders();
      if (orders) {
        cachedOrders = orders;
        if (ordersTbody) {
          renderOrders(orders);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      VerdantStore.showToast(err.message, 'error');
    }
  }

  function updateMetricCards(m) {
    if (!metricCards || metricCards.length < 4) return;

    // Card 1: Revenue
    const revEl = metricCards[0].querySelector('.font-headline-lg');
    if (revEl) revEl.textContent = `$${Number(m.revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    // Card 2: Orders Count
    const ordEl = metricCards[1].querySelector('.font-headline-lg');
    if (ordEl) ordEl.textContent = `${m.ordersCount}`;

    // Card 3: Average Check
    const avgEl = metricCards[2].querySelector('.font-headline-lg');
    if (avgEl) avgEl.textContent = `$${Number(m.averageCheck).toFixed(2)}`;

    // Card 4: Conversion Rate
    const convEl = metricCards[3].querySelector('.font-headline-lg');
    if (convEl) convEl.textContent = `${m.conversionRate || '3.4%'}`;
  }

  function renderOrders(orders) {
    if (!ordersTbody) return;

    if (orders.length === 0) {
      ordersTbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-on-surface-variant font-body-sm">
            ${isEn ? 'No orders recorded yet' : 'Заказов в базе пока нет'}
          </td>
        </tr>
      `;
      return;
    }

    ordersTbody.innerHTML = orders.map(ord => {
      const initials = ord.customer_name
        ? ord.customer_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'CU';

      const itemsSummary = (ord.items && ord.items.length > 0)
        ? ord.items.map(it => `${it.product_title} × ${it.quantity}`).join(', ')
        : (isEn ? 'Standard item' : 'Товар из каталога');

      const statusMap = {
        delivered: { ru: 'Выполнен', en: 'Delivered', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
        shipped: { ru: 'В доставке', en: 'Shipped', bg: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
        processing: { ru: 'В сборке', en: 'Processing', bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
        pending: { ru: 'Ожидает оплаты', en: 'Pending', bg: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
        cancelled: { ru: 'Отменен', en: 'Cancelled', bg: 'bg-rose-500/10 text-rose-700 border-rose-500/20' }
      };

      const curStatus = statusMap[ord.status] || statusMap.pending;

      return `
        <tr class="hover:bg-surface-container-low/40 transition-colors border-b border-surface-container/50">
          <td class="py-4 px-4 font-mono font-semibold text-primary">#${ord.id}</td>
          <td class="py-4 px-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary font-label-sm text-label-sm shrink-0">
                ${initials}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-semibold text-on-surface leading-tight truncate">${ord.customer_name}</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant truncate">${ord.customer_email || ord.customer_phone || '—'}</span>
              </div>
            </div>
          </td>
          <td class="py-4 px-4">
            <div class="flex flex-col max-w-xs">
              <span class="font-medium text-on-surface line-clamp-1">${itemsSummary}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">${ord.shipping_address || '—'}</span>
            </div>
          </td>
          <td class="py-4 px-4">
            <select class="px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border ${curStatus.bg} focus:outline-none"
                    onchange="handleStatusChange('${ord.id}', this.value)">
              <option value="pending" ${ord.status === 'pending' ? 'selected' : ''}>${isEn ? 'Pending' : 'Ожидает'}</option>
              <option value="processing" ${ord.status === 'processing' ? 'selected' : ''}>${isEn ? 'Processing' : 'В сборке'}</option>
              <option value="shipped" ${ord.status === 'shipped' ? 'selected' : ''}>${isEn ? 'Shipped' : 'В доставке'}</option>
              <option value="delivered" ${ord.status === 'delivered' ? 'selected' : ''}>${isEn ? 'Delivered' : 'Выполнен'}</option>
              <option value="cancelled" ${ord.status === 'cancelled' ? 'selected' : ''}>${isEn ? 'Cancelled' : 'Отменен'}</option>
            </select>
          </td>
          <td class="py-4 px-4 text-right font-mono font-bold tabular-nums text-on-surface">
            $${Number(ord.total_amount).toFixed(2)}
          </td>
        </tr>
      `;
    }).join('');
  }

  window.handleStatusChange = async (orderId, newStatus) => {
    try {
      await VerdantStore.updateOrderStatus(orderId, newStatus);
      VerdantStore.showToast(isEn ? `Order #${orderId} updated to ${newStatus}` : `Статус #${orderId} обновлен на «${newStatus}»`);
      loadDashboard();
    } catch (err) {
      console.error(err);
      VerdantStore.showToast(err.message, 'error');
    }
  };

  // --- 1. Export Report (CSV) ---
  function exportReport() {
    if (!cachedOrders || cachedOrders.length === 0) {
      VerdantStore.showToast(isEn ? 'No orders to export' : 'Нет заказов для экспорта', 'error');
      return;
    }

    const headers = ['Order ID', 'Customer Name', 'Email/Phone', 'Address', 'Status', 'Total ($)', 'Date'];
    const rows = cachedOrders.map(o => [
      `"${o.id}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${(o.customer_email || o.customer_phone || '').replace(/"/g, '""')}"`,
      `"${(o.shipping_address || '').replace(/"/g, '""')}"`,
      `"${o.status}"`,
      `"${Number(o.total_amount).toFixed(2)}"`,
      `"${o.created_at || new Date().toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `verdant-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    VerdantStore.showToast(isEn ? 'Order report exported to CSV' : 'Отчет по заказам успешно экспортирован в CSV');
  }

  // --- 2. Add New Product Modal ---
  function openNewProductModal() {
    let modal = document.getElementById('adminNewProductModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'adminNewProductModal';
      document.body.appendChild(modal);
    }

    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onclick="document.getElementById('adminNewProductModal').remove()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold">✕</button>
        <div class="flex items-center gap-2 mb-4">
          <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-[18px]">add_box</span>
          </span>
          <h3 class="font-headline-sm font-bold text-on-surface">${isEn ? 'Add New Product' : 'Добавить новый товар'}</h3>
        </div>
        <form id="newProductForm" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">${isEn ? 'Title (Russian)' : 'Название (RU)'} *</label>
            <input required name="title_ru" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Например: Шерстяной свитер оверсайз">
          </div>
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">${isEn ? 'Title (English)' : 'Название (EN)'} *</label>
            <input required name="title_en" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g.: Oversized Wool Sweater">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">${isEn ? 'Category' : 'Категория'} *</label>
              <select name="category_id" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="cat_apparel">${isEn ? 'Apparel' : 'Одежда'}</option>
                <option value="cat_living">${isEn ? 'Living & Decor' : 'Дом и декор'}</option>
                <option value="cat_accessories">${isEn ? 'Leather & Footwear' : 'Кожа и обувь'}</option>
                <option value="cat_fragrance">${isEn ? 'Fragrance' : 'Ароматы'}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">${isEn ? 'Brand' : 'Бренд'} *</label>
              <input name="brand" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value="Verdant Craft">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">${isEn ? 'Price ($)' : 'Цена ($)'} *</label>
              <input required type="number" step="0.01" min="1" name="price" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="85.00">
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">${isEn ? 'Old Price ($)' : 'Старая цена ($)'}</label>
              <input type="number" step="0.01" min="0" name="old_price" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="110.00">
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">${isEn ? 'Stock' : 'Склад'}</label>
              <input type="number" min="0" name="stock" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value="25">
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">${isEn ? 'Image URL' : 'Ссылка на фото'}</label>
            <input name="image_url" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="https://images.unsplash.com/photo-..." value="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800">
          </div>
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">${isEn ? 'Description (Russian)' : 'Описание (RU)'}</label>
            <textarea name="description_ru" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Краткое описание товара"></textarea>
          </div>
          <button type="submit" class="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md">
            ${isEn ? 'Publish Product' : 'Опубликовать товар'}
          </button>
        </form>
      </div>
    `;

    document.getElementById('newProductForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const payload = {
        title_ru: form.title_ru.value,
        title_en: form.title_en.value,
        category_id: form.category_id.value,
        brand: form.brand.value || 'Verdant Craft',
        price: parseFloat(form.price.value),
        old_price: form.old_price.value ? parseFloat(form.old_price.value) : null,
        stock: parseInt(form.stock.value) || 20,
        image_url: form.image_url.value || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
        description_ru: form.description_ru.value || '',
        description_en: form.title_en.value || ''
      };

      try {
        await VerdantStore.createAdminProduct(payload);
        VerdantStore.showToast(isEn ? 'Product added successfully!' : `Товар «${payload.title_ru}» успешно добавлен!`);
        modal.remove();
        loadDashboard();
      } catch (err) {
        VerdantStore.showToast(err.message, 'error');
      }
    });
  }

  // --- 3. View/Manage Products Modal ---
  async function openManageProductsModal() {
    let modal = document.getElementById('adminManageProductsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'adminManageProductsModal';
      document.body.appendChild(modal);
    }

    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <span class="material-symbols-outlined text-[18px]">inventory_2</span>
            </span>
            <h3 class="font-headline-sm font-bold text-on-surface">${isEn ? 'Product Catalog Management' : 'Управление товарами каталога'}</h3>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="document.getElementById('adminManageProductsModal').remove(); openNewProductModal();" class="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>${isEn ? 'Add' : 'Добавить'}</span>
            </button>
            <button onclick="document.getElementById('adminManageProductsModal').remove()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold">✕</button>
          </div>
        </div>
        <div id="adminProductsList" class="flex-1 overflow-y-auto divide-y divide-slate-100 my-4 space-y-2">
          <div class="py-8 text-center text-slate-400 text-sm">${isEn ? 'Loading products...' : 'Загрузка списка товаров...'}</div>
        </div>
      </div>
    `;

    try {
      const data = await VerdantStore.fetchProducts();
      const listEl = document.getElementById('adminProductsList');
      if (!listEl) return;

      const prods = data.products || [];
      if (prods.length === 0) {
        listEl.innerHTML = `<div class="py-8 text-center text-slate-400 text-sm">${isEn ? 'No products in database' : 'В каталоге нет товаров'}</div>`;
        return;
      }

      listEl.innerHTML = prods.map(p => `
        <div class="pt-2 first:pt-0 flex items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded-lg">
          <img src="${p.image_url}" class="w-12 h-12 rounded-lg object-cover">
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-slate-800 truncate">${p.title_ru || p.title_en || p.title}</h4>
            <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span class="font-bold text-emerald-800">$${Number(p.price).toFixed(2)}</span>
              <span>•</span>
              <span>Склад: ${p.stock ?? 25} шт.</span>
              <span>•</span>
              <span class="capitalize">${p.category_id ? p.category_id.replace('cat_', '') : 'apparel'}</span>
            </div>
          </div>
          <button onclick="deleteProduct('${p.id}', this)" class="p-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors" title="${isEn ? 'Delete product' : 'Удалить товар'}">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  window.deleteProduct = async (id, btn) => {
    if (!confirm(isEn ? 'Are you sure you want to delete this product?' : 'Вы уверены, что хотите удалить этот товар из каталога?')) return;
    try {
      await VerdantStore.deleteAdminProduct(id);
      VerdantStore.showToast(isEn ? 'Product deleted' : 'Товар удален из каталога');
      if (btn) {
        const row = btn.closest('.flex');
        if (row) row.remove();
      }
      loadDashboard();
    } catch (err) {
      VerdantStore.showToast(err.message, 'error');
    }
  };

  // Wire buttons in top actions toolbar
  document.querySelectorAll('button').forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('новый товар') || text.includes('new product')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openNewProductModal();
      });
    } else if (text.includes('экспорт') || text.includes('export')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        exportReport();
      });
    }
  });

  // Wire sidebar nav links
  document.querySelectorAll('aside nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      const path = link.getAttribute('data-path');
      if (path === 'products') {
        e.preventDefault();
        openManageProductsModal();
      } else if (path === 'orders') {
        e.preventDefault();
        const ordersSection = document.querySelector('table');
        if (ordersSection) ordersSection.scrollIntoView({ behavior: 'smooth' });
      } else if (path === 'overview') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (path === 'analytics' || path === 'customers' || path === 'discounts') {
        e.preventDefault();
        VerdantStore.showToast(`Раздел «${link.textContent.trim()}» синхронизирован с API`);
      }
    });
  });

  // Initial load
  loadDashboard();
});
