import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart as CartModel, CartItem } from '../models/cart.model';
import { Product as ProductModel } from '../models/product.model';
import { PromoCode } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class Cart {
  private cartSubject = new BehaviorSubject<CartModel>({});
  public cart$ = this.cartSubject.asObservable();

  private appliedPromoSubject = new BehaviorSubject<PromoCode | null>(null);
  public appliedPromo$ = this.appliedPromoSubject.asObservable();

  constructor() { }

  addToCart(product: ProductModel, qty: number = 1): void {
    const currentCart = this.cartSubject.value;
    const productId = product._id;

    if (currentCart[productId]) {
      currentCart[productId].qty += qty;
    } else {
      currentCart[productId] = { product, qty };
    }

    this.cartSubject.next({ ...currentCart });
  }

  removeFromCart(productId: string): void {
    const currentCart = this.cartSubject.value;
    delete currentCart[productId];
    this.cartSubject.next({ ...currentCart });
  }

  updateQuantity(productId: string, qty: number): void {
    const currentCart = this.cartSubject.value;
    if (currentCart[productId]) {
      if (qty <= 0) {
        delete currentCart[productId];
      } else {
        currentCart[productId].qty = qty;
      }
      this.cartSubject.next({ ...currentCart });
    }
  }

  incrementQuantity(productId: string): void {
    const currentCart = this.cartSubject.value;
    if (currentCart[productId]) {
      currentCart[productId].qty++;
      this.cartSubject.next({ ...currentCart });
    }
  }

  decrementQuantity(productId: string): void {
    const currentCart = this.cartSubject.value;
    if (currentCart[productId]) {
      currentCart[productId].qty--;
      if (currentCart[productId].qty <= 0) {
        delete currentCart[productId];
      }
      this.cartSubject.next({ ...currentCart });
    }
  }

  getCart(): CartModel {
    return this.cartSubject.value;
  }

  getCartItems(): CartItem[] {
    return Object.values(this.cartSubject.value);
  }

  getCartCount(): number {
    return Object.values(this.cartSubject.value).reduce((sum, item) => sum + item.qty, 0);
  }

  clearCart(): void {
    this.cartSubject.next({});
    this.appliedPromoSubject.next(null);
  }

  applyPromo(promo: PromoCode): void {
    this.appliedPromoSubject.next(promo);
  }

  removePromo(): void {
    this.appliedPromoSubject.next(null);
  }

  getAppliedPromo(): PromoCode | null {
    return this.appliedPromoSubject.value;
  }

  calculateTotal(): { subtotal: number; discount: number; total: number } {
    const items = this.getCartItems();
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    
    const promo = this.appliedPromoSubject.value;
    const discount = promo ? (subtotal * promo.discountPercent) / 100 : 0;
    const total = subtotal - discount;

    return { subtotal, discount, total };
  }
}

