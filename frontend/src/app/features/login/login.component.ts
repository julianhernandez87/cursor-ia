import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CardComponent } from '../../shared/card/card.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="login-page">
      <app-card class="login-card">
        <h1 class="login-title">Login</h1>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              formControlName="email"
              [class.invalid]="emailInvalid"
              placeholder="you@example.com"
            />
            @if (emailInvalid && form.get('email')?.errors) {
              <span class="error">
                @if (form.get('email')?.hasError('required')) { Email is required. }
                @else if (form.get('email')?.hasError('email')) { Invalid email format. }
              </span>
            }
          </div>
          <div class="field">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              formControlName="password"
              [class.invalid]="passwordInvalid"
              placeholder="••••••••"
            />
            @if (passwordInvalid && form.get('password')?.errors) {
              <span class="error">
                @if (form.get('password')?.hasError('required')) { Password is required. }
                @else if (form.get('password')?.hasError('minlength')) { Password must be at least 8 characters. }
              </span>
            }
          </div>
          @if (errorMessage) {
            <p class="error inline-error">{{ errorMessage }}</p>
          }
          <div class="actions">
            <app-button type="submit" variant="primary" [disabled]="form.invalid" [loading]="loading">
              Login
            </app-button>
          </div>
        </form>
      </app-card>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4, 16px);
    }
    .login-card { max-width: 400px; width: 100%; }
    .login-title { margin: 0 0 var(--space-5, 24px); font-size: 1.5rem; text-align: center; }
    .field { margin-bottom: var(--space-4, 16px); }
    .field label { display: block; margin-bottom: var(--space-2, 8px); font-weight: 500; }
    .field input {
      width: 100%;
      padding: var(--space-2, 8px) var(--space-3, 12px);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm, 6px);
      transition: border-color var(--transition, 0.2s), box-shadow var(--transition, 0.2s);
    }
    .field input.invalid { border-color: var(--color-danger); }
    .field input:focus { outline: none; box-shadow: 0 0 0 2px var(--color-primary); }
    .error { color: var(--color-danger); font-size: 0.875rem; margin-top: var(--space-1, 4px); display: block; }
    .inline-error { margin: var(--space-3, 12px) 0 0; }
    .actions { margin-top: var(--space-5, 24px); }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  form: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';

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

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.form.value.email, this.form.value.password).subscribe({
      next: () => {
        this.toastService.success('Login successful');
        this.auth.getProfile().subscribe(() => this.router.navigate(['/users']));
      },
      error: (err) => {
        this.loading = false;
        const status = err.status;
        const friendly = status === 401
          ? 'Invalid email or password'
          : (err.error?.message && typeof err.error.message === 'string' ? err.error.message : 'Login failed');
        this.errorMessage = friendly;
        this.toastService.error(friendly);
      },
    });
  }
}
