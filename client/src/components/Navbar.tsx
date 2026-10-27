import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentView: 'catalog' | 'checkout' | 'admin';
  setCurrentView: (view: 'catalog' | 'checkout' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery
}) => {
  const { totalCount } = useCart();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
        {/* Brand Logo & Nav */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentView('catalog')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <span className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">eco</span>
            </span>
            <span className="font-display font-bold text-xl tracking-tight text-on-surface group-hover:text-primary transition-colors">
              VERDANT
            </span>
          </button>

          <nav className="hidden xl:flex items-center gap-6">
            <button
              onClick={() => setCurrentView('catalog')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'catalog' ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t('nav.apparel')}
            </button>
            <button
              onClick={() => setCurrentView('catalog')}
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t('nav.living')}
            </button>
            <button
              onClick={() => setCurrentView('catalog')}
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t('nav.footwear')}
            </button>
            <button
              onClick={() => setCurrentView('catalog')}
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t('nav.accessories')}
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'admin' ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              Админка
            </button>
          </nav>
        </div>

        {/* Live Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant pointer-events-none text-[20px]">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.search')}
              className="w-full h-10 pl-11 pr-4 bg-surface-low rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/20"
            />
          </div>
        </div>

        {/* Actions & Language Switcher */}
        <div className="flex items-center gap-3">
          {/* Language Switch */}
          <div className="bg-surface-low p-1 rounded-lg flex items-center gap-1 border border-outline-variant/30 text-xs font-semibold">
            <button
              onClick={() => setLang('ru')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lang === 'ru' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lang === 'en' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              EN
            </button>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setCurrentView('checkout')}
            className={`h-10 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              currentView === 'checkout'
                ? 'bg-primary-hover text-white'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span className="hidden sm:inline text-sm font-medium">{t('nav.cart')}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-primary-fixed text-emerald-950 text-xs font-bold">
              {totalCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
