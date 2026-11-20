import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  isWishlisted = false,
  onToggleWishlist
}) => {
  const { addToCart } = useCart();
  const { lang, t } = useLanguage();

  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      const sizesArray = Array.isArray(product.sizes)
        ? product.sizes
        : (typeof product.sizes === 'string'
            ? (product.sizes.startsWith('[') ? JSON.parse(product.sizes) : [product.sizes])
            : ['One Size']);
      setSelectedSize(sizesArray[0] || 'One Size');
      setSelectedColor(product.color || 'Естественный');
      setQuantity(1);
      setAddedAnimation(false);
    }
  }, [product]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const title = lang === 'en' ? product.title_en : product.title_ru;
  const description = lang === 'en' ? product.description_en : product.description_ru;

  const sizesArray: string[] = Array.isArray(product.sizes)
    ? product.sizes
    : (typeof product.sizes === 'string'
        ? (product.sizes.startsWith('[') ? JSON.parse(product.sizes) : [product.sizes])
        : ['One Size']);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          title="Закрыть"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Product Image Section */}
        <div className="relative w-full md:w-1/2 bg-surface-low p-6 flex items-center justify-center min-h-[260px] md:min-h-[420px]">
          <img
            src={product.image_url}
            alt={title}
            className="w-full h-full max-h-[380px] object-contain rounded-2xl drop-shadow-md hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {product.discount_percent > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary text-on-secondary shadow-xs">
                -{product.discount_percent}%
              </span>
            )}
            {Boolean(product.is_bestseller) && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">eco</span>
                Hit
              </span>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                <span>{product.rating_score}</span>
                <span className="text-on-surface-variant/70 font-normal">({product.rating_count})</span>
              </div>
            </div>

            <h2 className="font-display font-bold text-2xl text-on-surface leading-snug">
              {title}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display font-extrabold text-3xl text-primary">
                ${product.price.toFixed(2)}
              </span>
              {product.old_price && (
                <span className="text-base text-on-surface-variant/60 line-through">
                  ${product.old_price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              {description}
            </p>

            {/* Sizes */}
            {sizesArray.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-on-surface">Размер:</label>
                <div className="flex flex-wrap gap-2">
                  {sizesArray.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-low text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {product.color && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface">
                  Цвет: <span className="font-normal text-on-surface-variant">{selectedColor || product.color}</span>
                </label>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-surface-container flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-outline-variant rounded-xl bg-surface-low p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span className="w-8 text-center text-sm font-bold text-on-surface">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : product.stock > 0
                    ? 'bg-primary hover:bg-primary/90 text-white active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {addedAnimation ? 'check' : 'shopping_bag'}
                </span>
                {addedAnimation
                  ? 'Добавлено!'
                  : product.stock > 0
                  ? t('catalog.addToBag')
                  : 'Нет в наличии'}
              </button>

              {/* Wishlist Button */}
              {onToggleWishlist && (
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                    isWishlisted
                      ? 'border-red-300 bg-red-50 text-red-500'
                      : 'border-outline-variant bg-surface-low text-on-surface-variant hover:text-red-500 hover:bg-white'
                  }`}
                  title={isWishlisted ? 'В избранном' : 'Добавить в избранное'}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isWishlisted ? 'fill-current' : ''}`}>
                    favorite
                  </span>
                </button>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{product.stock > 5 ? 'В наличии на складе' : `Осталось мало: ${product.stock} шт.`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
