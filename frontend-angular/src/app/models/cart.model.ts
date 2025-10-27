import { Product } from './product.model';

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Cart {
  [productId: string]: CartItem;
}
