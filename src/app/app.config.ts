import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthService } from './services/auth.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApiService } from './services/api.service';

import { routes } from './app.routes';
import {take} from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    ApiService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};

export function initializeAuth(authService: AuthService) {
  return () => {
    // Возвращаем Promise, который резолвится когда аутентификация инициализирована
    return new Promise<void>((resolve) => {
      if (authService.isInitialized()) {
        resolve();
      } else {
        authService.initialized$.pipe(take(1)).subscribe(() => {
          resolve();
        });
      }
    });
  };
}


