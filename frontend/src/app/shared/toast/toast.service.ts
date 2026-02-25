import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

const AUTO_DISMISS_MS = 4500;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = signal<Toast[]>([]);
  readonly list = computed(() => this.toasts());

  success(message: string): void {
    this.add('success', message);
  }

  error(message: string): void {
    this.add('error', message);
  }

  private add(type: ToastType, message: string): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Toast = { id, type, message };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.remove(id), AUTO_DISMISS_MS);
  }

  remove(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
