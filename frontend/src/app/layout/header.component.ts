import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <header style="padding: 0.5rem 1rem; background: #f5f5f5; display: flex; justify-content: space-between; align-items: center;">
      <nav>
        <a routerLink="/users" routerLinkActive="active">Users</a>
      </nav>
      <span *ngIf="email">{{ email }}</span>
      <button (click)="logout()">Logout</button>
    </header>
    <main style="padding: 1rem;">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    'a { margin-right: 1rem; }',
    '.active { font-weight: bold; }',
  ],
})
export class HeaderComponent {
  email: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.auth.getProfile().subscribe((p) => (this.email = p?.email ?? null));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
