import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { roleGuard } from './role.guard';
import { AuthService } from './auth.service';

describe('roleGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['getCachedProfile', 'getProfile', 'setCachedProfile', 'hasRole']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    route = { data: { roles: ['ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should allow when cached profile has ADMIN', () => {
    auth.getCachedProfile.and.returnValue({ id: 1, email: 'a@b.com', roles: ['ADMIN'] });
    auth.hasRole.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => roleGuard(route, null!));
    expect(result).toBe(true);
  });

  it('should redirect when cached profile lacks role', () => {
    auth.getCachedProfile.and.returnValue({ id: 1, email: 'a@b.com', roles: ['USER'] });
    auth.hasRole.and.returnValue(false);
    TestBed.runInInjectionContext(() => roleGuard(route, null!));
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
