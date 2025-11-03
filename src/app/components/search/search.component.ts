import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ProductService } from '../../services/product.service';
import { Product, SearchResult } from '../../models/product.model';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  products: Product[] = [];
  total: number = 0;
  page: number = 1;
  limit: number = 20;
  totalPages: number = 0;
  loading: boolean = false;
  suggestions: string[] = [];
  activeFilters: string[] = [];

  // Upload properties
  selectedFile: File | null = null;
  uploading: boolean = false;
  uploadProgress: boolean = false;
  uploadMessage: string = '';
  uploadSuccess: boolean = false;
  expandedProductId: string | null = null;

  private searchSubject = new Subject<{ query: string; page: number; limit: number }>();
  private pageChangeSubject = new Subject<{ query: string; page: number; limit: number }>();
  private suggestSubject = new Subject<string>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    const processSearch = (params: { query: string; page: number; limit: number }) => {
      if (!params.query || params.query.trim().length === 0) {
        return of(null);
      }
      this.loading = true;
      return this.productService.search(params.query, params.page, params.limit);
    };

    const handleSearchResult = {
      next: (result: SearchResult | null) => {
        this.loading = false;
        if (result) {
          this.products = result.products;
          this.total = result.total;
          this.totalPages = result.totalPages;
        } else {
          this.products = [];
          this.total = 0;
          this.totalPages = 0;
        }
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Search error:', error);
      }
    };

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) =>
        prev.query === curr.query && prev.page === curr.page && prev.limit === curr.limit
      ),
      switchMap(processSearch)
    ).subscribe(handleSearchResult);

    this.pageChangeSubject.pipe(
      distinctUntilChanged((prev, curr) =>
        prev.query === curr.query && prev.page === curr.page && prev.limit === curr.limit
      ),
      switchMap(processSearch)
    ).subscribe(handleSearchResult);

    this.suggestSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(prefix => {
        if (!prefix || prefix.trim().length < 2) {
          return of([]);
        }
        return this.productService.getSuggestions(prefix);
      })
    ).subscribe({
      next: (suggestions: string[]) => {
        this.suggestions = suggestions;
      },
      error: (error) => {
        console.error('Suggestions error:', error);
        this.suggestions = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
    this.pageChangeSubject.complete();
    this.suggestSubject.complete();
  }

  onSearchInput(): void {
    this.page = 1;
    this.searchSubject.next({ query: this.searchQuery, page: this.page, limit: this.limit });
    this.suggestSubject.next(this.searchQuery);
  }

  onSearch(): void {
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      this.page = 1;
      this.searchSubject.next({ query: this.searchQuery, page: this.page, limit: this.limit });
    }
  }

  onSuggestionClick(suggestion: string): void {
    this.searchQuery = suggestion;
    this.suggestions = [];
    this.onSearch();
  }

  onPageChange(event: PageEvent): void {
    const previousPageSize = this.limit;
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;

    if (previousPageSize !== event.pageSize) {
      this.page = 1;
    }

    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      this.pageChangeSubject.next({ query: this.searchQuery, page: this.page, limit: this.limit });
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.products = [];
    this.total = 0;
    this.totalPages = 0;
    this.suggestions = [];
  }

  removeFilter(filter: string): void {
    this.activeFilters = this.activeFilters.filter(f => f !== filter);
    this.onSearch();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadProgress = false;
      this.uploadMessage = '';
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      return;
    }

    console.log('[FRONTEND] Iniciando carga de archivo:', this.selectedFile.name);
    this.uploading = true;
    this.uploadProgress = true;
    this.uploadMessage = 'Cargando y procesando archivo... (Esto puede tomar varios minutos para archivos grandes)';

    this.productService.uploadCSV(this.selectedFile).subscribe({
      next: (response) => {
        console.log('[FRONTEND] Respuesta recibida del backend:', response);
        this.uploading = false;
        this.uploadProgress = false;
        this.uploadSuccess = true;
        this.uploadMessage = `✓ ${response.message || '¡Archivo cargado exitosamente!'}`;
        this.selectedFile = null;

        setTimeout(() => {
          this.uploadMessage = '';
          this.uploadSuccess = false;
        }, 5000);
      },
      error: (error) => {
        console.error('[FRONTEND] Error recibido:', error);
        this.uploading = false;
        this.uploadProgress = false;
        this.uploadSuccess = false;

        let errorMessage = 'Error al cargar el archivo';
        if (error.status === 0) {
          errorMessage = 'Error de conexión. El servidor puede estar procesando el archivo todavía.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.uploadMessage = `✗ Error: ${errorMessage}`;
        console.error('Upload error details:', error);
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  toggleProductDetails(productId: string): void {
    if (this.expandedProductId === productId) {
      this.expandedProductId = null;
    } else {
      this.expandedProductId = productId;
    }
  }

  isProductExpanded(productId: string): boolean {
    return this.expandedProductId === productId;
  }
}
