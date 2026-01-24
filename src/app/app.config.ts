import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { AuthService } from './core/services/auth.service';

// Factory function to initialize auth before app starts
export function initializeAuth(authService: AuthService) {
  return () => {
    console.log('APP_INITIALIZER: Starting auth initialization');
    return authService.waitForInitialization().then(() => {
      console.log('APP_INITIALIZER: Auth initialization complete');
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withJsonpSupport()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};
