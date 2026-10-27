import React, { createContext, useContext, useState } from 'react';

type Lang = 'ru' | 'en';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  ru: {
    'nav.apparel': 'Одежда',
    'nav.living': 'Дом и интерьер',
    'nav.footwear': 'Обувь',
    'nav.accessories': 'Аксессуары',
    'nav.sale': 'Распродажа',
    'nav.search': 'Поиск эко-коллекций, товаров...',
    'nav.cart': 'Корзина',
    'nav.account': 'Личный кабинет',
    'nav.wishlist': 'Избранное',
    'hero.badge': 'НОВАЯ КОЛЛЕКЦИЯ • ВЫП. 08',
    'hero.title': 'Осенняя база и лаконичный интерьер',
    'hero.desc': 'Гардеробная классика и модульные предметы интерьера. Проверенное происхождение материалов, ноль синтетических волокон и безупречная точность кроя.',
    'hero.selected': 'отобранных товаров',
    'hero.rating': 'ср. оценка магазина',
    'filters.title': 'Фильтры',
    'filters.reset': 'Сбросить все',
    'filters.categories': 'КАТЕГОРИИ',
    'filters.all': 'Все товары',
    'filters.price': 'ЦЕНОВОЙ ДИАПАЗОН',
    'filters.from': 'от $20',
    'filters.to': 'до',
    'filters.standards': 'Стандарты качества',
    'filters.ratingUp': '4.0 и выше',
    'sort.label': 'Сортировка:',
    'sort.popular': 'По популярности',
    'sort.new': 'По новизне',
    'sort.cheap': 'Сначала дешевле',
    'sort.expensive': 'Сначала дороже',
    'sort.rating': 'По рейтингу',
    'product.add': 'В корзину',
    'product.added': 'Добавлено!',
    'product.bestseller': 'ХИТ',
    'product.discount': 'СКИДКА',
    'product.empty': 'Товары не найдены',
    'product.emptyDesc': 'Попробуйте изменить параметры поиска или сбросить фильтры.',
    'checkout.title': 'Оформление заказа',
    'checkout.back': 'Вернуться в каталог',
    'checkout.cart': 'Ваша корзина',
    'checkout.cartEmpty': 'Ваша корзина пуста',
    'checkout.delivery': 'Адрес доставки',
    'checkout.name': 'Имя и фамилия',
    'checkout.email': 'Email',
    'checkout.phone': 'Номер телефона',
    'checkout.address': 'Полный адрес доставки',
    'checkout.payment': 'Способ оплаты',
    'checkout.card': 'Банковская карта онлайн',
    'checkout.sbp': 'СБП (Система быстрых платежей)',
    'checkout.cash': 'Оплата при получении',
    'checkout.summary': 'Итого к оплате',
    'checkout.subtotal': 'Стоимость товаров',
    'checkout.shipping': 'Доставка',
    'checkout.free': 'Бесплатно',
    'checkout.total': 'Итого',
    'checkout.submit': 'Подтвердить заказ',
    'checkout.processing': 'Оформляем заказ...',
    'checkout.successTitle': 'Заказ успешно оформлен!',
    'checkout.successDesc': 'Номер вашего заказа: ',
    'admin.title': 'Панель управления магазином',
    'admin.revenue': 'Общая выручка',
    'admin.orders': 'Количество заказов',
    'admin.avgCheck': 'Средний чек',
    'admin.delivered': 'Доставлено заказов',
    'admin.tableTitle': 'Последние заказы',
    'admin.customer': 'Покупатель',
    'admin.amount': 'Сумма',
    'admin.status': 'Статус',
    'admin.date': 'Дата',
    'admin.actions': 'Действия',
  },
  en: {
    'nav.apparel': 'Apparel',
    'nav.living': 'Living & Home',
    'nav.footwear': 'Footwear',
    'nav.accessories': 'Accessories',
    'nav.sale': 'Archive Sale',
    'nav.search': 'Search eco collections, goods...',
    'nav.cart': 'Bag',
    'nav.account': 'Account',
    'nav.wishlist': 'Wishlist',
    'hero.badge': 'NEW COLLECTION • ISSUE 08',
    'hero.title': 'Autumn Essentials & Minimal Interior',
    'hero.desc': 'Wardrobe classics and modular interior essentials. Traceable raw materials, zero synthetic fibers, and timeless tailoring.',
    'hero.selected': 'curated products',
    'hero.rating': 'avg store rating',
    'filters.title': 'Filters',
    'filters.reset': 'Reset all',
    'filters.categories': 'CATEGORIES',
    'filters.all': 'All Products',
    'filters.price': 'PRICE RANGE',
    'filters.from': 'from $20',
    'filters.to': 'up to',
    'filters.standards': 'Quality Standards',
    'filters.ratingUp': '4.0 & above',
    'sort.label': 'Sort by:',
    'sort.popular': 'Most popular',
    'sort.new': 'Newest first',
    'sort.cheap': 'Price: Low to High',
    'sort.expensive': 'Price: High to Low',
    'sort.rating': 'Highest rated',
    'product.add': 'Add to Bag',
    'product.added': 'Added!',
    'product.bestseller': 'BESTSELLER',
    'product.discount': 'OFF',
    'product.empty': 'No products found',
    'product.emptyDesc': 'Try adjusting your filters or search terms.',
    'checkout.title': 'Checkout',
    'checkout.back': 'Back to Catalog',
    'checkout.cart': 'Shopping Bag',
    'checkout.cartEmpty': 'Your shopping bag is empty',
    'checkout.delivery': 'Shipping Information',
    'checkout.name': 'Full Name',
    'checkout.email': 'Email Address',
    'checkout.phone': 'Phone Number',
    'checkout.address': 'Street Address',
    'checkout.payment': 'Payment Method',
    'checkout.card': 'Credit / Debit Card',
    'checkout.sbp': 'Instant Bank Transfer',
    'checkout.cash': 'Cash on Delivery',
    'checkout.summary': 'Order Summary',
    'checkout.subtotal': 'Subtotal',
    'checkout.shipping': 'Shipping',
    'checkout.free': 'Free',
    'checkout.total': 'Total',
    'checkout.submit': 'Place Order',
    'checkout.processing': 'Placing order...',
    'checkout.successTitle': 'Order Placed Successfully!',
    'checkout.successDesc': 'Your order number is: ',
    'admin.title': 'Merchant Dashboard',
    'admin.revenue': 'Total Revenue',
    'admin.orders': 'Total Orders',
    'admin.avgCheck': 'Avg. Order Value',
    'admin.delivered': 'Delivered Orders',
    'admin.tableTitle': 'Recent Orders',
    'admin.customer': 'Customer',
    'admin.amount': 'Amount',
    'admin.status': 'Status',
    'admin.date': 'Date',
    'admin.actions': 'Actions',
  }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>('ru');

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
