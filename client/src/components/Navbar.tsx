import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentView: 'catalog' | 'checkout' | 'admin';
  setCurrentView: (view: 'catalog' | 'checkout' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onOpenWishlist: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenWishlist
}) => {
  const { totalCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { id: 'all', title_ru: 'Все новинки', title_en: 'All Arrivals' },
    { id: 'cat_apparel', title_ru: 'Одежда', title_en: 'Apparel' },
    { id: 'cat_living', title_ru: 'Дом и декор', title_en: 'Living' },
    { id: 'cat_accessories', title_ru: 'Кожа и сумки', title_en: 'Leather' },
    { id: 'cat_fragrance', title_ru: 'Ароматы', title_en: 'Fragrance' }
  ];

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentView('catalog');
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => { setCurrentView('catalog'); setSelectedCategory('all'); }}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
          >
            <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">eco</span>
            </span>
            <span className="font-display font-bold text-xl tracking-tight text-on-surface group-hover:text-primary transition-colors">
              VERDANT
            </span>
          </button>

          {/* Desktop Categories Navigation */}
          <nav className="hidden lg:flex items-center gap-5">
            {categories.map(cat => {
              const isActive = currentView === 'catalog' && selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`text-xs font-semibold tracking-wide py-1 border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {lang === 'en' ? cat.title_en : cat.title_ru}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Search (Desktop & Tablet) */}
        <div className="flex-1 max-w-xs md:max-w-sm hidden sm:block">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant pointer-events-none text-[18px]">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'catalog') setCurrentView('catalog');
              }}
              placeholder={t('nav.search')}
              className="w-full h-9 pl-9 pr-3 bg-surface-low rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30"
            />
          </div>
        </div>

        {/* Right Actions: Admin, Wishlist, Cart, Lang, Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Panel Link (Always visible, prominent!) */}
          <button
            onClick={() => setCurrentView('admin')}
            className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer border ${
              currentView === 'admin'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
            title="Панель администратора"
          >
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span className="hidden md:inline">Админка</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-low hover:text-rose-500 transition-all relative border border-outline-variant/30 cursor-pointer"
            title="Избранное"
          >
            <span className="material-symbols-outlined text-[18px]">favorite</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setCurrentView('checkout')}
            className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              currentView === 'checkout'
                ? 'bg-primary-hover text-white'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
            title="Корзина"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span className="hidden sm:inline">{t('nav.cart')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-emerald-950 font-bold text-[11px]">
              {totalCount}
            </span>
          </button>

          {/* Language Switch */}
          <div className="hidden sm:flex bg-surface-low p-0.5 rounded-lg items-center border border-outline-variant/30 text-[11px] font-semibold">
            <button
              onClick={() => setLang('ru')}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${
                lang === 'ru' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${
                lang === 'en' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              EN
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-lg bg-surface-low flex items-center justify-center text-on-surface cursor-pointer border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-surface-container px-6 py-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск товаров..."
              className="w-full h-10 pl-10 pr-3 bg-surface-low rounded-lg text-xs text-on-surface focus:outline-none border border-outline-variant/30"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
              Категории каталога
            </span>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
                  selectedCategory === cat.id && currentView === 'catalog'
                    ? 'bg-primary text-white'
                    : 'text-on-surface hover:bg-surface-low'
                }`}
              >
                <span>{lang === 'en' ? cat.title_en : cat.title_ru}</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-surface-container flex items-center justify-between">
            <button
              onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
              className="text-xs font-bold text-primary flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              Панель администратора
            </button>

            <div className="flex gap-1 text-xs font-bold">
              <button
                onClick={() => setLang('ru')}
                className={`px-2 py-1 rounded ${lang === 'ru' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}
              >
                RU
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
