/**
 * Mango Marketplace — Admin Dashboard Dynamic Controller
 * Fetches real metrics and orders from REST API with interactive status updates
 */

document.addEventListener('DOMContentLoaded', () => {
  const isEn = window.location.pathname.includes('_en');
  const ordersTbody = document.getElementById('adminOrdersTable');

  // Metric elements
  const metricCards = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-4 > div');

  async function loadDashboard() {
    try {
      // 1. Fetch metrics
      const metrics = await MangoStore.fetchAdminMetrics();
      if (metrics) {
        updateMetricCards(metrics);
      }

      // 2. Fetch orders
      const orders = await MangoStore.fetchAdminOrders();
      if (orders && ordersTbody) {
        renderOrders(orders);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      MangoStore.showToast(err.message, 'error');
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
      const statusLabel = isEn ? curStatus.en : curStatus.ru;

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
                <span class="font-body-sm text-body-sm text-on-surface-variant truncate">${ord.customer_email || ord.customer_phone}</span>
              </div>
            </div>
          </td>
          <td class="py-4 px-4">
            <div class="flex flex-col max-w-xs">
              <span class="font-medium text-on-surface line-clamp-1">${itemsSummary}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">${ord.shipping_address}</span>
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
      await MangoStore.updateOrderStatus(orderId, newStatus);
      MangoStore.showToast(isEn ? `Order #${orderId} updated to ${newStatus}` : `Статус #${orderId} обновлен на «${newStatus}»`);
      loadDashboard();
    } catch (err) {
      console.error(err);
      MangoStore.showToast(err.message, 'error');
    }
  };

  // Initial load
  loadDashboard();
});
