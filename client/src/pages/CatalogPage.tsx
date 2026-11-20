import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';

interface CatalogPageProps {
  searchQuery: string;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  searchQuery,
  selectedCategory,
  setSelectedCategory
}) => {
  const { lang, t } = useLanguage();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortOption, setSortOption] = useState<string>('new');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [minPrice, setMinPrice] = useState<number>(20);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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
          setCurrentPage(1);
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

  // Client-side multi-dimensional filtration (Size, Color, Brand, Rating, MinPrice)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Min price
      if (p.price < minPrice) return false;

      // Rating
      if (minRating > 0 && p.rating_score < minRating) return false;

      // Brand
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;

      // Color
      if (selectedColor && p.color !== selectedColor) return false;

      // Size
      if (selectedSize) {
        const sizesArr = Array.isArray(p.sizes)
          ? p.sizes
          : (typeof p.sizes === 'string' && p.sizes.startsWith('[')
              ? JSON.parse(p.sizes)
              : [p.sizes]);
        if (!sizesArr.some((s: string) => s.toLowerCase().includes(selectedSize.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }, [products, minPrice, minRating, selectedBrands, selectedColor, selectedSize]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setMinPrice(20);
    setMaxPrice(500);
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedBrands([]);
    setMinRating(0);
    setSortOption('new');
    setCurrentPage(1);
  };

  const handleToggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
  const AVAILABLE_COLORS = [
    { label: 'Лес', hex: '#006948', name: 'Лес' },
    { label: 'Графит', hex: '#283044', name: 'Графит' },
    { label: 'Песок', hex: '#d2d9f4', name: 'Песок' },
    { label: 'Слоновая кость', hex: '#faf8ff', name: 'Слоновая кость' },
    { label: 'Янтарь', hex: '#fea619', name: 'Янтарь' },
    { label: 'Терракота', hex: '#9b3e3b', name: 'Терракота' }
  ];
  const BRANDS = ['Verdant Craft', 'Norse Studio', 'Atelier Minimal', 'Form & Function'];

  return (
    <div className="w-full">
      {/* Category Hero Header */}
      <section className="w-full bg-surface-low px-6 lg:px-12 py-8 border-b border-surface-container">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <nav className="flex items-center gap-1.5 text-on-surface-variant text-xs">
              <button onClick={() => setSelectedCategory('all')} className="hover:text-primary transition-colors cursor-pointer">
                Каталог
              </button>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <button onClick={handleResetFilters} className="hover:text-primary transition-colors cursor-pointer">
                Осень/Зима 2025
              </button>
              {selectedCategory !== 'all' && (
                <>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-on-surface font-semibold capitalize">
                    {categories.find(c => c.slug === selectedCategory || c.id === selectedCategory)?.name_ru || selectedCategory}
                  </span>
                </>
              )}
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
                {filteredProducts.length} {t('hero.selected')}
              </span>
            </div>
            <div className="h-4 w-px bg-surface-container"></div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[18px] fill-current">star</span>
              <span className="text-xs font-bold text-on-surface">4.92 {t('hero.rating')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout: Filters + Products Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <div className="flex items-center gap-2 text-on-surface font-display font-bold text-base">
              <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
              <span>{t('filters.title')}</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-primary hover:underline font-semibold cursor-pointer"
            >
              {t('filters.reset')}
            </button>
          </div>

          {/* 1. Categories Filter */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-outline-variant/30 space-y-2">
            <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-2">
              {t('filters.categories')}
            </span>

            <button
              onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-low'
              }`}
            >
              <span>{t('filters.all')}</span>
              <span className="text-[11px] opacity-75">{products.length}</span>
            </button>

            {categories.map(cat => {
              const catTitle = lang === 'en' ? (cat.name_en || cat.name_ru) : (cat.name_ru || cat.name_en);
              const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setCurrentPage(1); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-low'
                  }`}
                >
                  <span>{catTitle}</span>
                  <span className="text-[11px] opacity-75">{cat.count || ''}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Price Range Slider */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                {t('filters.price')}
              </span>
              <span className="text-xs font-bold text-primary">
                ${minPrice} – ${maxPrice}
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="500"
              step="5"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(Number(e.target.value)); setCurrentPage(1); }}
              className="w-full accent-primary cursor-pointer"
            />

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex-1 bg-surface-low p-2 rounded-lg border border-outline-variant/30 text-xs">
                <span className="text-on-surface-variant text-[11px]">От:</span>
                <input
                  type="number"
                  min="0"
                  max={maxPrice}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-on-surface focus:outline-none"
                />
              </div>
              <div className="flex-1 bg-surface-low p-2 rounded-lg border border-outline-variant/30 text-xs">
                <span className="text-on-surface-variant text-[11px]">До:</span>
                <input
                  type="number"
                  min={minPrice}
                  max="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-on-surface focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Size Filter Chips (Interactive!) */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-outline-variant/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Размер
              </span>
              {selectedSize && (
                <button
                  onClick={() => setSelectedSize(null)}
                  className="text-[11px] text-primary hover:underline cursor-pointer"
                >
                  Сбросить
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {AVAILABLE_SIZES.map(size => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(isSelected ? null : size);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Color Swatches (Interactive!) */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-outline-variant/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Цвет
              </span>
              {selectedColor && (
                <button
                  onClick={() => setSelectedColor(null)}
                  className="text-[11px] text-primary hover:underline cursor-pointer"
                >
                  Сбросить
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {AVAILABLE_COLORS.map(c => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedColor(isSelected ? null : c.name);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 p-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-50 border-primary text-primary font-bold'
                        : 'bg-surface-low border-transparent text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Brands Filter Checkboxes */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-outline-variant/30 space-y-2">
            <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-1">
              Бренды и мастерские
            </span>
            <div className="space-y-1.5">
              {BRANDS.map(brand => {
                const isChecked = selectedBrands.includes(brand);
                return (
                  <label key={brand} className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleBrand(brand)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <span>{brand}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 6. Rating Filter */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-outline-variant/30 space-y-2">
            <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-1">
              Рейтинг
            </span>
            <div className="space-y-1">
              {[
                { label: 'Все оценки', value: 0 },
                { label: '★ 4.8 и выше', value: 4.8 },
                { label: '★ 4.5 и выше', value: 4.5 }
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-xs text-on-surface cursor-pointer py-1">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === opt.value}
                    onChange={() => { setMinRating(opt.value); setCurrentPage(1); }}
                    className="accent-primary cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="flex-1 w-full space-y-6">
          {/* Controls Bar: Count, Sort, Grid/List view */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-on-surface-variant">
              <span>Показано: </span>
              <span className="font-bold text-on-surface">{filteredProducts.length}</span>
              <span> из {products.length} уникальных товаров</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Sorting */}
              <div className="flex items-center gap-2 bg-surface-low px-3 py-1.5 rounded-xl border border-outline-variant/30">
                <span className="text-xs text-on-surface-variant">{t('sort.label')}</span>
                <select
                  value={sortOption}
                  onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="popular">{t('sort.popular')}</option>
                  <option value="new">{t('sort.new')}</option>
                  <option value="cheap">{t('sort.cheap')}</option>
                  <option value="expensive">{t('sort.expensive')}</option>
                  <option value="rating">{t('sort.rating')}</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-surface-low p-1 rounded-xl border border-outline-variant/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-xs text-primary' : 'text-on-surface-variant'
                  }`}
                  title="Сетка"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-xs text-primary' : 'text-on-surface-variant'
                  }`}
                  title="Список"
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Tags Bar (if any) */}
          {(selectedCategory !== 'all' || selectedSize || selectedColor || selectedBrands.length > 0 || minRating > 0) && (
            <div className="flex flex-wrap items-center gap-2 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-xs">
              <span className="text-[11px] font-semibold text-emerald-900">Активные фильтры:</span>
              {selectedCategory !== 'all' && (
                <span className="bg-white border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-950 font-medium flex items-center gap-1">
                  Категория: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-rose-500 cursor-pointer">✕</button>
                </span>
              )}
              {selectedSize && (
                <span className="bg-white border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-950 font-medium flex items-center gap-1">
                  Размер: {selectedSize}
                  <button onClick={() => setSelectedSize(null)} className="hover:text-rose-500 cursor-pointer">✕</button>
                </span>
              )}
              {selectedColor && (
                <span className="bg-white border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-950 font-medium flex items-center gap-1">
                  Цвет: {selectedColor}
                  <button onClick={() => setSelectedColor(null)} className="hover:text-rose-500 cursor-pointer">✕</button>
                </span>
              )}
              {selectedBrands.map(b => (
                <span key={b} className="bg-white border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-950 font-medium flex items-center gap-1">
                  {b}
                  <button onClick={() => handleToggleBrand(b)} className="hover:text-rose-500 cursor-pointer">✕</button>
                </span>
              ))}
              {minRating > 0 && (
                <span className="bg-white border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-950 font-medium flex items-center gap-1">
                  ★ {minRating}+
                  <button onClick={() => setMinRating(0)} className="hover:text-rose-500 cursor-pointer">✕</button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 font-bold hover:underline cursor-pointer ml-auto"
              >
                Сбросить всё
              </button>
            </div>
          )}

          {/* Loading or Error State */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-on-surface-variant">Загрузка каталога товаров...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-rose-500 bg-rose-50 rounded-2xl p-6 border border-rose-200">
              <span className="material-symbols-outlined text-3xl mb-2">error</span>
              <p className="font-semibold text-sm">{error}</p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white rounded-2xl p-8 border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-primary">search_off</span>
              <p className="font-display font-semibold text-lg text-on-surface">{t('product.empty')}</p>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto">{t('product.emptyDesc')}</p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover cursor-pointer"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid or List */}
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }>
                {paginatedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    isWishlisted={isWishlisted(product.id)}
                    onToggleWishlist={() => toggleWishlist(product)}
                  />
                ))}
              </div>

              {/* Functional Pagination Engine */}
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl p-4 shadow-xs border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-on-surface-variant">
                    Стр. <span className="font-bold text-on-surface">{currentPage}</span> из{' '}
                    <span className="font-bold text-on-surface">{totalPages}</span>
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="w-9 h-9 rounded-xl border border-outline-variant/30 text-on-surface flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-low"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-surface-low text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="w-9 h-9 rounded-xl border border-outline-variant/30 text-on-surface flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-low"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        isWishlisted={quickViewProduct ? isWishlisted(quickViewProduct.id) : false}
        onToggleWishlist={() => quickViewProduct && toggleWishlist(quickViewProduct)}
      />
    </div>
  );
};
