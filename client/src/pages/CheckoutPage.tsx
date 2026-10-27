import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface CheckoutPageProps {
  onBackToCatalog: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToCatalog }) => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: 'Александр Смирнов',
    email: 'alex@example.com',
    phone: '+7 999 123-45-67',
    address: 'г. Москва, ул. Арбат, д. 12, кв. 34'
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp' | 'cash'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.createOrder({
        customer: formData,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        paymentMethod
      });

      if (res.success && res.orderId) {
        setCreatedOrderId(res.orderId);
        clearCart();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка оформления заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdOrderId) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-primary-fixed text-emerald-950 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        <h2 className="font-display font-bold text-3xl text-on-surface">
          {t('checkout.successTitle')}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {t('checkout.successDesc')} <span className="font-bold text-primary font-mono text-base">{createdOrderId}</span>
        </p>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
          Детали заказа и ссылка на трекинг отправлены на указанный email. Спасибо за покупку в VERDANT!
        </p>
        <div className="pt-4">
          <button
            onClick={onBackToCatalog}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            {t('checkout.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCatalog}
            className="w-9 h-9 rounded-lg bg-surface-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h1 className="font-display font-bold text-2xl text-on-surface">
            {t('checkout.title')}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer and Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-outline-variant/30 space-y-4">
              <h2 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                {t('checkout.delivery')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">{t('checkout.name')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">{t('checkout.email')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">{t('checkout.phone')}</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">{t('checkout.address')}</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-outline-variant/30 space-y-4">
              <h2 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">credit_card</span>
                {t('checkout.payment')}
              </h2>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 bg-surface-low cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-on-surface">{t('checkout.card')}</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 bg-surface-low cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'sbp'}
                    onChange={() => setPaymentMethod('sbp')}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-on-surface">{t('checkout.sbp')}</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 bg-surface-low cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-on-surface">{t('checkout.cash')}</span>
                </label>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-600 text-sm border border-rose-200">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className={`w-full h-12 rounded-xl text-base font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting || cart.length === 0
                  ? 'bg-outline text-white opacity-50 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span>{isSubmitting ? t('checkout.processing') : `${t('checkout.submit')} • $${totalPrice.toFixed(2)}`}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary & Cart Items */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-outline-variant/30 space-y-4">
            <h2 className="font-display font-bold text-base text-on-surface">
              {t('checkout.cart')} ({cart.length})
            </h2>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-sm">
                {t('checkout.cartEmpty')}
              </div>
            ) : (
              <div className="divide-y divide-surface-container space-y-3">
                {cart.map(item => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="pt-3 first:pt-0 flex gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover bg-surface-container shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-on-surface truncate">{item.title}</h4>
                      <p className="text-[11px] text-on-surface-variant">{item.brand} • {item.size}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-surface-low text-on-surface flex items-center justify-center text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-surface-low text-on-surface flex items-center justify-center text-xs font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-xs text-rose-500 hover:text-rose-700 ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-surface-container space-y-2 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('checkout.subtotal')}</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('checkout.shipping')}</span>
                <span className="text-primary font-semibold">{t('checkout.free')}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-on-surface pt-2 border-t border-surface-container">
                <span>{t('checkout.total')}</span>
                <span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
