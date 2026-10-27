export interface Product {
  id: string;
  category_id: string;
  title_ru: string;
  title_en: string;
  description_ru: string;
  description_en: string;
  price: number;
  old_price: number | null;
  rating_count: number;
  rating_score: number;
  brand: string;
  image_url: string;
  color: string;
  sizes: string;
  stock: number;
  is_bestseller: number | boolean;
  discount_percent: number;
}

export interface Category {
  id: string;
  slug: string;
  name_ru: string;
  name_en: string;
  sort_order: number;
  count?: number;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  brand: string;
  size: string;
  color: string;
  quantity: number;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  size: string;
  color: string;
  price?: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  created_at: string;
  items?: {
    id: string;
    product_id: string;
    product_title?: string;
    quantity: number;
    unit_price: number;
    size: string;
    color: string;
  }[];
}

export interface AdminMetrics {
  revenue: number;
  ordersCount: number;
  averageCheck: number;
  deliveredOrders: number;
  recentOrdersCount: number;
}
