export interface Product {
  _id?: string;
  title: string;
  category: string;
  brand: string;
  product_type: string;
  sku: string;
  price?: number;
  description?: string;
  created_at?: Date;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  performance?: {
    duration: string;
    cached?: boolean;
  };
}
