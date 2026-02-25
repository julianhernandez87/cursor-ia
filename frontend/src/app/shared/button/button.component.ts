import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [class]="'btn btn-' + variant()"
      [disabled]="disabled() || loading()"
    >
      @if (loading()) {
        <span class="btn-spinner" aria-hidden="true"></span>
      }
      <ng-content />
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2, 8px);
      padding: var(--space-2, 8px) var(--space-4, 16px);
      border-radius: var(--radius-sm, 6px);
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition, 0.2s), box-shadow var(--transition, 0.2s), border-color var(--transition, 0.2s);
    }
    .btn:disabled { cursor: not-allowed; opacity: 0.7; }
    .btn-primary {
      background: var(--color-primary);
      color: white;
    }
    .btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }
    .btn-secondary:hover:not(:disabled) { background: var(--color-border); }
    .btn-danger {
      background: var(--color-danger);
      color: white;
    }
    .btn-danger:hover:not(:disabled) { background: var(--color-danger-hover); }
    .btn-spinner {
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class ButtonComponent {
  type = input<'button' | 'submit'>('button');
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  disabled = input(false);
  loading = input(false);
}
