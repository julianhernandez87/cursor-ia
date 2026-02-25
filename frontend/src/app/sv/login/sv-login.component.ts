import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-sv-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, ButtonComponent],
  template: `
    <div class="sv-login-page">
      <div class="sv-login-visual">
        <div class="sv-login-visual-brand">Sucursal Virtual</div>
      </div>
      <div class="sv-login-right">
        <div class="sv-login-card">
          <div class="sv-login-card-header">
            <a href="#" class="sv-login-security">Seguridad</a>
            <div class="sv-login-brand">
              <span class="sv-login-brand-name">Banco Demo</span>
              <p class="sv-login-welcome">¡Bienvenido a tu <strong>Portal Transaccional</strong></p>
            </div>
            <div class="sv-login-tabs">
              <span class="sv-login-tab active">Registrado</span>
              <span class="sv-login-tab">Sin registro</span>
            </div>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label for="sv-email">Identificación</label>
              <input
                id="sv-email"
                type="text"
                formControlName="email"
                class="sv-input"
                [class.invalid]="emailInvalid"
                placeholder="Correo o documento"
                autocomplete="username"
              />
              @if (emailInvalid && form.get('email')?.errors) {
                <span class="error">
                  @if (form.get('email')?.hasError('required')) { Ingrese su correo o documento. }
                  @else if (form.get('email')?.hasError('email')) { Formato de correo no válido. }
                </span>
              }
            </div>
            <div class="field">
              <label for="sv-password">Contraseña</label>
              <div class="password-wrap">
                <input
                  id="sv-password"
                  [type]="hidePassword() ? 'password' : 'text'"
                  formControlName="password"
                  class="sv-input"
                  [class.invalid]="passwordInvalid"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button type="button" class="toggle-password" (click)="togglePassword()" [attr.aria-label]="hidePassword() ? 'Mostrar contraseña' : 'Ocultar contraseña'">
                  <span class="eye-icon" [class.hidden]="!hidePassword()">👁</span>
                  <span class="eye-icon" [class.hidden]="hidePassword()">👁‍🗨</span>
                </button>
              </div>
              @if (passwordInvalid && form.get('password')?.errors) {
                <span class="error">
                  @if (form.get('password')?.hasError('required')) { La contraseña es obligatoria. }
                  @else if (form.get('password')?.hasError('minlength')) { Mínimo 8 caracteres. }
                </span>
              }
              <a href="#" class="forgot-link">Olvidaste tu contraseña?</a>
            </div>
            <div class="field remember">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="rememberMe" [ngModelOptions]="{standalone: true}" />
                <span>Recordar mis datos</span>
              </label>
            </div>
            @if (errorMessage) {
              <p class="error inline-error">{{ errorMessage }}</p>
            }
            <div class="actions">
              <app-button type="submit" variant="primary" [disabled]="form.invalid" [loading]="loading">
                Ingresar
              </app-button>
            </div>
            <p class="sv-login-register">
              ¿No tiene cuenta? <a routerLink="/sv/registro" class="sv-login-register-link">Registrarse</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sv-login-page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: var(--color-bg);
    }
    .sv-login-visual {
      background: linear-gradient(135deg, var(--color-sidebar-bg) 0%, var(--color-primary) 100%);
      display: flex;
      align-items: flex-start;
      padding: var(--space-6);
      position: relative;
    }
    .sv-login-visual::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.5;
    }
    .sv-login-visual-brand {
      position: relative;
      color: rgba(255,255,255,0.95);
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .sv-login-right {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
    }
    .sv-login-card {
      width: 100%;
      max-width: 400px;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: var(--space-6);
    }
    .sv-login-card-header { margin-bottom: var(--space-5); }
    .sv-login-security {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: 0.875rem;
      color: var(--color-success);
      text-decoration: underline;
      margin-bottom: var(--space-4);
    }
    .sv-login-brand { text-align: center; margin-bottom: var(--space-4); }
    .sv-login-brand-name { font-size: 1.125rem; font-weight: 700; color: var(--color-primary); display: block; margin-bottom: var(--space-1); }
    .sv-login-welcome { margin: 0; font-size: 0.95rem; color: var(--color-text-muted); }
    .sv-login-welcome strong { color: var(--color-primary); }
    .sv-login-tabs {
      display: flex;
      gap: var(--space-4);
      border-bottom: 1px solid var(--color-border);
    }
    .sv-login-tab {
      padding-bottom: var(--space-2);
      font-size: 0.9rem;
      color: var(--color-text-muted);
      cursor: default;
    }
    .sv-login-tab.active {
      color: var(--color-primary);
      font-weight: 600;
      border-bottom: 2px solid var(--color-primary);
      margin-bottom: -1px;
    }
    .field { margin-bottom: var(--space-4); }
    .field label { display: block; margin-bottom: var(--space-2); font-weight: 500; font-size: 0.875rem; color: var(--color-text); }
    .password-wrap { display: flex; gap: 0; align-items: stretch; }
    .password-wrap .sv-input { border-radius: var(--radius-sm) 0 0 var(--radius-sm); }
    .toggle-password {
      width: 44px;
      border: 1px solid var(--color-border);
      border-left: none;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      background: var(--color-bg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }
    .toggle-password:hover { background: var(--color-border); }
    .eye-icon.hidden { display: none; }
    .forgot-link { font-size: 0.875rem; color: var(--color-primary); text-decoration: underline; margin-top: var(--space-2); display: inline-block; }
    .forgot-link:hover { color: var(--color-primary-hover); }
    .remember { margin-bottom: var(--space-4); }
    .checkbox-label { display: inline-flex; align-items: center; gap: var(--space-2); font-size: 0.9rem; color: var(--color-text); cursor: pointer; }
    .checkbox-label input { width: auto; }
    .error { color: var(--color-danger); font-size: 0.875rem; margin-top: var(--space-1); display: block; }
    .inline-error { margin: var(--space-3) 0 0; }
    .actions { margin-top: var(--space-5); }
    .sv-login-register { margin-top: var(--space-4); text-align: center; font-size: 0.9rem; color: var(--color-text-muted); }
    .sv-login-register-link { color: var(--color-primary); text-decoration: underline; }
    .sv-login-register-link:hover { color: var(--color-primary-hover); }
    @media (max-width: 768px) {
      .sv-login-page { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
      .sv-login-visual { min-height: 180px; }
      .sv-login-right { padding: var(--space-4); align-items: flex-start; padding-top: var(--space-5); }
    }
  `],
})
export class SvLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  form: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  hidePassword = signal(true);
  rememberMe = false;

  constructor() {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get emailInvalid(): boolean {
    const c = this.form.get('email');
    return !!c && (c.touched || this.submitted) && c.invalid;
  }

  get passwordInvalid(): boolean {
    const c = this.form.get('password');
    return !!c && (c.touched || this.submitted) && c.invalid;
  }

  togglePassword(): void {
    this.hidePassword.update((v) => !v);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const email = this.form.value.email as string;
    const password = this.form.value.password as string;
    this.auth.login(email, password).subscribe({
      next: () => {
        this.toastService.success('Bienvenido a Sucursal Virtual');
        this.auth.getProfile().subscribe(() => this.router.navigate(['/sv/home']));
      },
      error: (err) => {
        this.loading = false;
        const status = err?.status;
        const friendly = status === 401
          ? 'Correo o contraseña incorrectos'
          : (err?.error?.message && typeof err.error.message === 'string' ? err.error.message : 'Error al ingresar. Intente de nuevo.');
        this.errorMessage = friendly;
        this.toastService.error(friendly);
      },
    });
  }
}
