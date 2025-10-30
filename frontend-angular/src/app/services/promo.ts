import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promo as PromoModel, PromoValidationResponse } from '../models/promo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Promo {
  private apiUrl = `${environment.apiUrl}/promos`;

  constructor(private http: HttpClient) { }

  getActivePromos(): Observable<PromoModel[]> {
    return this.http.get<PromoModel[]>(`${this.apiUrl}/active`);
  }

  validatePromo(code: string): Observable<PromoValidationResponse> {
    return this.http.post<PromoValidationResponse>(`${this.apiUrl}/validate`, { code });
  }

  applyPromo(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply`, { code });
  }

  // Demo promo codes
  getDemoPromos(): PromoModel[] {
    return [
      {
        code: 'WELCOME5',
        discountPercent: 5,
        description: 'Welcome offer! Get 5% off on your first purchase',
        daysLeft: 7
      },
      {
        code: 'SAVE10',
        discountPercent: 10,
        description: 'Limited time offer! Save 10% on all products',
        daysLeft: 3
      },
      {
        code: 'FLASH15',
        discountPercent: 15,
        description: 'Flash sale! Get 15% off - Hurry, expires soon!',
        daysLeft: 1
      },
      {
        code: 'MEGA20',
        discountPercent: 20,
        description: 'Mega deal! Save big with 20% discount on electronics',
        daysLeft: 5
      },
      {
        code: 'NEWYEAR25',
        discountPercent: 25,
        description: 'New Year Special! Get 25% off on all categories',
        daysLeft: 10
      },
      {
        code: 'SUPER30',
        discountPercent: 30,
        description: 'Super Saver! Massive 30% discount - Don\'t miss out!',
        daysLeft: 2
      },
      {
        code: 'VIP40',
        discountPercent: 40,
        description: 'VIP Exclusive! Get 40% off on premium products',
        daysLeft: 14
      },
      {
        code: 'FESTIVE50',
        discountPercent: 50,
        description: 'Festive Bonanza! Unbelievable 50% off on selected items',
        daysLeft: 4
      }
    ];
  }
}

