import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order as OrderModel } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class Order {
  private apiUrl = 'http://localhost:3001/api/orders';

  constructor(private http: HttpClient) { }

  createOrder(order: OrderModel): Observable<OrderModel> {
    return this.http.post<OrderModel>(this.apiUrl, order);
  }

  getUserOrders(): Observable<OrderModel[]> {
    return this.http.get<OrderModel[]>(`${this.apiUrl}/user`);
  }

  getOrder(id: string): Observable<OrderModel> {
    return this.http.get<OrderModel>(`${this.apiUrl}/${id}`);
  }
}

