import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/card/card.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { TransferModalComponent } from '../components/transfer-modal.component';
import { SvProductsService } from '../services/products.service';
import { ToastService } from '../../shared/toast/toast.service';

export interface DestinationOption {
  id: string;
  label: string;
  accountNumber: string;
}

@Component({
  selector: 'app-sv-transferencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent, TransferModalComponent],
  template: `
    <div class="transferencias-page">
      <h1 class="page-title">Transferencias</h1>
      <app-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="transfer-form">
          <div class="form-group">
            <label for="origin">Cuenta de origen</label>
            <select id="origin" formControlName="origin" class="form-control" [class.invalid]="form.get('origin')?.invalid && form.get('origin')?.touched">
              <option value="">Seleccione cuenta de origen</option>
              @for (acc of savingsAccounts; track acc.id) {
                <option [value]="acc.id">{{ acc.name }} ({{ acc.accountNumber }})</option>
              }
            </select>
            @if (form.get('origin')?.invalid && form.get('origin')?.touched) {
              <span class="form-error">Seleccione cuenta de origen</span>
            }
          </div>
          <div class="form-group">
            <label>Cuenta de destino</label>
            <div class="destination-row">
              <select formControlName="destination" class="form-control flex-1" [class.invalid]="form.get('destination')?.invalid && form.get('destination')?.touched">
                <option value="">Seleccione cuenta de destino</option>
                @for (d of destinationOptions(); track d.id) {
                  <option [value]="d.id">{{ d.label }} ({{ d.accountNumber }})</option>
                }
              </select>
              <app-button type="button" variant="secondary" (click)="showModal.set(true)">Inscribir nueva cuenta</app-button>
            </div>
            @if (form.get('destination')?.invalid && form.get('destination')?.touched) {
              <span class="form-error">Seleccione cuenta de destino</span>
            }
          </div>
          <div class="form-group">
            <label for="amount">Monto</label>
            <input id="amount" type="number" formControlName="amount" class="form-control" placeholder="0.00" step="0.01" min="0" [class.invalid]="form.get('amount')?.invalid && form.get('amount')?.touched" />
            @if (form.get('amount')?.invalid && form.get('amount')?.touched) {
              <span class="form-error">{{ form.get('amount')?.errors?.['required'] ? 'El monto es obligatorio' : 'El monto debe ser mayor a 0' }}</span>
            }
          </div>
          <div class="form-group">
            <label for="description">Descripción</label>
            <input id="description" type="text" formControlName="description" class="form-control" placeholder="Descripción (opcional)" />
          </div>
          <div class="form-actions">
            <app-button type="submit" variant="primary" [disabled]="form.invalid">Transferir</app-button>
          </div>
        </form>
      </app-card>

      @if (showModal()) {
        <app-transfer-modal
          (close)="showModal.set(false)"
          (saved)="onAccountRegistered(); showModal.set(false)"
        />
      }
    </div>
  `,
  styles: [`
    .transferencias-page { max-width: 600px; margin: 0 auto; }
    .page-title { font-size: 1.5rem; margin: 0 0 var(--space-5); color: var(--color-text); }
    .form-card { margin: 0; }
    .transfer-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-2); }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--color-text); }
    .form-control { padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 1rem; }
    .form-control.invalid { border-color: var(--color-danger, #dc3545); }
    .form-control:focus { outline: none; border-color: var(--color-primary); }
    .form-error { font-size: 0.8rem; color: var(--color-danger, #dc3545); }
    .destination-row { display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap; }
    .flex-1 { flex: 1; min-width: 180px; }
    .form-actions { margin-top: var(--space-2); }
  `],
})
export class TransferenciasComponent {
  private fb = inject(FormBuilder);
  private products = inject(SvProductsService);
  private toast = inject(ToastService);

  savingsAccounts = this.products.getSavingsAccounts();
  destinationOptions = signal<DestinationOption[]>([
    { id: 'ext-1', label: 'Cuenta externa ejemplo', accountNumber: '****9999' },
  ]);

  showModal = signal(false);

  form = this.fb.nonNullable.group({
    origin: ['', Validators.required],
    destination: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    description: [''],
  });

  onAccountRegistered(): void {
    const newId = `ext-${Date.now()}`;
    this.destinationOptions.update((list) => [
      ...list,
      { id: newId, label: 'Nueva cuenta inscrita', accountNumber: '****0000' },
    ]);
    this.form.patchValue({ destination: newId });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.toast.success('Transferencia realizada');
    this.form.reset({ origin: '', destination: '', amount: 0, description: '' });
  }
}
