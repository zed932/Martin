import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {take} from 'rxjs';

export const authGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ждем завершения инициализации
  if (!authService.isInitialized()) {
    await authService.initialized$.pipe(take(1)).toPromise();
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.navigate(['/auth/login']);
};

export const adminGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ждем завершения инициализации
  if (!authService.isInitialized()) {
    await authService.initialized$.pipe(take(1)).toPromise();
  }

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  return router.navigate(['/auth/login']);
};
