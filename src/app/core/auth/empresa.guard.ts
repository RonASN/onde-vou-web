import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TipoUsuario } from '../models/user.model';

export const empresaGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const user = auth.currentUser();
  if (user && user.tipoUsuario !== TipoUsuario.Empresa) {
    return router.createUrlTree(['/']);
  }

  return true;
};
