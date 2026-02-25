import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/card/card.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <app-card class="modal-card">
          <div class="modal-header">
            <h2 class="modal-title">Inscribir nueva cuenta</h2>
            <button type="button" class="modal-close" (click)="close.emit()" aria-label="Cerrar">&times;</button>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSave()" class="modal-form">
            <div class="form-group">
              <label for="alias">Alias o nombre de la cuenta</label>
              <input id="alias" type="text" formControlName="alias" class="form-control" placeholder="Ej: Cuenta propia" />
            </div>
            <div class="form-group">
              <label for="accountNumber">Número de cuenta</label>
              <input id="accountNumber" type="text" formControlName="accountNumber" class="form-control" placeholder="****1234" />
            </div>
            <div class="modal-actions">
              <app-button type="button" variant="secondary" (click)="close.emit()">Cancelar</app-button>
              <app-button type="submit" variant="primary">Guardar</app-button>
            </div>
          </form>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: var(--space-4);
    }
    .modal-box { width: 100%; max-width: 420px; }
    .modal-card { padding: var(--space-5); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
    .modal-title { margin: 0; font-size: 1.25rem; color: var(--color-text); }
    .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-muted); line-height: 1; padding: 0 var(--space-1); }
    .modal-close:hover { color: var(--color-text); }
    .modal-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-2); }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--color-text); }
    .form-control { padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 1rem; }
    .form-control:focus { outline: none; border-color: var(--color-primary); }
    .modal-actions { display: flex; gap: var(--space-3); justify-content: flex-end; margin-top: var(--space-2); }
  `],
})
export class TransferModalComponent {
  private fb = inject(FormBuilder);

  close = output<void>();
  saved = output<void>();

  form = this.fb.nonNullable.group({
    alias: ['', Validators.required],
    accountNumber: ['', Validators.required],
  });

  onSave(): void {
    if (this.form.invalid) return;
    this.saved.emit();
    this.form.reset({ alias: '', accountNumber: '' });
  }
}
