import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CatalogPage } from './pages/CatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminPage } from './pages/AdminPage';
import { WishlistModal } from './components/WishlistModal';
import { WishlistProvider } from './context/WishlistContext';
import { useCart } from './context/CartContext';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'catalog' | 'checkout' | 'admin'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [activeModalInfo, setActiveModalInfo] = useState<'delivery' | 'about' | 'contacts' | null>(null);

  const { toastMessage } = useCart();

  // Synchronize with URL hash (#admin, #checkout, #catalog)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') setCurrentView('admin');
      else if (hash === '#checkout') setCurrentView('checkout');
      else if (hash === '#catalog' || hash === '') setCurrentView('catalog');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (view: 'catalog' | 'checkout' | 'admin') => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        setCurrentView={handleNavigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      <main className="flex-1 pt-20">
        {currentView === 'catalog' && (
          <CatalogPage
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}
        {currentView === 'checkout' && (
          <CheckoutPage onBackToCatalog={() => handleNavigate('catalog')} />
        )}
        {currentView === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Wishlist Drawer Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      {/* Informational Modals (Delivery, About, Contacts) */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-display font-bold text-lg text-on-surface">
                {activeModalInfo === 'delivery' && 'Доставка и возврат'}
                {activeModalInfo === 'about' && 'О бренде VERDANT'}
                {activeModalInfo === 'contacts' && 'Контакты и поддержка'}
              </h3>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="w-8 h-8 rounded-full bg-surface-low hover:bg-surface-container flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-on-surface-variant leading-relaxed space-y-3">
              {activeModalInfo === 'delivery' && (
                <>
                  <p>🌿 <strong>Бесплатная доставка</strong>: для всех заказов от $50 действует бесплатная курьерская доставка до двери или в пункты выдачи.</p>
                  <p>📦 <strong>Сроки</strong>: по Москве и Санкт-Петербургу — 1-2 дня. По регионам РФ — 3-5 рабочих дней.</p>
                  <p>🔄 <strong>Простой возврат</strong>: в течение 14 дней с момента получения в фирменной упаковке.</p>
                </>
              )}
              {activeModalInfo === 'about' && (
                <>
                  <p>🌿 <strong>VERDANT</strong> — это концептуальный маркетплейс этичной моды, органического текстиля и предметов домашнего уюта.</p>
                  <p>🌱 Мы отбираем товары из 100% натуральных, биоразлагаемых и переработанных материалов без токсичных красителей и синтетики.</p>
                  <p>✨ Прямое сотрудничество с локальными ремесленными мастерскими Европы и Азии.</p>
                </>
              )}
              {activeModalInfo === 'contacts' && (
                <>
                  <p>📞 <strong>Горячая линия</strong>: +7 (800) 555-35-35 (ежедневно с 09:00 до 21:00)</p>
                  <p>✉️ <strong>Email службы заботы</strong>: support@verdant-commerce.com</p>
                  <p>📍 <strong>Шоурум</strong>: г. Москва, ул. Арбат, дом 12, стр. 2</p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalInfo(null)}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover cursor-pointer"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-300">
          <span className="material-symbols-outlined text-[18px] text-primary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Footer */}
      <footer className="w-full bg-surface-low border-t border-surface-container text-on-surface-variant mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col md:flex-row items-start justify-between gap-8 text-xs">
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[16px]">eco</span>
              </span>
              <span className="font-display font-bold text-base text-on-surface">VERDANT</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Экологичный маркетплейс осознанного потребления. Премиальные материалы, честное производство и забота о планете.
            </p>
            <p className="text-[11px] text-on-surface-variant/70">
              © 2025 VERDANT Commerce. Все права защищены.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">Навигация</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => handleNavigate('catalog')} className="hover:text-primary transition-colors cursor-pointer">
                    Каталог товаров
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('checkout')} className="hover:text-primary transition-colors cursor-pointer">
                    Корзина покупок
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsWishlistOpen(true)} className="hover:text-primary transition-colors cursor-pointer">
                    Избранное
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('admin')} className="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                    Админ-панель
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">Покупателям</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => setActiveModalInfo('delivery')} className="hover:text-primary transition-colors cursor-pointer">
                    Доставка и возврат
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModalInfo('about')} className="hover:text-primary transition-colors cursor-pointer">
                    О бренде
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModalInfo('contacts')} className="hover:text-primary transition-colors cursor-pointer">
                    Контакты и шоурум
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">Быстрый вход</h4>
              <ul className="space-y-1.5">
                <li>
                  <a href="#admin" onClick={() => handleNavigate('admin')} className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold hover:bg-emerald-200 transition-colors inline-block text-[11px]">
                    Войти в Админку →
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WishlistProvider>
      <AppContent />
    </WishlistProvider>
  );
};
