import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogoService } from '../core/catalogo.service';
import { FotoPipe } from '../shared/foto.pipe';
import { Revelar } from '../shared/revelar';

@Component({
  selector: 'niu-eventos',
  imports: [RouterLink, FotoPipe, Revelar],
  template: `
    <section class="hoja hoja--eventos">
      <div class="contenido">
        <p class="antetitulo entra">Celebraciones</p>
        <h1 class="titular entra">Eventos</h1>

        <p class="entradilla intro entra-1">
          Salón para {{ restaurante().capacidad.salon }} personas y privado para
          {{ restaurante().capacidad.privado }}. Menús a medida para grupos, con la misma
          cocina de siempre.
        </p>

        <div class="rejilla">
          @for (e of eventos(); track e.id; let i = $index) {
            <article class="evento" [revelar]="i * 80">
              <div class="evento__foto">
                <img [src]="e.imagen | foto" [alt]="e.nombre" loading="lazy" decoding="async" />
              </div>
              <h2 class="evento__nombre">{{ e.nombre }}</h2>
              <p class="evento__texto">{{ e.descripcion }}</p>
            </article>
          }
        </div>

        <div class="llamada" revelar>
          <div>
            <h2 class="llamada__titulo">¿Organizamos la tuya?</h2>
            <p class="llamada__texto">
              Cuéntanos la fecha y cuántos sois y te preparamos una propuesta de menú
              sin compromiso.
            </p>
          </div>
          <div class="llamada__acciones">
            <a class="boton" routerLink="/reservar">Pedir presupuesto</a>
            <a class="boton boton--claro" [href]="'tel:+34' + restaurante().telefono">
              {{ telefonoBonito() }}
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    .hoja--eventos { background: var(--naranja); }

    .intro { margin: 22px 0 0; max-width: 46ch; }

    .rejilla {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
      gap: 20px;
      margin-top: 38px;
    }

    .evento__foto {
      border-radius: var(--pastilla);
      overflow: hidden;
      aspect-ratio: 4 / 3;
      box-shadow: 0 24px 50px rgba(0, 0, 0, .18);

      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 1.2s var(--suave);
      }
    }

    .evento:hover .evento__foto img { transform: scale(1.06); }

    .evento__nombre {
      margin: 18px 4px 0;
      font-family: Anton, sans-serif;
      font-size: clamp(19px, 2.6vw, 24px);
      line-height: 1.05;
      text-transform: uppercase;
    }

    .evento__texto {
      margin: 8px 4px 0;
      font-size: 13px;
      line-height: 1.55;
      opacity: .75;
      text-wrap: pretty;
    }

    .llamada {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 26px;
      margin-top: 40px;
      padding: 32px 28px;
      border-radius: var(--pastilla);
      background: var(--tinta);
      color: var(--arena);
    }

    .llamada__titulo {
      margin: 0;
      font-family: Anton, sans-serif;
      font-size: clamp(22px, 4vw, 32px);
      text-transform: uppercase;
    }

    .llamada__texto {
      margin: 10px 0 0;
      font-size: 13px;
      line-height: 1.6;
      opacity: .65;
      max-width: 44ch;
    }

    .llamada__acciones { display: flex; flex-wrap: wrap; gap: 10px; }
  `,
})
export class EventosPage {
  private readonly servicio = inject(CatalogoService);

  readonly restaurante = this.servicio.restaurante;
  readonly eventos = this.servicio.eventos;

  /** «961700872» se lee mejor partido en «961 700 872». */
  telefonoBonito(): string {
    return this.restaurante().telefono.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
}
