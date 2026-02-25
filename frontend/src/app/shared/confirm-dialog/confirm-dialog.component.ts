import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="overlay" (click)="cancelled.emit()" role="presentation">
      <div class="dialog" (click)="$event.stopPropagation()" role="dialog" [attr.aria-labelledby]="'dialog-title-' + dialogId" [attr.aria-modal]="true">
        <h2 class="dialog-title" [id]="'dialog-title-' + dialogId">{{ title() }}</h2>
        <p class="dialog-message">{{ message() }}</p>
        <div class="dialog-actions">
          <app-button [variant]="'secondary'" (click)="cancelled.emit()">{{ cancelLabel() }}</app-button>
          <app-button [variant]="'danger'" (click)="confirmed.emit()">{{ confirmLabel() }}</app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }
    .dialog {
      background: var(--color-surface);
      border-radius: var(--radius-md, 10px);
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.1));
      padding: var(--space-5, 24px);
      max-width: 400px;
      width: 90%;
      animation: scaleIn 0.2s ease;
    }
    .dialog-title { margin: 0 0 var(--space-3, 12px); font-size: 1.25rem; }
    .dialog-message { margin: 0 0 var(--space-5, 24px); color: var(--color-text-muted); }
    .dialog-actions { display: flex; gap: var(--space-2, 8px); justify-content: flex-end; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `],
})
export class ConfirmDialogComponent {
  private static idCounter = 0;
  dialogId = `confirm-${++ConfirmDialogComponent.idCounter}`;
  title = input.required<string>();
  message = input.required<string>();
  confirmLabel = input('Confirm');
  cancelLabel = input('Cancel');
  confirmed = output<void>();
  cancelled = output<void>();
}
