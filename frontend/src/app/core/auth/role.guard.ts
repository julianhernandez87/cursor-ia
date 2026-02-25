import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = (route.data['roles'] as string[]) || ['ADMIN'];

  const profile = auth.getCachedProfile();
  if (profile) {
    const allowed = requiredRoles.some((r) => auth.hasRole(r));
    if (allowed) return true;
    router.navigate(['/']);
    return false;
  }

  return auth.getProfile().pipe(
    take(1),
    map((p) => {
      if (!p) {
        router.navigate(['/login']);
        return false;
      }
      auth.setCachedProfile(p);
      const allowed = requiredRoles.some((r) => p.roles?.includes(r));
      if (allowed) return true;
      router.navigate(['/']);
      return false;
    })
  );
};
