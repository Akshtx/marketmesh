export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  sku?: string;
  images?: string[];
  category?: string;
  stock?: number;
}
