import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container" aria-live="polite">
      @for (t of toastService.list(); track t.id) {
        <div class="toast toast-{{ t.type }}" [attr.role]="t.type === 'error' ? 'alert' : 'status'">
          <span class="toast-icon">{{ t.type === 'success' ? '✓' : '✕' }}</span>
          <span class="toast-message">{{ t.message }}</span>
          <button type="button" class="toast-close" (click)="toastService.remove(t.id)" aria-label="Close">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--space-4, 16px);
      right: var(--space-4, 16px);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: var(--space-2, 8px);
      max-width: 360px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-2, 8px);
      padding: var(--space-3, 12px) var(--space-4, 16px);
      border-radius: var(--radius-md, 10px);
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1));
      background: var(--color-surface);
      border-left: 4px solid;
      animation: slideIn 0.2s ease;
    }
    .toast-success { border-left-color: var(--color-success); }
    .toast-success .toast-icon { color: var(--color-success); }
    .toast-error { border-left-color: var(--color-danger); }
    .toast-error .toast-icon { color: var(--color-danger); }
    .toast-icon { font-weight: bold; flex-shrink: 0; }
    .toast-message { flex: 1; }
    .toast-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      color: var(--color-text-muted);
      padding: 0 var(--space-1, 4px);
      transition: color 0.2s;
    }
    .toast-close:hover { color: var(--color-text); }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
