export interface OrderItem {
  product: string;
  title: string;
  sku: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id?: string;
  user: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  taxes: number;
  discount: number;
  promoCode?: PromoCode;
  total: number;
  status?: string;
  createdAt?: string;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
}
