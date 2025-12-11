export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  images: string[];
  seller: User;
  status: 'pending' | 'approved' | 'rejected';
  views?: number;
  badges?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

