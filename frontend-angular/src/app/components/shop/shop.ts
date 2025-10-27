import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/product';
import { Cart } from '../../services/cart';
import { Product as ProductModel } from '../../models/product.model';

@Component({
  selector: 'app-shop',
  imports: [CommonModule],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
  standalone: true
})
export class Shop implements OnInit {
  products: ProductModel[] = [];
  loading = true;
  error = '';

  constructor(
    private productService: Product,
    private cartService: Cart
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        console.log('Products loaded:', this.products.length);
        console.log('First product image path:', products[0]?.images?.[0]);
      },
      error: (err) => {
        this.error = 'Failed to load products. Please make sure the backend is running on port 3001.';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  addToCart(product: ProductModel): void {
    this.cartService.addToCart(product, 1);
    alert(`Added to cart: ${product.title} - ₹${product.price}`);
  }

  getImageUrl(product: ProductModel): string {
    if (product.images && product.images[0]) {
      return product.images[0];
    }
    return '';
  }
}

