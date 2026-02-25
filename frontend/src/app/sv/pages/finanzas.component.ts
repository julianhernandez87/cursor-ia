import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sv-finanzas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="finanzas-page">
      <div class="finanzas-placeholder">
        <span class="finanzas-icon" aria-hidden="true">📊</span>
        <h2 class="finanzas-title">Próximamente</h2>
        <p class="finanzas-text">Esta sección estará disponible pronto.</p>
      </div>
    </div>
  `,
  styles: [`
    .finanzas-page { display: flex; align-items: center; justify-content: center; min-height: 40vh; padding: var(--space-6); }
    .finanzas-placeholder { text-align: center; max-width: 320px; }
    .finanzas-icon { font-size: 4rem; display: block; margin-bottom: var(--space-4); opacity: 0.8; }
    .finanzas-title { font-size: 1.5rem; margin: 0 0 var(--space-2); color: var(--color-text); }
    .finanzas-text { margin: 0; color: var(--color-text-muted); font-size: 1rem; }
  `],
})
export class FinanzasComponent {}
