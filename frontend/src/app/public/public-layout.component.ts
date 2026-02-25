import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="public-layout">
      <header class="navbar">
        <a routerLink="/" class="logo">Banco</a>
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
          <a routerLink="/products" routerLinkActive="active">Productos</a>
          <a routerLink="/help" routerLinkActive="active">Ayuda</a>
          <a [routerLink]="['/sv/login']" target="_blank" rel="noopener" class="btn-sv">Ingresar a Sucursal Virtual</a>
        </nav>
      </header>
      <main class="main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .public-layout { min-height: 100vh; display: flex; flex-direction: column; }
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      flex-wrap: wrap;
      gap: var(--space-3);
    }
    @media (min-width: 768px) {
      .navbar { padding: var(--space-4) var(--space-6); }
    }
    .logo { font-weight: 700; font-size: 1.25rem; color: var(--color-text); text-decoration: none; }
    .logo:hover { color: var(--color-primary); }
    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .nav-links a {
      color: var(--color-text-muted);
      text-decoration: none;
      font-weight: 500;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      transition: color var(--transition), background var(--transition);
    }
    .nav-links a:hover { color: var(--color-text); background: var(--color-bg); }
    .nav-links a.active { color: var(--color-primary); }
    .btn-sv {
      background: var(--color-primary);
      color: white !important;
      padding: var(--space-2) var(--space-4);
    }
    .btn-sv:hover { background: var(--color-primary-hover); }
    .main { flex: 1; }
  `],
})
export class PublicLayoutComponent {}
