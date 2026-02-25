import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/card/card.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { SvProductsService } from '../services/products.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-sv-pagos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="pagos-page">
      <h1 class="page-title">Pagos</h1>
      <app-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="pagos-form">
          <div class="form-group">
            <label for="product">Producto</label>
            <select id="product" formControlName="product" class="form-control" [class.invalid]="isFieldInvalid('product')">
              <option value="">Seleccione un producto</option>
              @for (opt of productOptions; track opt.id) {
                <option [value]="opt.id">{{ opt.label }}</option>
              }
            </select>
            @if (isFieldInvalid('product')) {
              <span class="form-error">Seleccione un producto</span>
            }
          </div>
          <div class="form-group">
            <label for="amount">Monto</label>
            <input id="amount" type="number" formControlName="amount" class="form-control" placeholder="0.00" step="0.01" min="0" [class.invalid]="isFieldInvalid('amount')" />
            @if (isFieldInvalid('amount')) {
              <span class="form-error">{{ amountError }}</span>
            }
          </div>
          <div class="form-group">
            <label for="description">Descripción</label>
            <input id="description" type="text" formControlName="description" class="form-control" placeholder="Descripción del pago" />
          </div>
          <div class="form-actions">
            <app-button type="submit" variant="primary" [disabled]="form.invalid">Pagar</app-button>
          </div>
        </form>
      </app-card>
    </div>
  `,
  styles: [`
    .pagos-page { max-width: 600px; margin: 0 auto; }
    .page-title { font-size: 1.5rem; margin: 0 0 var(--space-5); color: var(--color-text); }
    .form-card { margin: 0; }
    .pagos-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-2); }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--color-text); }
    .form-control { padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 1rem; }
    .form-control.invalid { border-color: var(--color-danger, #dc3545); }
    .form-control:focus { outline: none; border-color: var(--color-primary); }
    .form-error { font-size: 0.8rem; color: var(--color-danger, #dc3545); }
    .form-actions { margin-top: var(--space-2); }
  `],
})
export class PagosComponent {
  private fb = inject(FormBuilder);
  private products = inject(SvProductsService);
  private toast = inject(ToastService);

  productOptions = this.products.getProductsForPayment();

  form = this.fb.nonNullable.group({
    product: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    description: [''],
  });

  isFieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && c.touched);
  }

  get amountError(): string {
    const c = this.form.get('amount');
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'El monto es obligatorio';
    if (c.errors['min']) return 'El monto debe ser mayor a 0';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.toast.success('Pago realizado');
    this.form.reset({ product: '', amount: 0, description: '' });
  }
}
