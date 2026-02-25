import { Component, inject } from '@angular/core';
import { ProductsService } from '../../core/services/products.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page products-page">
      <h1 class="page-title">Productos</h1>
      <div class="products-list">
        @for (p of products; track p.id) {
          <div class="product-item">
            <h2 class="product-item-title">{{ p.title }}</h2>
            <p class="product-item-desc">{{ p.description }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: var(--space-6) var(--space-5); max-width: 800px; margin: 0 auto; }
    .page-title { font-size: 1.75rem; margin: 0 0 var(--space-5); color: var(--color-text); }
    .products-list { display: flex; flex-direction: column; gap: var(--space-4); }
    .product-item {
      padding: var(--space-5);
      background: var(--color-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }
    .product-item-title { font-size: 1.15rem; margin: 0 0 var(--space-2); color: var(--color-text); }
    .product-item-desc { margin: 0; color: var(--color-text-muted); }
  `],
})
export class ProductsComponent {
  private productsService = inject(ProductsService);
  products = this.productsService.getProducts();
}
