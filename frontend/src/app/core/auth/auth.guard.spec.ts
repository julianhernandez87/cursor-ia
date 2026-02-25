import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should allow when authenticated', () => {
    auth.isAuthenticated.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', () => {
    auth.isAuthenticated.and.returnValue(false);
    TestBed.runInInjectionContext(() => authGuard(null!, null!));
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
