import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { lang, t } = useLanguage();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const title = lang === 'en' ? (product.title_en || product.title_ru) : (product.title_ru || product.title_en);
  const desc = lang === 'en' ? (product.description_en || product.description_ru) : (product.description_ru || product.description_en);

  const handleAdd = () => {
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <article className="group bg-white rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden relative border border-outline-variant/30">
      {/* Image & Badges */}
      <div className="relative w-full aspect-square bg-surface-container overflow-hidden">
        <img
          src={product.image_url}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badge */}
        {product.discount_percent > 0 ? (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-secondary text-amber-950 text-xs font-bold shadow-xs">
            -{product.discount_percent}% {t('product.discount')}
          </span>
        ) : product.is_bestseller ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary-fixed text-emerald-950 text-xs font-bold shadow-xs">
            {t('product.bestseller')}
          </span>
        ) : null}

        {/* Wishlist Heart */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-on-surface-variant hover:text-rose-500 flex items-center justify-center transition-colors shadow-xs"
          title="Wishlist"
        >
          <span className={`material-symbols-outlined text-[18px] ${isWishlisted ? 'text-rose-500 material-symbols-filled' : ''}`}>
            favorite
          </span>
        </button>
      </div>

      {/* Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-secondary font-medium text-xs">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] material-symbols-filled">star</span>
              <span className="font-bold text-on-surface">{product.rating_score}</span>
              <span className="text-on-surface-variant">({product.rating_count})</span>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
              {product.brand}
            </span>
          </div>

          <h3 className="font-display font-semibold text-base text-on-surface tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>

          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Pricing and Action */}
        <div className="pt-1 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-xl text-on-surface">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.old_price && (
              <span className="text-sm text-outline line-through">
                ${Number(product.old_price).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className={`w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
              isAdded
                ? 'bg-emerald-800 text-white'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>{isAdded ? t('product.added') : t('product.add')}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
