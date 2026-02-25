import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sv-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="sv-layout">
      <aside class="sv-sidebar">
        <div class="sv-sidebar-brand">
          <span class="sv-sidebar-logo">SV</span>
          <span class="sv-sidebar-name">Sucursal Virtual</span>
        </div>
        <nav class="sv-sidebar-nav">
          <a routerLink="/sv/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="sv-nav-item">
            <span class="sv-nav-icon">⌂</span>
            <span>Home</span>
          </a>
          <a routerLink="/sv/productos" routerLinkActive="active" class="sv-nav-item">
            <span class="sv-nav-icon">🛒</span>
            <span>Productos</span>
          </a>
          <a routerLink="/sv/pagos" routerLinkActive="active" class="sv-nav-item">
            <span class="sv-nav-icon">$</span>
            <span>Pagos</span>
          </a>
          <a routerLink="/sv/transferencias" routerLinkActive="active" class="sv-nav-item">
            <span class="sv-nav-icon">⇄</span>
            <span>Transferencias</span>
          </a>
          <a routerLink="/sv/documentos" routerLinkActive="active" class="sv-nav-item">
            <span class="sv-nav-icon">📄</span>
            <span>Documentos</span>
          </a>
          <a routerLink="/sv/finanzas" routerLinkActive="active" class="sv-nav-item">
            <span class="sv-nav-icon">📊</span>
            <span>Finanzas</span>
          </a>
        </nav>
        <div class="sv-sidebar-footer">
          <button type="button" class="sv-nav-item sv-mas-opciones">Más opciones</button>
        </div>
      </aside>
      <div class="sv-body">
        <header class="sv-header">
          <span class="sv-header-greeting">Hola Bienvenido {{ email ?? 'Usuario' }}, BUEN DIA</span>
          <div class="sv-header-actions">
            <span class="sv-header-action">Alertas</span>
            <span class="sv-header-action">Tamaño letra</span>
            <span class="sv-header-action">Configuraciones</span>
            <button type="button" class="sv-header-logout" (click)="logout()">Salida Segura</button>
          </div>
        </header>
        <main class="sv-main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .sv-layout {
      min-height: 100vh;
      display: flex;
      background: var(--color-bg);
    }
    .sv-sidebar {
      width: 240px;
      min-width: 240px;
      background: var(--color-sidebar-bg);
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-md);
    }
    .sv-sidebar-brand {
      padding: var(--space-5);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .sv-sidebar-logo {
      width: 36px;
      height: 36px;
      background: var(--color-sidebar-active);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 0.875rem;
    }
    .sv-sidebar-name {
      color: rgba(255,255,255,0.95);
      font-weight: 600;
      font-size: 0.95rem;
    }
    .sv-sidebar-nav {
      flex: 1;
      padding: var(--space-3) 0;
    }
    .sv-nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      font-size: 0.9rem;
      border: none;
      background: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: background var(--transition), color var(--transition);
    }
    .sv-nav-item:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }
    .sv-nav-item.active {
      background: var(--color-sidebar-active);
      color: #fff;
      font-weight: 600;
      border-left: 3px solid var(--color-primary-light);
    }
    .sv-nav-icon { font-size: 1.1rem; opacity: 0.9; }
    .sv-sidebar-footer { padding: var(--space-3); border-top: 1px solid rgba(255,255,255,0.1); }
    .sv-mas-opciones { color: rgba(255,255,255,0.7); font-size: 0.875rem; }
    .sv-body { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .sv-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-5);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      flex-wrap: wrap;
      gap: var(--space-3);
    }
    .sv-header-greeting { font-size: 0.95rem; color: var(--color-text); font-weight: 500; }
    .sv-header-actions { display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
    .sv-header-action { font-size: 0.8rem; color: var(--color-text-muted); cursor: default; }
    .sv-header-logout {
      font-size: 0.85rem;
      color: var(--color-primary);
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 500;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
    }
    .sv-header-logout:hover { background: var(--color-bg); color: var(--color-primary-hover); }
    .sv-main { flex: 1; padding: var(--space-5); overflow: auto; }
    @media (max-width: 768px) {
      .sv-sidebar { width: 64px; min-width: 64px; }
      .sv-sidebar-name, .sv-nav-item span:not(.sv-nav-icon) { display: none; }
      .sv-sidebar-brand { justify-content: center; padding: var(--space-4); }
      .sv-nav-item { justify-content: center; padding: var(--space-4); }
    }
  `],
})
export class SvLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email: string | null = null;

  constructor() {
    this.auth.getProfile().subscribe((p) => (this.email = p?.email ?? null));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/sv/login']);
  }
}
