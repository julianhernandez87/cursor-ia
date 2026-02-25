import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./public/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./public/landing/landing.component').then(m => m.LandingComponent) },
      { path: 'products', loadComponent: () => import('./public/products/products.component').then(m => m.ProductsComponent) },
      { path: 'help', loadComponent: () => import('./public/help/help.component').then(m => m.HelpComponent) },
    ],
  },
  { path: 'sv/login', loadComponent: () => import('./sv/login/sv-login.component').then(m => m.SvLoginComponent) },
  { path: 'sv/registro', loadComponent: () => import('./sv/registro/sv-registro.component').then(m => m.SvRegistroComponent) },
  {
    path: 'sv',
    loadComponent: () => import('./sv/sv-layout.component').then(m => m.SvLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./sv/pages/home.component').then(m => m.HomeComponent) },
      { path: 'productos', loadComponent: () => import('./sv/pages/productos.component').then(m => m.ProductosComponent) },
      { path: 'pagos', loadComponent: () => import('./sv/pages/pagos.component').then(m => m.PagosComponent) },
      { path: 'transferencias', loadComponent: () => import('./sv/pages/transferencias.component').then(m => m.TransferenciasComponent) },
      { path: 'documentos', loadComponent: () => import('./sv/pages/documentos.component').then(m => m.DocumentosComponent) },
      { path: 'finanzas', loadComponent: () => import('./sv/pages/finanzas.component').then(m => m.FinanzasComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
