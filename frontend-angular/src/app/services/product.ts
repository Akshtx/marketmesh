import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product as ProductModel } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class Product {
  private apiUrl = 'http://localhost:3001/api/products';

  constructor(private http: HttpClient) { }

  private transformImagePaths(product: ProductModel): ProductModel {
    return {
      ...product,
      images: product.images?.map(img => 
        img.startsWith('images/') ? `assets/${img}` : img
      ) || []
    };
  }

  getProducts(): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(this.apiUrl).pipe(
      map(products => products.map(p => this.transformImagePaths(p)))
    );
  }

  getProduct(id: string): Observable<ProductModel> {
    return this.http.get<ProductModel>(`${this.apiUrl}/${id}`).pipe(
      map(product => this.transformImagePaths(product))
    );
  }
}

