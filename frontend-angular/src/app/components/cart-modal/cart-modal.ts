import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cart } from '../../services/cart';
import { Auth } from '../../services/auth';
import { Order } from '../../services/order';
import { Promo } from '../../services/promo';
import { CartItem } from '../../models/cart.model';
import { PromoCode } from '../../models/order.model';

@Component({
  selector: 'app-cart-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.css',
  standalone: true
})
export class CartModal implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  cartItems: CartItem[] = [];
  appliedPromo: PromoCode | null = null;
  promoCodeInput = '';
  promoMessage = '';
  promoMessageType: 'success' | 'error' | '' = '';
  showPromoInput = true;

  subtotal = 0;
  discount = 0;
  total = 0;

  constructor(
    private cartService: Cart,
    private authService: Auth,
    private orderService: Order,
    private promoService: Promo,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.cart$.subscribe(() => {
      this.cartItems = this.cartService.getCartItems();
      this.calculateTotals();
    });

    this.cartService.appliedPromo$.subscribe(promo => {
      this.appliedPromo = promo;
      this.showPromoInput = !promo;
      this.calculateTotals();
    });
  }

  calculateTotals(): void {
    const totals = this.cartService.calculateTotal();
    this.subtotal = totals.subtotal;
    this.discount = totals.discount;
    this.total = totals.total;
  }

  incrementQty(productId: string): void {
    this.cartService.incrementQuantity(productId);
  }

  decrementQty(productId: string): void {
    this.cartService.decrementQuantity(productId);
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  applyPromoCode(): void {
    const code = this.promoCodeInput.trim().toUpperCase();
    
    if (!code) {
      this.promoMessage = 'Please enter a promo code';
      this.promoMessageType = 'error';
      return;
    }

    this.promoMessage = 'Validating...';
    this.promoMessageType = '';

    // Demo promo codes for immediate validation
    const demoCodes: { [key: string]: PromoCode } = {
      'WELCOME5': { code: 'WELCOME5', discountPercent: 5 },
      'SAVE10': { code: 'SAVE10', discountPercent: 10 },
      'FLASH15': { code: 'FLASH15', discountPercent: 15 },
      'MEGA20': { code: 'MEGA20', discountPercent: 20 },
      'NEWYEAR25': { code: 'NEWYEAR25', discountPercent: 25 },
      'SUPER30': { code: 'SUPER30', discountPercent: 30 },
      'VIP40': { code: 'VIP40', discountPercent: 40 },
      'FESTIVE50': { code: 'FESTIVE50', discountPercent: 50 }
    };

    if (demoCodes[code]) {
      const promo = demoCodes[code];
      this.cartService.applyPromo(promo);
      this.promoMessage = `✅ ${promo.discountPercent}% discount applied!`;
      this.promoMessageType = 'success';
      return;
    }

    // Try backend validation
    this.promoService.validatePromo(code).subscribe({
      next: (response) => {
        if (response.valid) {
          this.cartService.applyPromo({
            code: response.code,
            discountPercent: response.discountPercent
          });
          this.promoMessage = `✅ ${response.discountPercent}% discount applied!`;
          this.promoMessageType = 'success';
        } else {
          this.promoMessage = 'Invalid promo code. Try: WELCOME5, SAVE10, FLASH15, MEGA20, NEWYEAR25, SUPER30, VIP40, or FESTIVE50';
          this.promoMessageType = 'error';
        }
      },
      error: () => {
        this.promoMessage = 'Invalid promo code. Try: WELCOME5, SAVE10, FLASH15, MEGA20, NEWYEAR25, SUPER30, VIP40, or FESTIVE50';
        this.promoMessageType = 'error';
      }
    });
  }

  removePromoCode(): void {
    this.cartService.removePromo();
    this.promoCodeInput = '';
    this.promoMessage = '';
    this.promoMessageType = '';
  }

  closeModal(): void {
    this.close.emit();
  }

  placeOrder(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Please login to place an order');
      this.closeModal();
      this.router.navigate(['/login']);
      return;
    }

    if (this.cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const items = this.cartItems.map(ci => ({
      product: ci.product._id,
      title: ci.product.title,
      sku: ci.product.sku || '',
      qty: ci.qty,
      unitPrice: ci.product.price,
      totalPrice: ci.product.price * ci.qty
    }));

    const order = {
      user: user.id,
      items,
      subtotal: this.subtotal,
      shipping: 0,
      taxes: 0,
      discount: this.discount,
      promoCode: this.appliedPromo || undefined,
      total: this.total
    };

    this.orderService.createOrder(order).subscribe({
      next: (createdOrder) => {
        // Mark promo as used if applied
        if (this.appliedPromo) {
          this.promoService.applyPromo(this.appliedPromo.code).subscribe();
        }

        // Store order details for payment page
        sessionStorage.setItem('lastOrder', JSON.stringify(createdOrder));
        
        // Clear cart
        this.cartService.clearCart();
        
        // Close modal and navigate to payment
        this.closeModal();
        this.router.navigate(['/payment']);
        
        alert('Order placed successfully!');
      },
      error: (err) => {
        alert('Failed to place order: ' + (err.error?.msg || 'Please try again'));
      }
    });
  }

  browsePromos(): void {
    this.closeModal();
    this.router.navigate(['/offers']);
  }
}

