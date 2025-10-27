import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { Cart } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true
})
export class Navbar implements OnInit {
  isAuthenticated = false;
  cartCount = 0;

  constructor(public authService: Auth, private cartService: Cart) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });

    this.cartService.cart$.subscribe(() => {
      this.cartCount = this.cartService.getCartCount();
    });
  }

  logout(): void {
    this.authService.logout();
  }

  openCart(): void {
    // Cart modal will be handled by a service or event emitter
    window.dispatchEvent(new CustomEvent('openCart'));
  }
}

