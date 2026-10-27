import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

interface CatalogPageProps {
  searchQuery: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ searchQuery }) => {
  const { lang, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('new');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCategories()
      .then(cats => setCategories(cats))
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    api.getProducts({
      category: selectedCategory,
      search: searchQuery,
      maxPrice: maxPrice,
      sort: sortOption
    })
      .then(data => {
        if (active) {
          setProducts(data.products || []);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError(err.message || 'Ошибка загрузки товаров');
          setIsLoading(false);
        }
      });

    return () => { active = false; };
  }, [selectedCategory, searchQuery, maxPrice, sortOption]);

  return (
    <div className="w-full">
      {/* Category Hero Header */}
      <section className="w-full bg-surface-low px-6 lg:px-12 py-8 border-b border-surface-container">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <nav className="flex items-center gap-1.5 text-on-surface-variant text-xs">
              <span className="hover:text-primary transition-colors cursor-pointer">Каталог</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-on-surface font-semibold">Осень/Зима 2025</span>
            </nav>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-emerald-950 text-[11px] font-bold tracking-wider uppercase">
                {t('hero.badge')}
              </span>
              <h1 className="font-display font-bold text-2xl lg:text-3xl text-on-surface tracking-tight">
                {t('hero.title')}
              </h1>
            </div>

            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              {t('hero.desc')}
            </p>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto bg-white px-4 py-2.5 rounded-xl shadow-xs border border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-semibold text-on-surface">
                {products.length} {t('hero.selected')}
              </span>
            </div>
            <div className="h-4 w-px bg-surface-container"></div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[18px] material-symbols-filled">star</span>
              <span className="text-xs font-bold text-on-surface">4.92 {t('hero.rating')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout: Filters + Products Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <div className="flex items-center gap-2 text-on-surface font-display font-bold text-lg">
              <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
              <span>{t('filters.title')}</span>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setMaxPrice(500);
                setSortOption('new');
              }}
              className="text-xs text-primary hover:underline font-semibold"
            >
              {t('filters.reset')}
            </button>
          </div>

          {/* Categories Filter */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-outline-variant/30 space-y-2">
            <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-3">
              {t('filters.categories')}
            </span>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary-fixed text-emerald-950 font-bold'
                  : 'text-on-surface-variant hover:bg-surface-low'
              }`}
            >
              <span>{t('filters.all')}</span>
              <span className="text-[11px] opacity-75">{products.length}</span>
            </button>

            {categories.map(cat => {
              const catTitle = lang === 'en' ? (cat.name_en || cat.name_ru) : (cat.name_ru || cat.name_en);
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary-fixed text-emerald-950 font-bold'
                      : 'text-on-surface-variant hover:bg-surface-low'
                  }`}
                >
                  <span>{catTitle}</span>
                  <span className="text-[11px] opacity-75">{cat.count || ''}</span>
                </button>
              );
            })}
          </div>

          {/* Price Range Slider */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                {t('filters.price')}
              </span>
              <span className="text-xs font-semibold text-primary">
                $20 – ${maxPrice}
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="500"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />

            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>$20</span>
              <span>$500</span>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="flex-1 w-full space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-on-surface-variant">
              <span>Показано: </span>
              <span className="font-bold text-on-surface">{products.length}</span>
              <span> уникальных товаров</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2 bg-surface-low px-3 py-1.5 rounded-lg border border-outline-variant/30">
                <span className="text-xs text-on-surface-variant">{t('sort.label')}</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="popular">{t('sort.popular')}</option>
                  <option value="new">{t('sort.new')}</option>
                  <option value="cheap">{t('sort.cheap')}</option>
                  <option value="expensive">{t('sort.expensive')}</option>
                  <option value="rating">{t('sort.rating')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading or Error State */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-on-surface-variant">Загрузка каталога товаров...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-rose-500 bg-rose-50 rounded-xl p-6 border border-rose-200">
              <span className="material-symbols-outlined text-3xl mb-2">error</span>
              <p className="font-semibold text-sm">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-xl p-8 border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-primary">search_off</span>
              <p className="font-display font-semibold text-lg text-on-surface">{t('product.empty')}</p>
              <p className="text-xs text-on-surface-variant">{t('product.emptyDesc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
