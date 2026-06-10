import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding }
  from '@angular/router';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { provideAnimationsAsync }
  from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { routes } from './app.routes';
import { authInterceptor }
  from './core/interceptors/auth-interceptor';

// Enregistrer la locale française pour les pipes date/number
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    // Routes
    provideRouter(routes, withComponentInputBinding()),

    // HTTP + interceptor JWT
    provideHttpClient(withInterceptors([authInterceptor])),

    // Animations
    provideAnimationsAsync(),

    // Locale française → date en français, séparateur MAD
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
};
