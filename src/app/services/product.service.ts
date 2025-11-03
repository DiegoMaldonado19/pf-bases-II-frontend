import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product, SearchResult, ApiResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  search(query: string, page: number = 1, limit: number = 20): Observable<SearchResult> {
    let params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<SearchResult>>(`${this.apiUrl}/search`, { params })
      .pipe(
        map(response => response.data!)
      );
  }

  getSuggestions(prefix: string, limit: number = 10): Observable<string[]> {
    let params = new HttpParams()
      .set('q', prefix)
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<{ suggestions: string[] }>>(`${this.apiUrl}/suggest`, { params })
      .pipe(
        map(response => response.data?.suggestions || [])
      );
  }

  loadData(): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/index/load`, {});
  }

  getStats(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/index/stats`);
  }

  uploadCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/upload/csv`, formData, {
      reportProgress: true,
      observe: 'body',
    });
  }
}
