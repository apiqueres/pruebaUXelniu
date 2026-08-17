import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogoService } from '../core/catalogo.service';
import { AdminProductos } from './admin-productos';
import { AdminMenus } from './admin-menus';
import { AdminCategorias } from './admin-categorias';

type Pestana = 'productos' | 'menus' | 'categorias';

@Component({
  selector: 'niu-admin',
  imports: [RouterLink, AdminProductos, AdminMenus, AdminCategorias],
  template: `
    <div class="admin">
      <header class="barra-admin">
        <div class="barra-admin__marca">
          <a routerLink="/" class="volver" aria-label="Volver a la web">&#8592;</a>
          <div>
            <span class="titulo">Administración</span>
            <span class="sub etiqueta">{{ restaurante().nombre }}</span>
          </div>
        </div>

        <nav class="pestanas" aria-label="Secciones de administración">
          @for (p of pestanas; track p.id) {
            <button
              type="button"
              class="pestana"
              [class.pestana--activa]="pestana() === p.id"
              (click)="pestana.set(p.id)"
            >
              {{ p.etiqueta }}
            </button>
          }
        </nav>

        <button type="button" class="boton boton--linea restaurar" (click)="restaurar()">
          {{ confirmandoRestaurar() ? '¿Seguro?' : 'Restaurar' }}
        </button>
      </header>

      <p class="apunte">
        Los cambios se guardan en este navegador. Cuando esté el servidor, pasarán a
        guardarse en la base de datos y se verán desde cualquier dispositivo.
      </p>

      <main class="lienzo">
        @switch (pestana()) {
          @case ('productos') { <niu-admin-productos /> }
          @case ('menus') { <niu-admin-menus /> }
          @case ('categorias') { <niu-admin-categorias /> }
        }
      </main>
    </div>
  `,
  styles: `
    :host { display: block; }

    .admin {
      min-height: 100svh;
      background: var(--arena-media);
      padding: 18px clamp(14px, 3vw, 40px) 60px;
    }

    .barra-admin {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      border-radius: 2rem;
      background: var(--tinta);
      color: var(--arena);
    }

    .barra-admin__marca { display: flex; align-items: center; gap: 14px; margin-right: auto; }

    .volver {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 999px;
      background: rgba(255, 255, 255, .1);
      font-size: 17px;
      transition: background .3s var(--suave);

      &:hover { background: var(--naranja); }
    }

    .titulo {
      display: block;
      font-family: Anton, sans-serif;
      font-size: 19px;
      text-transform: uppercase;
      line-height: 1.1;
    }

    .sub { display: block; margin-top: 3px; opacity: .45; }

    .pestanas {
      display: flex;
      gap: 2px;
      padding: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, .08);
      overflow-x: auto;
    }

    .pestana {
      flex: none;
      border: 0;
      cursor: pointer;
      padding: 10px 16px;
      border-radius: 999px;
      background: transparent;
      color: var(--arena);
      font-family: Inter, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .18em;
      text-transform: uppercase;
      transition: background .3s var(--suave), color .3s var(--suave);
    }

    .pestana--activa { background: var(--arena); color: var(--tinta); }

    .restaurar { color: var(--arena); padding: 11px 18px; }

    .apunte {
      margin: 14px 6px 22px;
      font-size: 11px;
      line-height: 1.6;
      opacity: .5;
      max-width: 70ch;
    }

    @media (max-width: 720px) {
      .barra-admin__marca { margin-right: 0; width: 100%; }
      .pestanas { width: 100%; }
      .restaurar { width: 100%; }
    }
  `,
})
export class AdminPage {
  private readonly servicio = inject(CatalogoService);

  readonly restaurante = this.servicio.restaurante;
  readonly pestana = signal<Pestana>('productos');
  readonly confirmandoRestaurar = signal(false);

  readonly pestanas: { id: Pestana; etiqueta: string }[] = [
    { id: 'productos', etiqueta: 'Platos y bebidas' },
    { id: 'menus', etiqueta: 'Menús' },
    { id: 'categorias', etiqueta: 'Categorías' },
  ];

  /* Restaurar borra el trabajo del cliente, asi que el primer clic solo avisa
     y el segundo ejecuta. */
  private temporizador?: ReturnType<typeof setTimeout>;

  async restaurar(): Promise<void> {
    if (!this.confirmandoRestaurar()) {
      this.confirmandoRestaurar.set(true);
      this.temporizador = setTimeout(() => this.confirmandoRestaurar.set(false), 4000);
      return;
    }
    clearTimeout(this.temporizador);
    this.confirmandoRestaurar.set(false);
    await this.servicio.restaurarSemilla();
  }
}
