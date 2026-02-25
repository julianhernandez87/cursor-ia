import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: '<div class="card"><ng-content /></div>',
  styles: [`
    .card {
      background: var(--color-surface);
      border-radius: var(--radius-md, 10px);
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08));
      padding: var(--space-5, 24px);
    }
  `],
})
export class CardComponent {}
