import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/card/card.component';
import { SvProductsService } from '../services/products.service';

@Component({
  selector: 'app-sv-productos',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="productos-page">
      <h1 class="page-title">Productos</h1>

      <section class="productos-section">
        <h2 class="section-title">Cuentas de ahorro</h2>
        <div class="cards-grid">
          @for (acc of savingsAccounts; track acc.id) {
            <app-card class="product-card">
              <h3 class="product-name">{{ acc.name }}</h3>
              <p class="product-number">{{ acc.accountNumber }}</p>
              <p class="product-balance">{{ acc.balance | currency: acc.currency : 'symbol' : '1.2-2' }}</p>
            </app-card>
          }
        </div>
      </section>

      <section class="productos-section">
        <h2 class="section-title">Tarjetas de crédito</h2>
        <div class="cards-grid">
          @for (card of creditCards; track card.id) {
            <app-card class="product-card credit">
              <h3 class="product-name">{{ card.brand }} ****{{ card.lastFourDigits }}</h3>
              <p class="product-consumption">Consumo: {{ card.consumption | currency: card.currency : 'symbol' : '1.2-2' }} / {{ card.limit | currency: card.currency : 'symbol' : '1.2-2' }}</p>
              <div class="card-bar">
                <span class="card-bar-fill" [style.width.%]="(card.consumption / card.limit) * 100"></span>
              </div>
            </app-card>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .productos-page { max-width: 1200px; margin: 0 auto; }
    .page-title { font-size: 1.5rem; margin: 0 0 var(--space-5); color: var(--color-text); }
    .productos-section { margin-bottom: var(--space-6); }
    .section-title { font-size: 1.15rem; margin: 0 0 var(--space-4); color: var(--color-text); }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-4); align-items: stretch; }
    .product-card { min-height: 0; }
    .product-name { font-size: 1rem; margin: 0 0 var(--space-2); color: var(--color-text); }
    .product-number, .product-consumption { margin: 0 0 var(--space-2); color: var(--color-text-muted); font-size: 0.9rem; }
    .product-balance { margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--color-text); }
    .card-bar { height: 6px; background: var(--color-border); border-radius: 3px; overflow: hidden; margin-top: var(--space-2); }
    .card-bar-fill { display: block; height: 100%; background: var(--color-primary); border-radius: 3px; transition: width var(--transition); }
  `],
})
export class ProductosComponent {
  private products = inject(SvProductsService);
  savingsAccounts = this.products.getSavingsAccounts();
  creditCards = this.products.getCreditCards();
}
