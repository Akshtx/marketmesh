import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { Order } from '../../services/order';
import { User } from '../../models/user.model';
import { Order as OrderModel } from '../../models/order.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true
})
export class Profile implements OnInit {
  user: User | null = null;
  phone = '';
  address = '';
  saveMessage = '';
  saveMessageType: 'success' | 'error' | '' = '';
  
  orders: OrderModel[] = [];
  loadingOrders = true;
  ordersError = '';

  constructor(
    private authService: Auth,
    private orderService: Order,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.user = user;
      this.phone = user.phone || '';
      this.address = user.address || '';
    });

    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loadingOrders = false;
      },
      error: (err) => {
        this.ordersError = 'Failed to load orders';
        this.loadingOrders = false;
        console.error('Error loading orders:', err);
      }
    });
  }

  saveProfile(): void {
    this.saveMessage = 'Saving...';
    this.saveMessageType = '';

    this.authService.updateUser({ phone: this.phone, address: this.address }).subscribe({
      next: () => {
        this.saveMessage = '✓ Profile updated successfully!';
        this.saveMessageType = 'success';
        
        setTimeout(() => {
          this.saveMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.saveMessage = 'Failed to save profile';
        this.saveMessageType = 'error';
        console.error('Error saving profile:', err);
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  getMemberSince(): string {
    return this.formatDate(this.user?.createdAt);
  }
}

