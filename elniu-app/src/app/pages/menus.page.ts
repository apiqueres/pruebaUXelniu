import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogoService } from '../core/catalogo.service';
import { PrecioPipe } from '../shared/precio.pipe';
import { Revelar } from '../shared/revelar';

/* Los menus van escritos, como la carta de papel que se deja en la mesa: sin
   la foto del cartel y sin la pastilla de precio al lado del titulo. Cada uno
   se lee de arriba abajo y cierra con lo que cuesta.

   El menu de empresas se queda tal cual estaba (disponibilidad, lo que incluye
   y la condicion de pedirlo por WhatsApp); lo unico que ha perdido es la foto,
   igual que el resto. */
@Component({
  selector: 'niu-menus',
  imports: [RouterLink, PrecioPipe, Revelar],
  template: `
    <section class="hoja hoja--menus">
      <div class="contenido contenido--estrecho">
        <p class="antetitulo entra">Menús</p>
        <h1 class="titular entra">Cada día</h1>

        <div class="lista">
          @for (m of fijos(); track m.id; let i = $index) {
            <article class="menu" [revelar]="i * 70">
              <header class="menu__cabecera">
                <h2 class="menu__nombre">{{ m.nombre }}</h2>
                <p class="menu__cuando etiqueta">{{ m.disponibilidad }}</p>
              </header>

              @if (m.incluye.length) {
                <ul class="incluye">
                  @for (x of m.incluye; track x) {
                    <li>{{ x }}</li>
                  }
                </ul>
              }

              @if (m.apartados.length) {
                <div class="apartados">
                  @for (a of m.apartados; track a.titulo) {
                    <section class="apartado">
                      <h3 class="apartado__titulo etiqueta">{{ a.titulo }}</h3>
                      <ul class="apartado__opciones">
                        @for (o of a.opciones; track o) {
                          <li>{{ o }}</li>
                        }
                      </ul>
                    </section>
                  }
                </div>
              }

              <!-- El precio cierra el menu, como en la carta impresa. Cuando
                   no lo hay (el de empresas se cierra con cada grupo) manda el
                   texto, y no una cifra grande en blanco. -->
              <div class="precio">
                @if (m.precio !== null) {
                  <span class="precio__cifra">{{ m.precio | precio }}</span>
                  <span class="precio__nota">{{ m.disponibilidad }}</span>
                } @else {
                  <span class="precio__texto">{{ m.precioNota || 'A consultar' }}</span>
                }
              </div>

              @if (m.condiciones.length) {
                <ul class="condiciones">
                  @for (c of m.condiciones; track c) {
                    <li>{{ c }}</li>
                  }
                </ul>
              }
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
      gap: 16px;
      margin-top: 30px;
    }

    .menu {
      padding: 28px 24px;
      border-radius: var(--pastilla);
      background: var(--arena-media);
    }

    .menu__cabecera {
      padding-bottom: 18px;
      border-bottom: 1px solid rgba(46, 46, 46, .14);
    }

    .menu__nombre {
      margin: 0;
      font-family: Anton, sans-serif;
      font-size: clamp(22px, 5vw, 32px);
      line-height: 1.05;
      text-transform: uppercase;
    }

    .menu__cuando { margin: 8px 0 0; opacity: .55; }

    .incluye {
      list-style: none;
      margin: 18px 0 0;
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

    /* Los apartados del menu del dia: primeros, segundos y postre. */
    .apartados {
      display: grid;
      grid-template-columns: 1fr;
      gap: 26px;
      margin-top: 26px;
    }

    .apartado__titulo {
      margin: 0 0 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(46, 46, 46, .14);
      color: var(--naranja);
      opacity: .85;
    }

    .apartado__opciones {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;

      li {
        font-size: 13px;
        line-height: 1.45;
        opacity: .85;
        text-wrap: pretty;
      }
    }

    .precio {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 6px 14px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid rgba(46, 46, 46, .14);
    }

    .precio__cifra {
      font-family: Anton, sans-serif;
      font-size: clamp(30px, 7vw, 42px);
      line-height: 1;
      color: var(--naranja);
    }

    .precio__nota {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .16em;
      text-transform: uppercase;
      opacity: .5;
    }

    .precio__texto {
      font-family: Anton, sans-serif;
      font-size: clamp(20px, 4vw, 26px);
      line-height: 1;
      text-transform: uppercase;
      color: var(--naranja);
    }

    .condiciones {
      list-style: none;
      margin: 16px 0 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;

      li {
        font-size: 11px;
        line-height: 1.6;
        opacity: .5;
        max-width: 56ch;
      }
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

    @media (min-width: 760px) {
      .menu { padding: 34px 34px; }
      .apartados { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; }
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
