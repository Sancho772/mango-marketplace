import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CatalogPage } from './pages/CatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminPage } from './pages/AdminPage';
import { useCart } from './context/CartContext';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'catalog' | 'checkout' | 'admin'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const { toastMessage } = useCart();

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1 pt-20">
        {currentView === 'catalog' && (
          <CatalogPage searchQuery={searchQuery} />
        )}
        {currentView === 'checkout' && (
          <CheckoutPage onBackToCatalog={() => setCurrentView('catalog')} />
        )}
        {currentView === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-primary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Footer */}
      <footer className="w-full bg-surface-low border-t border-surface-container text-on-surface-variant mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[14px]">eco</span>
            </span>
            <span className="font-display font-bold text-on-surface">VERDANT Commerce</span>
            <span>• © 2025 All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentView('catalog')} className="hover:text-primary transition-colors">
              Каталог
            </button>
            <button onClick={() => setCurrentView('checkout')} className="hover:text-primary transition-colors">
              Корзина
            </button>
            <button onClick={() => setCurrentView('admin')} className="hover:text-primary transition-colors">
              Админка
            </button>
            <a href="/hub.html" className="text-primary hover:underline font-semibold">
              Stitch Hub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
