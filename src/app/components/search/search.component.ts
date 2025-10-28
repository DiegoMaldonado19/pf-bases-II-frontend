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
    MatIconModule
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

  private searchSubject = new Subject<string>();
  private suggestSubject = new Subject<string>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length === 0) {
          return of(null);
        }
        this.loading = true;
        return this.productService.search(query, this.page, this.limit);
      })
    ).subscribe({
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
      error: (error) => {
        this.loading = false;
        console.error('Search error:', error);
      }
    });

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
    this.suggestSubject.complete();
  }

  onSearchInput(): void {
    this.page = 1;
    this.searchSubject.next(this.searchQuery);
    this.suggestSubject.next(this.searchQuery);
  }

  onSearch(): void {
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      this.page = 1;
      this.searchSubject.next(this.searchQuery);
    }
  }

  onSuggestionClick(suggestion: string): void {
    this.searchQuery = suggestion;
    this.suggestions = [];
    this.onSearch();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.searchSubject.next(this.searchQuery);
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
}
