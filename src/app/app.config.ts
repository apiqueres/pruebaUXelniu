import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { CatalogoService } from './core/catalogo.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      // Cada seccion es ahora su propia pagina: al cambiar de ruta hay que
      // volver arriba, y al usar el boton «atras» recuperar donde estaba.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // Sin `withViewTransitions()`: la View Transition API abortaba en cada
      // navegacion («Transition was aborted because of invalid state») y la
      // entrada de cada pagina ya la hacen las clases `.entra` del CSS.
    ),
    // La carta se carga una sola vez antes de pintar nada, asi ninguna pagina
    // tiene que lidiar con el estado «todavia no hay datos».
    provideAppInitializer(() => inject(CatalogoService).inicializar()),
  ],
};
