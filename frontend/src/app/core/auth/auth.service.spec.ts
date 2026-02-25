import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('should login and store token', () => {
    service.login('admin@local', 'Admin123!').subscribe((res) => {
      expect(res.accessToken).toBe('jwt-token');
      expect(service.getToken()).toBe('jwt-token');
      expect(service.isAuthenticated()).toBe(true);
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/auth/login') && r.method === 'POST');
    expect(req.request.body).toEqual({ email: 'admin@local', password: 'Admin123!' });
    req.flush({ accessToken: 'jwt-token', tokenType: 'Bearer', expiresInSeconds: 3600 });
  });

  it('getProfile should call /api/auth/me', () => {
    service.setToken('token');
    service.getProfile().subscribe((p) => {
      expect(p?.email).toBe('admin@local');
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/auth/me') && r.method === 'GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush({ id: 1, email: 'admin@local', roles: ['ADMIN'] });
  });

  it('logout clears token', () => {
    service.setToken('x');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
