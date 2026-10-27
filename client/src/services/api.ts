import { Product, Category, Order, AdminMetrics } from '../types';

const API_BASE = '/api';

export const api = {
  async getProducts(params?: { category?: string; search?: string; maxPrice?: number; sort?: string }): Promise<{ products: Product[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params?.sort) searchParams.set('sort', params.sort);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await fetch(`${API_BASE}/products${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch products`);
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch categories`);
    return res.json();
  },

  async createOrder(orderData: {
    customer: { name: string; email: string; phone: string; address: string };
    items: { productId: string; quantity: number; size: string; color: string }[];
    paymentMethod: string;
  }): Promise<{ success: boolean; orderId: string; totalAmount: number }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}: Order creation failed`);
    }
    return res.json();
  },

  async getAdminMetrics(): Promise<AdminMetrics> {
    const res = await fetch(`${API_BASE}/admin/metrics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch admin metrics`);
    return res.json();
  },

  async getAdminOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/admin/orders`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch admin orders`);
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update order status`);
    return res.json();
  }
};
