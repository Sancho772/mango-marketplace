/**
 * Mango Marketplace — Shared Client Store & API Service
 * Production-ready client logic for Catalog, Cart, Checkout, and Admin
 */

const API_BASE = window.location.origin.includes(':4000') 
  ? '/api' 
  : 'http://127.0.0.1:4000/api';

const MangoStore = {
  // --- Cart Management (LocalStorage) ---
  getCart() {
    try {
      const data = localStorage.getItem('mango_cart_v1');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read cart', e);
      return [];
    }
  },

  saveCart(cart) {
    try {
      localStorage.setItem('mango_cart_v1', JSON.stringify(cart));
      this.updateCartBadges();
      window.dispatchEvent(new CustomEvent('mango:cart-updated', { detail: cart }));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  },

  addToCart(product, quantity = 1, size = 'Standard', color = 'Standard') {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => 
      item.productId === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        title: product.title_ru || product.title_en || product.title,
        price: product.price,
        imageUrl: product.image_url,
        brand: product.brand,
        size,
        color,
        quantity
      });
    }

    this.saveCart(cart);
    this.showToast(`«${(product.title_ru || product.title).slice(0, 30)}...» добавлен в корзину`);
  },

  updateItemQuantity(productId, quantity) {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(item => item.productId !== productId);
    } else {
      const item = cart.find(item => item.productId === productId);
      if (item) item.quantity = quantity;
    }
    this.saveCart(cart);
  },

  removeFromCart(productId) {
    const cart = this.getCart().filter(item => item.productId !== productId);
    this.saveCart(cart);
  },

  clearCart() {
    this.saveCart([]);
  },

  getCartTotal() {
    return this.getCart().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  },

  getCartCount() {
    return this.getCart().reduce((acc, item) => acc + item.quantity, 0);
  },

  updateCartBadges() {
    const count = this.getCartCount();
    document.querySelectorAll('[data-cart-badge], [data-path="cart"] span:last-child').forEach(el => {
      if (el.tagName === 'SPAN' && (el.classList.contains('rounded-full') || el.hasAttribute('data-cart-badge'))) {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-flex' : 'none';
      }
    });
  },

  // --- API Services ---
  async fetchProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`);
    if (!res.ok) throw new Error('Ошибка загрузки товаров');
    return res.json();
  },

  async fetchCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Ошибка загрузки категорий');
    return res.json();
  },

  async createOrder(orderPayload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка при создании заказа');
    return data;
  },

  async fetchAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`);
    if (!res.ok) throw new Error('Ошибка загрузки метрик');
    return res.json();
  },

  async fetchAdminOrders(status = '') {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/admin/orders${query}`);
    if (!res.ok) throw new Error('Ошибка загрузки заказов');
    return res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Ошибка при обновлении статуса заказа');
    return res.json();
  },

  // --- UI Toast Notification (Max 2 lines, rule 9) ---
  showToast(message, type = 'success') {
    let container = document.getElementById('mango-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'mango-toast-container';
      container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    toast.className = `p-3 rounded-xl shadow-xl border text-xs font-medium flex items-center gap-2 transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto ${
      isSuccess 
        ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 backdrop-blur-md' 
        : 'bg-rose-950/95 border-rose-500/40 text-rose-300 backdrop-blur-md'
    }`;

    toast.innerHTML = `
      <span class="material-symbols-outlined text-[18px] shrink-0">${isSuccess ? 'check_circle' : 'error'}</span>
      <span class="line-clamp-2">${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Auto-run badge updates on load
document.addEventListener('DOMContentLoaded', () => {
  MangoStore.updateCartBadges();

  // Wire standard header links
  document.querySelectorAll('a[data-path="cart"]').forEach(a => {
    if (a.getAttribute('href') === '#') {
      const isEn = window.location.pathname.includes('_en');
      a.setAttribute('href', isEn ? 'checkout_en.html' : 'checkout_ru.html');
    }
  });

  document.querySelectorAll('a[data-path="storefront-home"]').forEach(a => {
    if (a.getAttribute('href') === '#') {
      const isEn = window.location.pathname.includes('_en');
      a.setAttribute('href', isEn ? 'catalog_en.html' : 'catalog_ru.html');
    }
  });
});

if (typeof window !== 'undefined') {
  window.MangoStore = MangoStore;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MangoStore;
}
