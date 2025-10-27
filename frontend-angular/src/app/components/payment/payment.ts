import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Order as OrderModel } from '../../models/order.model';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
  standalone: true
})
export class Payment implements OnInit {
  order: OrderModel | null = null;
  address = '';
  paymentMethod: 'UPI' | 'Card' | 'COD' | '' = '';
  
  // Payment method specific fields
  upiId = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  
  showPaymentFields = false;
  paymentComplete = false;
  
  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load order from session storage
    const orderStr = sessionStorage.getItem('lastOrder');
    if (orderStr) {
      try {
        this.order = JSON.parse(orderStr);
      } catch (e) {
        console.error('Error parsing order:', e);
      }
    }
    
    if (!this.order) {
      alert('No order found. Please place an order first.');
      this.router.navigate(['/shop']);
    }
  }

  onPaymentMethodChange(): void {
    this.showPaymentFields = !!this.paymentMethod;
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  validatePayment(): boolean {
    if (!this.address.trim()) {
      alert('Please enter delivery address');
      return false;
    }

    if (!this.paymentMethod) {
      alert('Please select a payment method');
      return false;
    }

    if (this.paymentMethod === 'UPI') {
      if (!this.upiId || !/^[\w.-]+@[\w.-]+$/.test(this.upiId)) {
        alert('Please enter a valid UPI ID');
        return false;
      }
    } else if (this.paymentMethod === 'Card') {
      if (!this.cardNumber || !/^\d{16}$/.test(this.cardNumber.replace(/\s+/g, ''))) {
        alert('Please enter a valid 16-digit card number');
        return false;
      }
      if (!this.cardExpiry || !/^\d{2}\/\d{2}$/.test(this.cardExpiry)) {
        alert('Please enter expiry in MM/YY format');
        return false;
      }
      if (!this.cardCvv || !/^\d{3,4}$/.test(this.cardCvv)) {
        alert('Please enter a valid CVV');
        return false;
      }
    }

    return true;
  }

  submitPayment(): void {
    if (!this.validatePayment()) return;

    const user = this.authService.getCurrentUser();
    this.paymentComplete = true;

    // Clear order from session
    sessionStorage.removeItem('lastOrder');
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}

