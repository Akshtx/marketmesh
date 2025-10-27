import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Promo } from '../../services/promo';
import { Promo as PromoModel } from '../../models/promo.model';

@Component({
  selector: 'app-offers',
  imports: [CommonModule],
  templateUrl: './offers.html',
  styleUrl: './offers.css',
  standalone: true
})
export class Offers implements OnInit {
  promos: PromoModel[] = [];
  copiedCode: string | null = null;

  constructor(private promoService: Promo) {}

  ngOnInit(): void {
    // Load from service (includes demo codes)
    this.promos = this.promoService.getDemoPromos();
    
    // Also try to fetch from backend
    this.promoService.getActivePromos().subscribe({
      next: (backendPromos) => {
        if (backendPromos.length > 0) {
          this.promos = backendPromos;
        }
      },
      error: () => {
        // Fallback to demo codes already loaded
        console.log('Using demo promo codes');
      }
    });
  }

  copyToClipboard(code: string): void {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        this.copiedCode = code;
        setTimeout(() => {
          this.copiedCode = null;
        }, 2000);
      }).catch((err) => {
        console.error('Clipboard write failed:', err);
        this.fallbackCopy(code);
      });
    } else {
      // Fallback for older browsers or non-secure contexts
      this.fallbackCopy(code);
    }
  }

  private fallbackCopy(code: string): void {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        this.copiedCode = code;
        setTimeout(() => {
          this.copiedCode = null;
        }, 2000);
      } else {
        alert(`Please manually copy this code: ${code}`);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      alert(`Please manually copy this code: ${code}`);
    }
  }

  getExpiryText(daysLeft: number | undefined): string {
    if (!daysLeft) return 'Limited time offer';
    if (daysLeft <= 0) return 'Expires today!';
    if (daysLeft === 1) return 'Expires tomorrow!';
    return `Expires in ${daysLeft} days`;
  }
}

