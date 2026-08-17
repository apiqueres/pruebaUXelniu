import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogoService } from '../core/catalogo.service';
import { ReservasService } from '../core/reservas.service';
import { AutenticacionService } from '../core/autenticacion.service';
import { AdminProductos } from './admin-productos';
import { AdminMenus } from './admin-menus';
import { AdminCategorias } from './admin-categorias';
import { AdminReservas } from './admin-reservas';
import { LoginPage } from './login.page';

type Pestana = 'reservas' | 'productos' | 'menus' | 'categorias';

@Component({
  selector: 'niu-admin',
  imports: [RouterLink, AdminProductos, AdminMenus, AdminCategorias, AdminReservas, LoginPage],
  template: `
    @if (!identificado()) {
      <niu-login />
    } @else {
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
              <!-- Las peticiones sin resolver se cantan desde la pestaña, para
                   que no haga falta entrar a mirar si hay algo esperando. -->
              @if (p.id === 'reservas' && pendientes().length) {
                <span class="aviso">{{ pendientes().length }}</span>
              }
            </button>
          }
        </nav>

        <button type="button" class="boton boton--linea restaurar" (click)="salir()">
          Salir
        </button>
      </header>

      <p class="apunte">
        Conectado como <strong>{{ usuario() }}</strong
        >. Los cambios se guardan en el servidor y se ven al momento en la web.
      </p>

      <main class="lienzo">
        @switch (pestana()) {
          @case ('reservas') {
            <niu-admin-reservas />
          }
          @case ('productos') {
            <niu-admin-productos />
          }
          @case ('menus') {
            <niu-admin-menus />
          }
          @case ('categorias') {
            <niu-admin-categorias />
          }
        }
      </main>
    </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

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

    .barra-admin__marca {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-right: auto;
    }

    .volver {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      font-size: 17px;
      transition: background 0.3s var(--suave);

      &:hover {
        background: var(--naranja);
      }
    }

    .titulo {
      display: block;
      font-family: Anton, sans-serif;
      font-size: 19px;
      text-transform: uppercase;
      line-height: 1.1;
    }

    .sub {
      display: block;
      margin-top: 3px;
      opacity: 0.45;
    }

    .pestanas {
      display: flex;
      gap: 2px;
      padding: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
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
      letter-spacing: 0.18em;
      text-transform: uppercase;
      transition:
        background 0.3s var(--suave),
        color 0.3s var(--suave);
    }

    .pestana--activa {
      background: var(--arena);
      color: var(--tinta);
    }

    .aviso {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 17px;
      height: 17px;
      margin-left: 7px;
      padding: 0 5px;
      border-radius: 999px;
      background: var(--naranja);
      color: var(--blanco);
      font-size: 9px;
      letter-spacing: 0;
      vertical-align: middle;
    }

    .restaurar {
      color: var(--arena);
      padding: 11px 18px;
    }

    .apunte {
      margin: 14px 6px 22px;
      font-size: 11px;
      line-height: 1.6;
      opacity: 0.5;
      max-width: 70ch;
    }

    @media (max-width: 720px) {
      .barra-admin__marca {
        margin-right: 0;
        width: 100%;
      }
      .pestanas {
        width: 100%;
      }
      .restaurar {
        width: 100%;
      }
    }
  `,
})
export class AdminPage {
  private readonly servicio = inject(CatalogoService);
  private readonly reservasServicio = inject(ReservasService);
  private readonly auth = inject(AutenticacionService);

  readonly restaurante = this.servicio.restaurante;
  readonly pendientes = this.reservasServicio.pendientes;
  readonly identificado = this.auth.identificado;
  readonly usuario = this.auth.usuario;

  /* Se abre por reservas y no por la carta: las peticiones caducan y los
     platos no. */
  readonly pestana = signal<Pestana>('reservas');

  readonly pestanas: { id: Pestana; etiqueta: string }[] = [
    { id: 'reservas', etiqueta: 'Reservas' },
    { id: 'productos', etiqueta: 'Platos y bebidas' },
    { id: 'menus', etiqueta: 'Menús' },
    { id: 'categorias', etiqueta: 'Categorías' },
  ];

  constructor() {
    /* Las reservas solo se piden cuando hay sesion, y se vuelven a pedir al
       entrar: el efecto cubre tanto el caso de llegar con el token ya guardado
       como el de acabar de escribir la clave. */
    effect(() => {
      if (this.identificado()) {
        void this.reservasServicio.cargar();
      }
    });
  }

  salir(): void {
    this.auth.salir();
  }
}
