import React, { useState, useEffect } from 'react';
import { AdminMetrics, Order, Product, Category } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const AdminPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Metrics & Orders state
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Product Modal (Create or Edit)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    title_ru: '',
    title_en: '',
    category_id: 'cat_apparel',
    description_ru: '',
    description_en: '',
    price: 99.00,
    old_price: 120.00,
    brand: 'VERDANT',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    color: 'Естественный',
    sizes: 'S, M, L, XL',
    stock: 20,
    is_bestseller: 0,
    discount_percent: 0
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, o, prodData, cats] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminOrders(),
        api.getProducts(),
        api.getCategories()
      ]);
      setMetrics(m);
      setOrders(o);
      setProducts(prodData.products || []);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenCreateModal = () => {
    setProductForm({
      title_ru: '',
      title_en: '',
      category_id: categories[0]?.id || 'cat_apparel',
      description_ru: '',
      description_en: '',
      price: 99.00,
      old_price: 120.00,
      brand: 'VERDANT',
      image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
      color: 'Естественный',
      sizes: 'S, M, L, XL',
      stock: 25,
      is_bestseller: 0,
      discount_percent: 0
    });
    setEditingProduct(null);
    setIsCreatingProduct(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    const sizesStr = Array.isArray(prod.sizes)
      ? prod.sizes.join(', ')
      : (typeof prod.sizes === 'string' && prod.sizes.startsWith('[')
          ? JSON.parse(prod.sizes).join(', ')
          : String(prod.sizes || 'One Size'));

    setProductForm({
      title_ru: prod.title_ru,
      title_en: prod.title_en || '',
      category_id: prod.category_id,
      description_ru: prod.description_ru || '',
      description_en: prod.description_en || '',
      price: prod.price,
      old_price: prod.old_price || 0,
      brand: prod.brand || 'VERDANT',
      image_url: prod.image_url,
      color: prod.color || 'Естественный',
      sizes: sizesStr,
      stock: prod.stock,
      is_bestseller: prod.is_bestseller ? 1 : 0,
      discount_percent: prod.discount_percent || 0
    });
    setEditingProduct(prod);
    setIsCreatingProduct(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);
    try {
      const sizesArray = productForm.sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        ...productForm,
        sizes: sizesArray,
        price: Number(productForm.price),
        old_price: productForm.old_price ? Number(productForm.old_price) : null,
        stock: Number(productForm.stock),
        discount_percent: Number(productForm.discount_percent),
        is_bestseller: Number(productForm.is_bestseller)
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      setEditingProduct(null);
      setIsCreatingProduct(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения товара');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (prodId: string, title: string) => {
    if (!confirm(`Вы действительно хотите удалить товар "${title}"?`)) return;
    try {
      await api.deleteProduct(prodId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления товара');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">
            {t('admin.title')}
          </h1>
          <p className="text-xs text-on-surface-variant">
            Live-аналитика заказов и управление каталогом товаров VERDANT
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'products' && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Добавить товар
            </button>
          )}

          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-surface-low hover:bg-surface-container rounded-xl text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Обновить
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-outline-variant/30 space-y-2">
            <span className="text-xs font-semibold text-on-surface-variant">{t('admin.revenue')}</span>
            <div className="font-display font-bold text-2xl text-primary">
              ${metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">↑ Выручка магазина</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-outline-variant/30 space-y-2">
            <span className="text-xs font-semibold text-on-surface-variant">{t('admin.orders')}</span>
            <div className="font-display font-bold text-2xl text-on-surface">
              {metrics.ordersCount}
            </div>
            <p className="text-[11px] text-on-surface-variant">Всего оформлено</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-outline-variant/30 space-y-2">
            <span className="text-xs font-semibold text-on-surface-variant">{t('admin.avgCheck')}</span>
            <div className="font-display font-bold text-2xl text-secondary">
              ${metrics.averageCheck.toFixed(2)}
            </div>
            <p className="text-[11px] text-amber-600 font-medium">Средний чек</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-outline-variant/30 space-y-2">
            <span className="text-xs font-semibold text-on-surface-variant">Товаров в базе</span>
            <div className="font-display font-bold text-2xl text-emerald-700">
              {products.length}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Каталог VERDANT</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-surface-container gap-4">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          Заказы ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          Управление товарами ({products.length})
        </button>
      </div>

      {/* TAB 1: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden space-y-4">
          <div className="p-5 border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-display font-bold text-base text-on-surface">
              {t('admin.tableTitle')} ({filteredOrders.length})
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-medium">Статус:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-low border border-outline-variant/30 text-on-surface rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">Все статусы</option>
                <option value="pending">pending (ожидает)</option>
                <option value="processing">processing (в обработке)</option>
                <option value="shipped">shipped (отправлен)</option>
                <option value="delivered">delivered (доставлен)</option>
                <option value="cancelled">cancelled (отменен)</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-on-surface-variant">
              Загрузка таблицы заказов...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant">
              Заказов с таким статусом не найдено
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-low text-on-surface-variant font-semibold border-b border-surface-container">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">{t('admin.customer')}</th>
                    <th className="py-3 px-4">Состав</th>
                    <th className="py-3 px-4">{t('admin.amount')}</th>
                    <th className="py-3 px-4">{t('admin.status')}</th>
                    <th className="py-3 px-4">{t('admin.date')}</th>
                    <th className="py-3 px-4 text-right">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-surface-low/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        {order.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-on-surface">{order.customer_name}</div>
                        <div className="text-[11px] text-on-surface-variant">{order.customer_email} • {order.customer_phone}</div>
                        <div className="text-[10px] text-on-surface-variant/70 truncate max-w-xs">{order.shipping_address}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-0.5">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-[11px] text-on-surface">
                                {item.product_title || 'Товар'} × {item.quantity} ({item.size})
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-[10px] text-on-surface-variant">
                                + еще {order.items.length - 2} поз.
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-on-surface">
                          ${Number(order.total_amount).toFixed(2)}
                        </div>
                        {order.promo_code && (
                          <div className="text-[10px] text-emerald-600 font-mono">
                            {order.promo_code} (-${order.discount_amount})
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-surface-low border border-outline-variant/30 text-on-surface rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="pending">pending</option>
                          <option value="processing">processing</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Products Management */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden space-y-4">
          <div className="p-5 border-b border-surface-container flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-on-surface">
              Каталог товаров VERDANT ({products.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-low text-on-surface-variant font-semibold border-b border-surface-container">
                <tr>
                  <th className="py-3 px-4">Фото</th>
                  <th className="py-3 px-4">Наименование</th>
                  <th className="py-3 px-4">Категория</th>
                  <th className="py-3 px-4">Цена</th>
                  <th className="py-3 px-4">Склад</th>
                  <th className="py-3 px-4">Рейтинг</th>
                  <th className="py-3 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {products.map(prod => (
                  <tr key={prod.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={prod.image_url}
                        alt={prod.title_ru}
                        className="w-12 h-12 object-cover rounded-xl bg-surface-container"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-on-surface">{prod.title_ru}</div>
                      <div className="text-[11px] text-on-surface-variant">{prod.title_en} • {prod.brand}</div>
                      {prod.discount_percent > 0 && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          -{prod.discount_percent}% скидка
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant font-medium">
                      {prod.category_id}
                    </td>
                    <td className="py-3 px-4 font-bold text-on-surface">
                      ${Number(prod.price).toFixed(2)}
                      {prod.old_price && (
                        <span className="text-[11px] text-outline line-through ml-1 font-normal">
                          ${Number(prod.old_price).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${prod.stock < 5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {prod.stock} шт.
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-500 font-bold">
                      ★ {prod.rating_score}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="px-2.5 py-1 bg-surface-low hover:bg-surface-container text-on-surface rounded-lg font-semibold transition-colors cursor-pointer border border-outline-variant/30"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.title_ru)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-semibold transition-colors cursor-pointer border border-rose-200"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {(isCreatingProduct || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-display font-bold text-xl text-on-surface">
                {editingProduct ? 'Редактировать товар' : 'Новый товар VERDANT'}
              </h3>
              <button
                onClick={() => { setEditingProduct(null); setIsCreatingProduct(false); }}
                className="w-8 h-8 rounded-full bg-surface-low hover:bg-surface-container flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Название (RU) *</label>
                  <input
                    type="text"
                    required
                    value={productForm.title_ru}
                    onChange={(e) => setProductForm({ ...productForm, title_ru: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Название (EN)</label>
                  <input
                    type="text"
                    value={productForm.title_en}
                    onChange={(e) => setProductForm({ ...productForm, title_en: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Категория *</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none cursor-pointer"
                  >
                    {categories.filter(c => c.slug !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name_ru} ({c.id})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Бренд</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Цена ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Старая цена ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.old_price}
                    onChange={(e) => setProductForm({ ...productForm, old_price: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Склад (шт) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Скидка (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={productForm.discount_percent}
                    onChange={(e) => setProductForm({ ...productForm, discount_percent: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Ссылка на изображение (URL)</label>
                <input
                  type="url"
                  required
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Размеры (через запятую)</label>
                  <input
                    type="text"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Цвет</label>
                  <input
                    type="text"
                    value={productForm.color}
                    onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Описание (RU)</label>
                <textarea
                  rows={3}
                  value={productForm.description_ru}
                  onChange={(e) => setProductForm({ ...productForm, description_ru: e.target.value })}
                  className="w-full p-3 bg-surface-low rounded-lg text-xs text-on-surface border border-outline-variant/30 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => { setEditingProduct(null); setIsCreatingProduct(false); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-low cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingProduct ? 'Сохранение...' : (editingProduct ? 'Сохранить изменения' : 'Создать товар')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
