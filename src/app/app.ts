import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { CatalogoService } from './core/catalogo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly catalogo = inject(CatalogoService);

  readonly restaurante = this.catalogo.restaurante;

  private readonly url = signal(this.router.url);

  /* El panel de administracion no lleva la cabecera ni la barra del cliente:
     tiene su propia navegacion y necesita la pantalla entera. */
  readonly esAdmin = computed(() => this.url().startsWith('/admin'));

  readonly secciones = [
    { ruta: '/carta', etiqueta: 'Carta' },
    { ruta: '/menus', etiqueta: 'Menús' },
    { ruta: '/eventos', etiqueta: 'Eventos' },
    { ruta: '/reservar', etiqueta: 'Visítanos' },
  ];

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.url.set(e.urlAfterRedirects));
  }
}
