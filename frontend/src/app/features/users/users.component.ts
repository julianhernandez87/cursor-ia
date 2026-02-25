import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CardComponent } from '../../shared/card/card.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

export interface UserDto {
  id: number;
  email: string;
  enabled: boolean;
  roles: string[];
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="users-page">
      <div class="users-header">
        <h2>Users</h2>
        <app-button variant="primary" (click)="openCreate()">Add user</app-button>
      </div>

      <div class="search-wrap">
        <input
          type="search"
          placeholder="Search by email..."
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
          class="search-input"
        />
      </div>

      @if (listLoading()) {
        <div class="loading-wrap"><span class="spinner" aria-hidden="true"></span> Loading users…</div>
      } @else if (filteredUsers().length === 0) {
        <app-card class="empty-state">
          <p>{{ searchTerm() ? 'No users found.' : 'No users yet.' }}</p>
        </app-card>
      } @else {
        <div class="table-wrap">
          <table class="users-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Email</th>
                <th>Enabled</th>
                <th>Roles</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (u of filteredUsers(); track u.id) {
                <tr>
                  <td>{{ u.id }}</td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.enabled }}</td>
                  <td>{{ u.roles.join(', ') }}</td>
                  <td class="actions-cell">
                    <app-button variant="secondary" (click)="openEdit(u)" title="Edit">✎ Edit</app-button>
                    <app-button variant="danger" (click)="openDeleteConfirm(u)" title="Delete">✕ Delete</app-button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()" role="presentation">
          <div class="modal-box" (click)="$event.stopPropagation()" role="dialog">
            <app-card>
              <h3>{{ editingId() ? 'Edit user' : 'New user' }}</h3>
              <form [formGroup]="modalForm" (ngSubmit)="saveUser()">
                <div class="field">
                  <label for="modal-email">Email</label>
                  <input id="modal-email" type="email" formControlName="email" [class.invalid]="emailControlInvalid()" />
                  @if (emailControlInvalid() && modalForm.get('email')?.errors) {
                    <span class="error">
                      @if (modalForm.get('email')?.hasError('required')) { Email is required. }
                      @else if (modalForm.get('email')?.hasError('email')) { Invalid email format. }
                    </span>
                  }
                </div>
                @if (!editingId()) {
                  <div class="field">
                    <label for="modal-password">Password</label>
                    <input id="modal-password" type="password" formControlName="password" [class.invalid]="passwordControlInvalid()" />
                    @if (passwordControlInvalid() && modalForm.get('password')?.errors) {
                      <span class="error">
                        @if (modalForm.get('password')?.hasError('required')) { Password is required. }
                        @else if (modalForm.get('password')?.hasError('minlength')) { Password must be at least 8 characters. }
                      </span>
                    }
                  </div>
                }
                <div class="field row">
                  <label><input type="checkbox" formControlName="enabled" /> Enabled</label>
                </div>
                <div class="field">
                  <label for="modal-roles">Roles (comma-separated)</label>
                  <input id="modal-roles" formControlName="roles" placeholder="USER, ADMIN" />
                </div>
                <div class="modal-actions">
                  <app-button type="button" variant="secondary" (click)="closeModal()">Cancel</app-button>
                  <app-button type="submit" variant="primary" [loading]="saveLoading()">Save</app-button>
                </div>
              </form>
            </app-card>
          </div>
        </div>
      }

      @if (showConfirm()) {
        <app-confirm-dialog
          title="Delete user"
          [message]="'Delete user ' + (userToDelete()?.email ?? '') + '?'"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          (confirmed)="onConfirmDelete()"
          (cancelled)="closeConfirm()"
        />
      }
    </div>
  `,
  styles: [`
    .users-page { padding: var(--space-4, 16px); }
    .users-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4, 16px); }
    .search-wrap { margin-bottom: var(--space-4, 16px); }
    .search-input {
      width: 100%;
      max-width: 320px;
      padding: var(--space-2, 8px) var(--space-3, 12px);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm, 6px);
      transition: border-color var(--transition, 0.2s);
    }
    .loading-wrap { display: flex; align-items: center; gap: var(--space-2, 8px); padding: var(--space-5, 24px); }
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--color-border);
      border-right-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; color: var(--color-text-muted); }
    .table-wrap { overflow-x: auto; border-radius: var(--radius-md, 10px); box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08)); }
    .users-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--color-surface);
    }
    .users-table th {
      background: var(--color-surface);
      border-bottom: 2px solid var(--color-border);
      padding: var(--space-3, 12px) var(--space-4, 16px);
      text-align: left;
      font-weight: 600;
    }
    .users-table td {
      border-bottom: 1px solid var(--color-border);
      padding: var(--space-3, 12px) var(--space-4, 16px);
    }
    .users-table tbody tr:nth-child(even) { background: var(--color-bg); }
    .users-table tbody tr:hover { background: var(--color-border); }
    .actions-cell { display: flex; gap: var(--space-2, 8px); flex-wrap: wrap; }
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
      padding: var(--space-4, 16px);
    }
    .modal-box { max-width: 420px; width: 100%; }
    .modal-box h3 { margin: 0 0 var(--space-4, 16px); }
    .field { margin-bottom: var(--space-4, 16px); }
    .field label { display: block; margin-bottom: var(--space-2, 8px); font-weight: 500; }
    .field.row label { display: inline-flex; align-items: center; gap: var(--space-2, 8px); }
    .field input[type="text"],
    .field input[type="email"],
    .field input[type="password"] {
      width: 100%;
      padding: var(--space-2, 8px) var(--space-3, 12px);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm, 6px);
      transition: border-color var(--transition, 0.2s);
    }
    .field input.invalid { border-color: var(--color-danger); }
    .error { color: var(--color-danger); font-size: 0.875rem; margin-top: var(--space-1, 4px); display: block; }
    .modal-actions { display: flex; gap: var(--space-2, 8px); justify-content: flex-end; margin-top: var(--space-5, 24px); }
  `],
})
export class UsersComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  users = signal<UserDto[]>([]);
  listLoading = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  showConfirm = signal(false);
  userToDelete = signal<UserDto | null>(null);
  saveLoading = signal(false);
  searchTerm = signal('');
  modalForm!: FormGroup;
  modalSubmitted = signal(false);

  private get apiUrl(): string {
    return this.auth.apiUrl || '';
  }

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.users();
    if (!term) return list;
    return list.filter((u) => u.email.toLowerCase().includes(term));
  });

  emailControlInvalid = computed(() => {
    const c = this.modalForm?.get('email');
    return !!c && (c.touched || this.modalSubmitted()) && c.invalid;
  });

  passwordControlInvalid = computed(() => {
    const c = this.modalForm?.get('password');
    return !!c && (c.touched || this.modalSubmitted()) && c.invalid;
  });

  constructor() {
    this.modalForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      enabled: [true],
      roles: ['USER'],
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.listLoading.set(true);
    this.http.get<UserDto[]>(`${this.apiUrl}/api/users`).subscribe({
      next: (list) => {
        this.users.set(list);
        this.listLoading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.listLoading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.modalForm.reset({ email: '', password: '', enabled: true, roles: 'USER' });
    this.modalForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.modalSubmitted.set(false);
    this.showModal.set(true);
  }

  openEdit(u: UserDto): void {
    this.editingId.set(u.id);
    this.modalForm.reset({
      email: u.email,
      password: '',
      enabled: u.enabled,
      roles: u.roles?.join(', ') || 'USER',
    });
    this.modalForm.get('password')?.clearValidators();
    this.modalForm.get('password')?.updateValueAndValidity();
    this.modalSubmitted.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveUser(): void {
    this.modalSubmitted.set(true);
    if (this.modalForm.invalid) return;
    const roleNames = (this.modalForm.value.roles as string)
      .split(',')
      .map((r: string) => r.trim())
      .filter(Boolean);
    const payload = {
      email: this.modalForm.value.email,
      enabled: this.modalForm.value.enabled,
      roleNames: roleNames.length ? roleNames : ['USER'],
    };
    this.saveLoading.set(true);
    const id = this.editingId();
    if (id != null) {
      this.http.put(`${this.apiUrl}/api/users/${id}`, payload).subscribe({
        next: () => {
          this.saveLoading.set(false);
          this.toastService.success('User updated');
          this.load();
          this.closeModal();
        },
        error: (err) => {
          this.saveLoading.set(false);
          this.toastService.error(err.error?.message || 'Failed to save user');
        },
      });
    } else {
      (payload as Record<string, unknown>)['password'] = this.modalForm.value.password;
      this.http.post(`${this.apiUrl}/api/users`, payload).subscribe({
        next: () => {
          this.saveLoading.set(false);
          this.toastService.success('User created');
          this.load();
          this.closeModal();
        },
        error: (err) => {
          this.saveLoading.set(false);
          this.toastService.error(err.error?.message || 'Failed to save user');
        },
      });
    }
  }

  openDeleteConfirm(u: UserDto): void {
    this.userToDelete.set(u);
    this.showConfirm.set(true);
  }

  closeConfirm(): void {
    this.showConfirm.set(false);
    this.userToDelete.set(null);
  }

  onConfirmDelete(): void {
    const u = this.userToDelete();
    if (!u) return;
    this.http.delete(`${this.apiUrl}/api/users/${u.id}`).subscribe({
      next: () => {
        this.toastService.success('User removed');
        this.load();
        this.closeConfirm();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete user');
        this.closeConfirm();
      },
    });
  }
}
