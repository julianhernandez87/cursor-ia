import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ButtonComponent } from '../../shared/button/button.component';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'PASSPORT', label: 'Pasaporte' },
] as const;

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control.parent;
    if (!form) return null;
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password && confirm && password === confirm ? null : { passwordMismatch: true };
  };
}

@Component({
  selector: 'app-sv-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
  ],
  template: `
    <div class="sv-registro-page">
      <div class="sv-registro-visual">
        <div class="sv-registro-visual-brand">Sucursal Virtual</div>
        <p class="sv-registro-visual-text">Cree su cuenta y acceda a todos los servicios.</p>
      </div>
      <div class="sv-registro-right">
        <div class="sv-registro-card">
          <div class="sv-registro-header">
            <span class="sv-registro-brand">Banco Demo</span>
            <h1 class="sv-registro-title">Registro de nuevo cliente</h1>
            <a routerLink="/sv/login" class="sv-registro-link">Ya tiene cuenta? Ingresar</a>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label for="fullName">Nombre completo</label>
              <input
                id="fullName"
                type="text"
                formControlName="fullName"
                class="sv-input"
                [class.invalid]="isFieldInvalid('fullName')"
                placeholder="Ej. Juan Pérez"
                autocomplete="name"
              />
              @if (isFieldInvalid('fullName')) {
                <span class="error">{{ getFieldError('fullName') }}</span>
              }
            </div>
            <div class="field-row">
              <div class="field">
                <label for="documentType">Tipo de documento</label>
                <select
                  id="documentType"
                  formControlName="documentType"
                  class="sv-input"
                  [class.invalid]="isFieldInvalid('documentType')"
                >
                  @for (opt of documentTypes; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
                @if (isFieldInvalid('documentType')) {
                  <span class="error">{{ getFieldError('documentType') }}</span>
                }
              </div>
              <div class="field">
                <label for="documentNumber">Número de documento</label>
                <input
                  id="documentNumber"
                  type="text"
                  formControlName="documentNumber"
                  class="sv-input"
                  [class.invalid]="isFieldInvalid('documentNumber')"
                  placeholder="Sin puntos ni espacios"
                />
                @if (isFieldInvalid('documentNumber')) {
                  <span class="error">{{ getFieldError('documentNumber') }}</span>
                }
              </div>
            </div>
            <div class="field">
              <label for="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="sv-input"
                [class.invalid]="isFieldInvalid('email')"
                placeholder="correo@ejemplo.com"
                autocomplete="email"
              />
              @if (isFieldInvalid('email')) {
                <span class="error">{{ getFieldError('email') }}</span>
              }
            </div>
            <div class="field">
              <label for="phone">Teléfono (opcional)</label>
              <input
                id="phone"
                type="tel"
                formControlName="phone"
                class="sv-input"
                [class.invalid]="isFieldInvalid('phone')"
                placeholder="+57 300 123 4567"
              />
            </div>
            <div class="field">
              <label for="password">Contraseña</label>
              <div class="password-wrap">
                <input
                  id="password"
                  [type]="hidePassword() ? 'password' : 'text'"
                  formControlName="password"
                  class="sv-input"
                  [class.invalid]="isFieldInvalid('password')"
                  placeholder="Mín. 8 caracteres, mayúscula, minúscula y número"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="toggle-password"
                  (click)="togglePassword()"
                  [attr.aria-label]="hidePassword() ? 'Mostrar contraseña' : 'Ocultar contraseña'"
                >
                  <span class="eye-icon" [class.hidden]="!hidePassword()">👁</span>
                  <span class="eye-icon" [class.hidden]="hidePassword()">👁‍🗨</span>
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <span class="error">{{ getFieldError('password') }}</span>
              }
            </div>
            <div class="field">
              <label for="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                [type]="hideConfirm() ? 'password' : 'text'"
                formControlName="confirmPassword"
                class="sv-input"
                [class.invalid]="isFieldInvalid('confirmPassword')"
                placeholder="Repita la contraseña"
                autocomplete="new-password"
              />
              @if (isFieldInvalid('confirmPassword')) {
                <span class="error">{{ getFieldError('confirmPassword') }}</span>
              }
            </div>
            <div class="field remember">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="acceptTerms" />
                <span>Acepto los términos y condiciones del servicio</span>
              </label>
              @if (isFieldInvalid('acceptTerms')) {
                <span class="error">Debe aceptar los términos para continuar.</span>
              }
            </div>
            @if (errorMessage) {
              <p class="error inline-error">{{ errorMessage }}</p>
            }
            <div class="actions">
              <app-button
                type="submit"
                variant="primary"
                [disabled]="form.invalid"
                [loading]="loading()"
              >
                Registrarse
              </app-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .sv-registro-page {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
        background: var(--color-bg);
      }
      .sv-registro-visual {
        background: linear-gradient(135deg, var(--color-sidebar-bg) 0%, var(--color-primary) 100%);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        padding: var(--space-6);
      }
      .sv-registro-visual-brand {
        color: rgba(255, 255, 255, 0.95);
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: var(--space-2);
      }
      .sv-registro-visual-text {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1rem;
        margin: 0;
      }
      .sv-registro-right {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-6);
        overflow: auto;
      }
      .sv-registro-card {
        width: 100%;
        max-width: 440px;
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        padding: var(--space-6);
      }
      .sv-registro-header {
        margin-bottom: var(--space-5);
      }
      .sv-registro-brand {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-primary);
        display: block;
        margin-bottom: var(--space-1);
      }
      .sv-registro-title {
        font-size: 1.25rem;
        margin: 0 0 var(--space-2);
        color: var(--color-text);
      }
      .sv-registro-link {
        font-size: 0.875rem;
        color: var(--color-primary);
        text-decoration: underline;
      }
      .sv-registro-link:hover {
        color: var(--color-primary-hover);
      }
      .field {
        margin-bottom: var(--space-4);
      }
      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-4);
      }
      .field label {
        display: block;
        margin-bottom: var(--space-2);
        font-weight: 500;
        font-size: 0.875rem;
        color: var(--color-text);
      }
      .sv-input {
        width: 100%;
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        font-size: 0.95rem;
      }
      .sv-input.invalid {
        border-color: var(--color-danger);
      }
      .password-wrap {
        display: flex;
        align-items: stretch;
      }
      .password-wrap .sv-input {
        border-radius: var(--radius-sm) 0 0 var(--radius-sm);
      }
      .toggle-password {
        width: 44px;
        border: 1px solid var(--color-border);
        border-left: none;
        border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        background: var(--color-bg);
        cursor: pointer;
        font-size: 1rem;
      }
      .eye-icon.hidden {
        display: none;
      }
      .remember {
        margin-bottom: var(--space-4);
      }
      .checkbox-label {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-size: 0.9rem;
        color: var(--color-text);
        cursor: pointer;
      }
      .checkbox-label input {
        width: auto;
      }
      .error {
        color: var(--color-danger);
        font-size: 0.8rem;
        margin-top: var(--space-1);
        display: block;
      }
      .inline-error {
        margin: var(--space-3) 0 0;
      }
      .actions {
        margin-top: var(--space-5);
      }
      @media (max-width: 768px) {
        .sv-registro-page {
          grid-template-columns: 1fr;
        }
        .sv-registro-visual {
          min-height: 140px;
        }
        .field-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SvRegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly documentTypes = DOCUMENT_TYPES;
  form: FormGroup;
  submitted = false;
  errorMessage = '';
  hidePassword = signal(true);
  hideConfirm = signal(true);
  loading = signal(false);

  constructor() {
    this.form = this.fb.nonNullable.group(
      {
        fullName: ['', [Validators.required, Validators.maxLength(255)]],
        documentType: ['CC' as const, Validators.required],
        documentNumber: ['', [Validators.required, Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
        phone: ['', [Validators.maxLength(50)]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(PASSWORD_PATTERN),
          ],
        ],
        confirmPassword: ['', [Validators.required, passwordMatchValidator()]],
        acceptTerms: [false, [Validators.requiredTrue]],
      }
    );
    this.form.get('password')?.valueChanges.subscribe(() => {
      this.form.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  isFieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && (c.touched || this.submitted) && c.invalid;
  }

  getFieldError(name: string): string {
    const c = this.form.get(name);
    if (!c || !c.errors) return '';
    const e = c.errors;
    if (e['required']) return 'Campo obligatorio.';
    if (e['email']) return 'Formato de correo no válido.';
    if (e['minlength']) return 'Mínimo ' + e['minlength'].requiredLength + ' caracteres.';
    if (e['maxlength']) return 'Máximo ' + e['maxlength'].requiredLength + ' caracteres.';
    if (e['pattern']) return 'La contraseña debe tener mayúscula, minúscula y número.';
    if (e['passwordMismatch']) return 'Las contraseñas no coinciden.';
    return 'Valor no válido.';
  }

  togglePassword(): void {
    this.hidePassword.update((v) => !v);
  }

  toggleConfirm(): void {
    this.hideConfirm.update((v) => !v);
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.form.invalid) return;

    this.loading.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      fullName: raw.fullName,
      documentType: raw.documentType,
      documentNumber: raw.documentNumber,
      email: raw.email,
      phone: raw.phone && String(raw.phone).trim() ? String(raw.phone).trim() : undefined,
      password: raw.password,
      confirmPassword: raw.confirmPassword,
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.toast.success('Cuenta creada. Ya puede ingresar con su correo y contraseña.');
        this.router.navigate(['/sv/login']);
      },
      error: (err) => {
        this.loading.set(false);
        const status = err?.status;
        const body = err?.error;
        const message = typeof body?.message === 'string' ? body.message : null;
        const errors = Array.isArray(body?.errors) ? body.errors : body?.errors;
        if (status === 409) {
          this.errorMessage = message || 'Correo o número de documento ya registrado.';
          this.toast.error(this.errorMessage);
        } else if (status === 400 && message) {
          this.errorMessage = message;
          if (errors?.length) {
            const first = errors[0];
            const fieldMsg = first?.message || first?.msg;
            if (fieldMsg) this.errorMessage += ' ' + fieldMsg;
          }
          this.toast.error(this.errorMessage);
        } else {
          this.errorMessage = message || 'Error al registrar. Intente de nuevo.';
          this.toast.error(this.errorMessage);
        }
      },
    });
  }
}
