import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'auth_token';

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface UserProfile {
  id: number;
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;
  private profile: UserProfile | null = null;

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  get apiUrl(): string {
    return environment.apiUrl || '';
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const url = `${this.apiUrl}/api/auth/login`;
    return this.http.post<LoginResponse>(url, { email, password }).pipe(
      tap((res) => {
        this.setToken(res.accessToken);
        this.profile = null;
      })
    );
  }

  getProfile(): Observable<UserProfile | null> {
    if (this.profile) return of(this.profile);
    if (!this.getToken()) return of(null);
    const url = `${this.apiUrl}/api/auth/me`;
    return this.http.get<UserProfile>(url).pipe(
      tap((p) => (this.profile = p)),
      catchError(() => of(null))
    );
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout(): void {
    this.token = null;
    this.profile = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  getCachedProfile(): UserProfile | null {
    return this.profile;
  }

  setCachedProfile(profile: UserProfile): void {
    this.profile = profile;
  }

  hasRole(role: string): boolean {
    return this.profile?.roles?.includes(role) ?? false;
  }
}
