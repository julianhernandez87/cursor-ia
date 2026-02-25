import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Su banco, donde y cuando lo necesite</h1>
        <p class="hero-subtitle">Cuentas, tarjetas y préstamos con la seguridad y el respaldo que usted merece.</p>
        <a [routerLink]="['/sv/login']" target="_blank" rel="noopener" class="hero-cta">Ingresar a Sucursal Virtual</a>
      </div>
    </section>
    <section class="products-section">
      <h2 class="section-title">Nuestros productos</h2>
      <div class="products-grid">
        @for (p of products; track p.id) {
          <div class="product-card">
            <h3 class="product-title">{{ p.title }}</h3>
            <p class="product-desc">{{ p.description }}</p>
          </div>
        }
      </div>
    </section>
    <section class="security-section">
      <h2 class="section-title">Seguridad</h2>
      <div class="security-content">
        <p>Protegemos sus datos con cifrado y buenas prácticas. Acceda a la Sucursal Virtual con total tranquilidad.</p>
      </div>
    </section>
    <footer class="footer">
      <p>&copy; {{ year }} Banco. Todos los derechos reservados.</p>
    </footer>
  `,
  styles: [`
    .hero {
      padding: var(--space-5) var(--space-4);
      text-align: center;
      background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%);
      border-bottom: 1px solid var(--color-border);
    }
    @media (min-width: 640px) {
      .hero { padding: var(--space-6) var(--space-5); }
    }
    .hero-title { font-size: clamp(1.5rem, 4vw, 2.25rem); margin: 0 0 var(--space-3); color: var(--color-text); }
    .hero-subtitle { color: var(--color-text-muted); margin: 0 0 var(--space-5); max-width: 560px; margin-left: auto; margin-right: auto; }
    .hero-cta {
      display: inline-block;
      padding: var(--space-3) var(--space-5);
      background: var(--color-primary);
      color: white;
      text-decoration: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      transition: background var(--transition);
    }
    .hero-cta:hover { background: var(--color-primary-hover); }
    .products-section, .security-section {
      padding: var(--space-5) var(--space-4);
      max-width: 960px;
      margin: 0 auto;
    }
    @media (min-width: 640px) {
      .products-section, .security-section { padding: var(--space-6) var(--space-5); }
    }
    .section-title { font-size: 1.5rem; margin: 0 0 var(--space-5); color: var(--color-text); }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-4);
    }
    .product-card {
      padding: var(--space-5);
      background: var(--color-surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border);
    }
    .product-title { font-size: 1.1rem; margin: 0 0 var(--space-2); color: var(--color-text); }
    .product-desc { margin: 0; color: var(--color-text-muted); font-size: 0.95rem; }
    .security-content { color: var(--color-text-muted); }
    .footer {
      padding: var(--space-5);
      text-align: center;
      border-top: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }
  `],
})
export class LandingComponent {
  private productsService = inject(ProductsService);
  products = this.productsService.getProducts();
  year = new Date().getFullYear();
}
