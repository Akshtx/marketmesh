import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { CartModal } from './components/cart-modal/cart-modal';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Navbar, CartModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App implements OnInit {
  title = 'MarketMesh';
  showCartModal = false;

  ngOnInit(): void {
    // Listen for cart open events
    window.addEventListener('openCart', () => {
      this.showCartModal = true;
    });
  }

  @HostListener('window:openCart')
  openCart(): void {
    this.showCartModal = true;
  }

  closeCart(): void {
    this.showCartModal = false;
  }
}


