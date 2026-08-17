import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogoService } from '../core/catalogo.service';
import { FotoPipe } from '../shared/foto.pipe';
import { PrecioPipe } from '../shared/precio.pipe';
import { Revelar } from '../shared/revelar';

@Component({
  selector: 'niu-menus',
  imports: [RouterLink, FotoPipe, PrecioPipe, Revelar],
  template: `
    <section class="hoja hoja--menus">
      <div class="contenido contenido--estrecho">
        <p class="antetitulo entra">Menús</p>
        <h1 class="titular entra">Cada día</h1>

        <div class="lista">
          @for (m of fijos(); track m.id; let i = $index) {
            <article class="menu" [revelar]="i * 70">
              @if (m.imagen) {
                <img class="menu__foto" [src]="m.imagen | foto" [alt]="m.nombre" loading="lazy" />
              }

              <div class="menu__cuerpo">
                <div class="menu__encabezado">
                  <div>
                    <h2 class="menu__nombre">{{ m.nombre }}</h2>
                    <p class="menu__cuando etiqueta">{{ m.disponibilidad }}</p>
                  </div>
                  <div class="menu__precio">
                    {{ m.precio | precio: m.precioNota ?? 'A consultar' }}
                  </div>
                </div>

                @if (m.incluye.length) {
                  <ul class="incluye">
                    @for (x of m.incluye; track x) {
                      <li>{{ x }}</li>
                    }
                  </ul>
                }

                @for (a of m.apartados; track a.titulo) {
                  <div class="apartado">
                    <div class="apartado__titulo etiqueta">{{ a.titulo }}</div>
                    <div class="apartado__opciones">
                      @for (o of a.opciones; track o) {
                        <div>{{ o }}</div>
                      }
                    </div>
                  </div>
                }

                @for (c of m.condiciones; track c) {
                  <p class="menu__condicion">{{ c }}</p>
                }
              </div>
            </article>
          }
        </div>

        <!-- Menus de temporada ------------------------------------------- -->
        <section class="especiales" revelar>
          <h2 class="especiales__titulo">Menús de temporada</h2>
          <p class="especiales__intro">
            A lo largo del año preparamos menús cerrados para las fechas señaladas.
            Consúltanos el de la fecha que te interese.
          </p>

          <div class="fechas">
            @for (m of especiales(); track m.id) {
              <div class="fecha">
                <span class="fecha__nombre">{{ m.nombre }}</span>
                <span class="fecha__cuando">{{ m.disponibilidad }}</span>
              </div>
            }
          </div>

          <div class="especiales__acciones">
            <a class="boton" routerLink="/reservar">Consultar menú</a>
            <a class="boton boton--linea" [href]="whatsapp()" target="_blank" rel="noopener">
              WhatsApp
            </a>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    .hoja--menus { background: var(--arena-clara); }

    .lista {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 30px;
    }

    .menu {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 24px;
      border-radius: var(--pastilla);
      background: var(--arena-media);
    }

    .menu__foto {
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      border-radius: 1.6rem;
    }

    .menu__cuerpo { flex: 1; min-width: 0; }

    .menu__encabezado {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .menu__nombre {
      margin: 0;
      font-family: Anton, sans-serif;
      font-size: clamp(20px, 4vw, 28px);
      line-height: 1.05;
      text-transform: uppercase;
    }

    .menu__cuando { display: block; margin-top: 8px; opacity: .55; }

    .incluye {
      list-style: none;
      margin: 16px 0 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 7px;

      li {
        position: relative;
        padding-left: 18px;
        font-size: 13px;
        line-height: 1.5;
        opacity: .8;
      }

      li::before {
        content: '';
        position: absolute;
        left: 0;
        top: 8px;
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--naranja);
      }
    }

    .apartado { margin-top: 18px; }

    .apartado__titulo {
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(46, 46, 46, .14);
      opacity: .45;
    }

    .apartado__opciones {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 12px;
      font-size: 13px;
      line-height: 1.45;
      opacity: .85;
    }

    .menu__condicion {
      margin: 14px 0 0;
      font-size: 11px;
      line-height: 1.6;
      opacity: .5;
      max-width: 52ch;
    }

    .menu__precio {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 74px;
      height: 74px;
      padding: 0 18px;
      border-radius: 999px;
      background: var(--naranja);
      color: var(--blanco);
      font-family: Anton, sans-serif;
      font-size: 20px;
      white-space: nowrap;
    }

    /* ---- Temporada ---------------------------------------------------- */

    .especiales {
      margin-top: 22px;
      padding: 30px 26px;
      border-radius: var(--pastilla);
      background: var(--tinta);
      color: var(--arena);
    }

    .especiales__titulo {
      margin: 0;
      font-family: Anton, sans-serif;
      font-size: clamp(22px, 5vw, 32px);
      text-transform: uppercase;
    }

    .especiales__intro {
      margin: 12px 0 0;
      font-size: 13px;
      line-height: 1.6;
      opacity: .65;
      max-width: 52ch;
    }

    .fechas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
      gap: 10px;
      margin-top: 24px;
    }

    .fecha {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 16px 18px;
      border-radius: 1.4rem;
      background: rgba(255, 255, 255, .07);
    }

    .fecha__nombre {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
    }

    .fecha__cuando { font-size: 11px; line-height: 1.5; opacity: .55; }

    .especiales__acciones {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 26px;
    }

    /* En pantalla ancha la foto se pone al lado del texto en vez de encima:
       asi el menu ocupa menos alto y se ven varios de un vistazo. */
    @media (min-width: 720px) {
      .menu { flex-direction: row; align-items: stretch; gap: 26px; padding: 28px; }
      .menu__foto { width: 230px; aspect-ratio: 3 / 4; align-self: stretch; height: auto; }
      .menu__precio { min-width: 84px; height: 84px; font-size: 22px; }
    }
  `,
})
export class MenusPage {
  private readonly servicio = inject(CatalogoService);

  readonly fijos = this.servicio.menusFijos;
  readonly especiales = this.servicio.menusEspeciales;

  whatsapp(): string {
    return `https://wa.me/${this.servicio.restaurante().whatsapp}`;
  }
}
