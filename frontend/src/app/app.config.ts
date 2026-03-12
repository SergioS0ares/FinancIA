import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import {
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  SOCIAL_AUTH_CONFIG
} from '@abacritt/angularx-social-login';

// Internacionalização básica em pt-BR para o Angular
import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';

// Registra a localidade "pt" para o Angular
registerLocaleData(pt);

const googleClientId = '48867302798-cu3d9mpbmlmt9hepff9oc7cjqjs22fiq.apps.googleusercontent.com';

export const appConfig: ApplicationConfig = {
  providers: [
    // Provedores existentes
    provideRouter(routes),
    provideAnimations(),
    provideToastr(),
    provideHttpClient(withFetch()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    // Login com Google
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(googleClientId)
          }
        ],
        onError: (err: unknown) => console.error(err)
      } as SocialAuthServiceConfig
    },

    // Localização em português do Brasil para pipes de data, moeda etc.
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ]
};
