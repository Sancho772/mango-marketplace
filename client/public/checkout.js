/**
 * Mango Marketplace — Checkout Dynamic Controller
 * Reads cart from LocalStorage, computes totals, submits real order to REST API
 */

document.addEventListener('DOMContentLoaded', () => {
  const isEn = window.location.pathname.includes('_en');
  const itemsContainer = document.querySelector('aside .flex.flex-col.gap-4');
  const itemsCountLabel = document.querySelector('aside h3 + span');
  const subtotalEl = document.querySelector('aside .tabular-nums');
  const submitBtn = document.querySelector('section button.bg-primary');
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const emailInput = document.getElementById('contact-email');
  const addressInput = document.getElementById('street-address');
  const cityInput = document.getElementById('city');

  // If cart is empty in localStorage, provide a sensible default item for preview if user opened checkout directly
  let cart = MangoStore.getCart();
  if (cart.length === 0) {
    cart = [
      {
        productId: 'prod_1',
        title: isEn ? 'Merino Wool Overshirt' : 'Рубашка из мериносовой шерсти',
        price: 96.00,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-dhE2nGIGxhDMdE8a8TL9KkxNb3NSgfIy9CoqElBuJFAduN-8GDmdmTUi6so8TF8zQ7VFIG1mC6op2xFcsrGtSly03jctOzLZVCnhVD0dA9Nf10qvMSZIBIwoa2xk6DriWxtFrP7qLifb-pS3GdsG3O125bYgyIb3xXrPPK5NDh9IC6wCvTRoroI_6bFGSGnEdTshmO1q8LzfAqdZXA3dyCXv7DaPFcQo6xt9ilshdM_ohHfvQ6VpEw',
        brand: 'Verdant Craft',
        size: 'L',
        color: 'Графит',
        quantity: 1
      },
      {
        productId: 'prod_2',
        title: isEn ? 'Artisanal Ceramic Pour-Over' : 'Керамическая воронка для кофе',
        price: 54.00,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzm7Nck3bkHzdyNjRRbw-c3jucFurZ_JHniQ0HwGXszdUYLOBDWfyJ1ibeKB0zenHaWTxQxfOCefdmNcdG7Y_s-J26elFo3CqEzuJ0E4hBHQo-sjbZqySmLLCEija9umnXCfRtrGOOg2X3q3ZZ-P7zUTDDJDAdvASRs7FdMMzmkgHjvx3rRR9sG-E8xgDnkijAvZ1VLvynchAyZWtiUsxQqv0o_o67LymxS-zhy6y7ig0_tliia7rc_Q',
        brand: 'Norse Studio',
        size: 'One Size',
        color: 'Слоновая кость',
        quantity: 1
      }
    ];
    MangoStore.saveCart(cart);
  }

  function renderOrderItems() {
    if (!itemsContainer) return;
    cart = MangoStore.getCart();

    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="py-8 text-center text-on-surface-variant">
          <p class="font-label-md">${isEn ? 'Your bag is empty' : 'Ваша корзина пуста'}</p>
          <a href="${isEn ? 'catalog_en.html' : 'catalog_ru.html'}" class="mt-2 inline-block text-primary underline text-xs">
            ${isEn ? 'Return to shop' : 'Вернуться в каталог'}
          </a>
        </div>
      `;
      if (itemsCountLabel) itemsCountLabel.textContent = isEn ? '0 items' : '0 товаров';
      updateTotals(0);
      return;
    }

    if (itemsCountLabel) {
      const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      itemsCountLabel.textContent = isEn ? `${totalCount} items` : `${totalCount} товара`;
    }

    itemsContainer.innerHTML = cart.map(item => `
      <div class="flex items-center gap-4 group">
        <div class="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm flex-shrink-0 border border-outline-variant/30">
          <img class="w-full h-full object-cover" src="${item.imageUrl}" alt="${item.title}">
          <span class="absolute top-1 right-1 w-5 h-5 rounded-full bg-on-surface text-surface text-[10px] font-bold flex items-center justify-center">
            ${item.quantity}
          </span>
        </div>
        <div class="flex flex-col flex-1 min-w-0">
          <span class="font-label-md text-label-md text-on-surface font-semibold line-clamp-1">${item.title}</span>
          <span class="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">${item.size || 'M'} • ${item.color || 'Стандарт'}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-label-md text-label-md text-on-surface font-bold tabular-nums">$${(item.price * item.quantity).toFixed(2)}</span>
          <button onclick="handleRemoveItem('${item.productId}')" class="text-outline-variant hover:text-rose-500 transition-colors" title="${isEn ? 'Remove' : 'Удалить'}">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateTotals(subtotal);
  }

  function updateTotals(subtotal) {
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
    const total = subtotal + shipping;

    // Update summary values on page
    document.querySelectorAll('aside .flex.items-center.justify-between').forEach(row => {
      const label = row.querySelector('span:first-child');
      const val = row.querySelector('span:last-child');
      if (!label || !val) return;
      const text = label.textContent.toLowerCase();
      if (text.includes('подытог') || text.includes('subtotal')) {
        val.textContent = `$${subtotal.toFixed(2)}`;
      } else if (text.includes('доставка') || text.includes('shipping')) {
        val.textContent = shipping === 0 ? (isEn ? 'Free' : 'Бесплатно') : `$${shipping.toFixed(2)}`;
      } else if (text.includes('итого') || text.includes('total')) {
        val.textContent = `$${total.toFixed(2)}`;
      }
    });

    if (submitBtn) {
      const btnSpan = submitBtn.querySelector('span:last-child');
      if (btnSpan) {
        btnSpan.textContent = isEn 
          ? `Complete Order — $${total.toFixed(2)}` 
          : `Оформить заказ — $${total.toFixed(2)}`;
      }
    }
  }

  window.handleRemoveItem = (id) => {
    MangoStore.removeFromCart(id);
    renderOrderItems();
  };

  // Handle Order Placement
  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      cart = MangoStore.getCart();

      if (cart.length === 0) {
        MangoStore.showToast(isEn ? 'Your cart is empty' : 'Корзина пуста', 'error');
        return;
      }

      const firstName = (firstNameInput ? firstNameInput.value : '') || 'Александр';
      const lastName = (lastNameInput ? lastNameInput.value : '') || 'Райт';
      const email = (emailInput ? emailInput.value : '') || 'customer@example.com';
      const address = (addressInput ? addressInput.value : '') || 'ул. Ленина, 10';
      const city = (cityInput ? cityInput.value : '') || 'Москва';

      const orderPayload = {
        customer: {
          name: `${firstName} ${lastName}`.trim(),
          email: email.trim(),
          phone: '+7 999 123-45-67',
          address: `${city}, ${address}`.trim()
        },
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        paymentMethod: 'card'
      };

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          <span>${isEn ? 'Processing Order...' : 'Оформление заказа...'}</span>
        `;

        const result = await MangoStore.createOrder(orderPayload);

        // Success state!
        MangoStore.clearCart();
        showOrderSuccessModal(result.orderId, result.totalAmount);
      } catch (err) {
        console.error('Order creation failed:', err);
        MangoStore.showToast(err.message, 'error');
        renderOrderItems();
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  function showOrderSuccessModal(orderId, total) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-surface-container-lowest max-w-md w-full p-8 rounded-3xl shadow-2xl border border-primary/20 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
        <div class="w-16 h-16 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shadow-lg">
          <span class="material-symbols-outlined text-[36px]">check_circle</span>
        </div>
        <div>
          <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">
            ${isEn ? 'Thank you for your order!' : 'Заказ успешно оформлен!'}
          </h2>
          <p class="font-body-sm text-on-surface-variant mt-1">
            ${isEn ? 'Order ID:' : 'Номер заказа:'} <span class="font-mono font-bold text-primary">${orderId}</span>
          </p>
        </div>
        <div class="w-full p-4 rounded-xl bg-surface-container-low text-xs text-on-surface-variant text-left space-y-1">
          <div class="flex justify-between">
            <span>${isEn ? 'Payment Status:' : 'Статус оплаты:'}</span>
            <span class="font-semibold text-emerald-700">${isEn ? 'Paid' : 'Оплачен (Карта)'}</span>
          </div>
          <div class="flex justify-between">
            <span>${isEn ? 'Total:' : 'Сумма:'}</span>
            <span class="font-bold text-on-surface">$${Number(total).toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span>${isEn ? 'Estimated Delivery:' : 'Ориентировочная доставка:'}</span>
            <span class="font-medium text-on-surface">2–4 ${isEn ? 'days' : 'дня'}</span>
          </div>
        </div>
        <div class="flex gap-3 w-full mt-2">
          <a href="${isEn ? 'catalog_en.html' : 'catalog_ru.html'}" class="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all">
            ${isEn ? 'Continue Shopping' : 'В магазин'}
          </a>
          <a href="${isEn ? 'admin_en.html' : 'admin_ru.html'}" class="py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all">
            ${isEn ? 'Admin' : 'В админку'}
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Initial render
  renderOrderItems();
});
