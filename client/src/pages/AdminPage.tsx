import React, { useState, useEffect } from 'react';
import { AdminMetrics, Order } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const AdminPage: React.FC = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [m, o] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminOrders()
      ]);
      setMetrics(m);
      setOrders(o);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-container">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">
            {t('admin.title')}
          </h1>
          <p className="text-xs text-on-surface-variant">
            Live-аналитика заказов и управление магазином в реальном времени
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-3.5 py-2 bg-surface-low hover:bg-surface-container rounded-lg text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Обновить данные
        </button>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-outline-variant/30 space-y-2">
            <span className="text-xs font-semibold text-on-surface-variant">{t('admin.revenue')}</span>
            <div className="font-display font-bold text-2xl text-primary">
              ${metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">↑ Выручка из SQLite</p>
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
            <p className="text-[11px] text-amber-600 font-medium">Средний чек покупателя</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-outline-variant/30 space-y-2">
            <span className="text-xs font-semibold text-on-surface-variant">{t('admin.delivered')}</span>
            <div className="font-display font-bold text-2xl text-emerald-700">
              {metrics.deliveredOrders}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Успешно доставлено</p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="p-5 border-b border-surface-container flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-on-surface">
            {t('admin.tableTitle')} ({orders.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            Загрузка таблицы заказов...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            Заказов пока нет
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-low text-on-surface-variant font-semibold border-b border-surface-container">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">{t('admin.customer')}</th>
                  <th className="py-3 px-4">{t('admin.amount')}</th>
                  <th className="py-3 px-4">{t('admin.status')}</th>
                  <th className="py-3 px-4">{t('admin.date')}</th>
                  <th className="py-3 px-4 text-right">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-on-surface">{order.customer_name}</div>
                      <div className="text-[11px] text-on-surface-variant">{order.customer_email} • {order.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface">
                      ${Number(order.total_amount).toFixed(2)}
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
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
