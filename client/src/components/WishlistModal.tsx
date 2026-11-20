import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProduct?: (product: any) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  onOpenProduct
}) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { lang } = useLanguage();

  if (!isOpen) return null;

  const handleAddAllToCart = () => {
    wishlist.forEach(item => {
      addToCart(item, 1);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-rose-500 text-[24px]">favorite</span>
            <h2 className="font-display font-bold text-lg text-on-surface">
              Избранное ({wishlist.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {wishlist.length > 0 && (
              <button
                onClick={clearWishlist}
                className="text-xs text-on-surface-variant hover:text-rose-600 transition-colors cursor-pointer mr-2"
              >
                Очистить
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-low hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors cursor-pointer"
              title="Закрыть"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-surface-container space-y-4">
          {wishlist.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">favorite_border</span>
              </div>
              <div>
                <p className="font-display font-bold text-base text-on-surface">В избранном пока пусто</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Нажимайте на сердечко на карточках товаров, чтобы сохранить понравившиеся вещи.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Перейти в каталог
              </button>
            </div>
          ) : (
            wishlist.map(product => {
              const title = lang === 'en' ? (product.title_en || product.title_ru) : (product.title_ru || product.title_en);
              return (
                <div key={product.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                  <img
                    src={product.image_url}
                    alt={title}
                    onClick={() => {
                      if (onOpenProduct) onOpenProduct(product);
                      onClose();
                    }}
                    className="w-16 h-16 rounded-xl object-cover bg-surface-container shrink-0 cursor-pointer hover:opacity-90"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 
                      onClick={() => {
                        if (onOpenProduct) onOpenProduct(product);
                        onClose();
                      }}
                      className="text-xs font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                    >
                      {title}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant truncate">{product.brand}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-display font-bold text-xs text-primary">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {product.old_price && (
                        <span className="text-[10px] text-outline line-through">
                          ${Number(product.old_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="p-2 rounded-lg bg-primary-fixed text-emerald-950 hover:bg-primary hover:text-white transition-all cursor-pointer"
                      title="В корзину"
                    >
                      <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="p-2 rounded-lg text-on-surface-variant hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Удалить"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Action */}
        {wishlist.length > 0 && (
          <div className="p-6 border-t border-surface-container bg-surface-low space-y-3">
            <button
              onClick={handleAddAllToCart}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Добавить всё в корзину
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
