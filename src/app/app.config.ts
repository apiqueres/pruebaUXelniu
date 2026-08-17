import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { CatalogoService } from './core/catalogo.service';
import { interceptorToken } from './core/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([interceptorToken])),
    provideRouter(
      routes,
      // Cada seccion es su propia pagina: al cambiar de ruta hay que volver
      // arriba, y al usar el boton «atras» recuperar donde estaba.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // Sin `withViewTransitions()`: la View Transition API abortaba en cada
      // navegacion y la entrada de cada pagina ya la hacen las clases `.entra`.
    ),
    // La carta se trae del servidor antes de pintar nada. Si el servidor no
    // responde, `inicializar` no lanza: la aplicacion arranca y lo dice.
    provideAppInitializer(() => inject(CatalogoService).inicializar()),
  ],
};
