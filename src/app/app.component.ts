import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>inventory_2</mat-icon>
      <span class="toolbar-title">Products Indexing System</span>
      <span class="spacer"></span>
      <span class="subtitle">MongoDB + Redis + Angular</span>
    </mat-toolbar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .toolbar-title {
      margin-left: 10px;
      font-size: 20px;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .subtitle {
      font-size: 14px;
      opacity: 0.9;
    }

    main {
      padding-top: 20px;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }
  `]
})
export class AppComponent {}
