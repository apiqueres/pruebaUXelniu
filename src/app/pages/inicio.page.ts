import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogoService } from '../core/catalogo.service';
import { FotoPipe } from '../shared/foto.pipe';
import { PrecioPipe } from '../shared/precio.pipe';
import { Revelar } from '../shared/revelar';

@Component({
  selector: 'niu-inicio',
  imports: [RouterLink, FotoPipe, PrecioPipe, Revelar],
  template: `
    <section class="hero">
      <div class="hero__marca entra">
        <h1 class="hero__logo">
          <img src="assets/marca/logo-niu-sepia.png" alt="Restaurant el Niu" fetchpriority="high" />
        </h1>
        <p class="hero__lema etiqueta">
          Sueca · València · Des de {{ restaurante().desde }}
        </p>
      </div>

      <div class="hero__pie entra-2">
        <p class="entradilla hero__texto">{{ restaurante().presentacion[0] }}</p>
        <div class="hero__datos etiqueta">
          <span>{{ restaurante().direccion }}</span>
          <span>{{ restaurante().poblacion }}</span>
        </div>
      </div>
    </section>

    <!-- Destacados ------------------------------------------------------- -->
    <section class="hoja hoja--destacados">
      <div class="contenido">
        <div class="titulo-fila" revelar>
          <div>
            <p class="antetitulo">Lo que más nos piden</p>
            <h2 class="titular">Destacados</h2>
          </div>
          <a routerLink="/carta" class="circulo" aria-label="Ver la carta completa">
            Ver<br />carta
          </a>
        </div>

        <div class="rejilla">
          @for (p of destacados(); track p.id; let i = $index) {
            <article class="ficha" [revelar]="i * 70">
              <a routerLink="/carta" [fragment]="p.categoriaId" class="ficha__foto">
                <img
                  [src]="p.imagen | foto"
                  [alt]="p.nombre"
                  loading="lazy"
                  decoding="async"
                />
                <span class="ficha__velo"><span class="ficha__boton etiqueta">Ver plato</span></span>
              </a>
              <div class="ficha__linea">
                <span class="ficha__nombre">{{ p.nombre }}</span>
                <span class="ficha__precio">{{ p.precio | precio: p.precioNota ?? 'S/M' }}</span>
              </div>
              @if (p.descripcion) {
                <p class="ficha__nota">{{ p.descripcion }}</p>
              }
            </article>
          }
        </div>
      </div>
    </section>

    <!-- La casa ---------------------------------------------------------- -->
    <section class="hoja hoja--casa">
      <div class="contenido casa">
        <div class="casa__texto">
          <p class="antetitulo" revelar>Desde {{ restaurante().desde }}</p>
          <h2 class="titular" revelar>La casa</h2>
          @for (parrafo of restaurante().presentacion.slice(1); track $index) {
            <p class="entradilla casa__parrafo" [revelar]="60 * $index">{{ parrafo }}</p>
          }
          <div class="casa__cifras" revelar>
            <div>
              <strong>{{ restaurante().capacidad.salon }}</strong>
              <span class="etiqueta">plazas en el salón</span>
            </div>
            <div>
              <strong>{{ restaurante().capacidad.privado }}</strong>
              <span class="etiqueta">en el privado</span>
            </div>
          </div>
        </div>

        <figure class="casa__foto" revelar>
          <img
            src="assets/inicio/acreditacion-paella.jpg"
            alt="Acreditación del Ayuntamiento de Sueca a la paella valenciana del Niu"
            loading="lazy"
            decoding="async"
          />
          <figcaption class="etiqueta">
            Receta oficial del Concurs Internacional de Paellas de Sueca
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Accesos ---------------------------------------------------------- -->
    <section class="hoja hoja--accesos">
      <div class="contenido">
        <h2 class="titular titular--claro" revelar>Sigue</h2>
        <div class="accesos">
          @for (a of accesos; track a.ruta) {
            <a [routerLink]="a.ruta" class="acceso" [revelar]="$index * 80">
              <span class="acceso__nombre">{{ a.nombre }}</span>
              <span class="acceso__nota">{{ a.nota }}</span>
              <span class="acceso__flecha" aria-hidden="true">&#8594;</span>
            </a>
          }
        </div>

        <div class="pie" revelar>
          <span class="etiqueta">© {{ hoy }} {{ restaurante().nombre }}</span>
          <a [href]="restaurante().mapa" target="_blank" rel="noopener" class="etiqueta"
            >{{ restaurante().direccion }} · {{ restaurante().poblacion }}</a
          >
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    /* ---- Hero -------------------------------------------------------- */

    .hero {
      position: relative;
      min-height: 100svh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 40px;
      padding: 110px clamp(16px, 4vw, 40px) 120px;
    }

    .hero__marca {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-top: auto;
    }

    .hero__logo {
      margin: 0;
      line-height: 0;

      img { display: block; width: min(88vw, 560px); height: auto; }
    }

    .hero__lema {
      margin: 20px 0 0;
      letter-spacing: .4em;
      opacity: .7;
      text-align: center;
    }

    .hero__pie {
      display: grid;
      gap: 20px;
      max-width: 1100px;
      width: 100%;
      margin: 0 auto;
    }

    .hero__texto { margin: 0; max-width: 46ch; }

    .hero__datos {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      opacity: .6;
    }

    /* ---- Paneles ----------------------------------------------------- */

    .hoja--destacados { background: var(--arena-media); }
    .hoja--casa { background: var(--arena-clara); margin-top: -4rem; }
    .hoja--accesos {
      background: var(--tinta);
      color: var(--arena);
      margin-top: -4rem;
      min-height: auto;
    }

    .titular--claro { color: var(--arena); }

    .titulo-fila {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 34px;
    }

    .circulo {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 92px;
      height: 92px;
      border-radius: 999px;
      background: var(--naranja);
      color: var(--blanco);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: .2em;
      text-transform: uppercase;
      line-height: 1.5;
      transition: transform .5s var(--suave);

      &:hover { transform: scale(1.07); }
    }

    /* ---- Fichas de plato --------------------------------------------- */

    .rejilla {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
      gap: 18px;
    }

    .ficha__foto {
      position: relative;
      display: block;
      aspect-ratio: 4 / 5;
      border-radius: var(--pastilla);
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, .18);

      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 1.2s var(--suave);
      }

      &:hover img { transform: scale(1.09); }
      &:hover .ficha__velo { opacity: 1; }
      &:hover .ficha__boton { transform: translateY(0); }
    }

    .ficha__velo {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 20px;
      background: rgba(46, 46, 46, .45);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      opacity: 0;
      transition: opacity 1.2s var(--suave);
    }

    .ficha__boton {
      transform: translateY(32px);
      transition: transform 1.2s var(--suave);
      padding: 12px 20px;
      border-radius: 999px;
      background: var(--arena-clara);
      color: var(--tinta);
    }

    .ficha__linea {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 8px 0;
      font-size: 13px;
      font-weight: 700;
    }

    .ficha__nombre { letter-spacing: .02em; }
    .ficha__precio { flex: none; opacity: .6; }

    .ficha__nota {
      margin: 4px 8px 0;
      font-size: 12px;
      line-height: 1.5;
      opacity: .65;
    }

    /* ---- La casa ------------------------------------------------------ */

    .casa {
      display: grid;
      grid-template-columns: 1fr;
      gap: 36px;
      align-items: start;
    }

    .casa__parrafo { margin: 18px 0 0; max-width: 52ch; }

    .casa__cifras {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      margin-top: 32px;

      div { display: flex; flex-direction: column; gap: 4px; }
      strong { font-family: Anton, sans-serif; font-size: 44px; line-height: 1; }
      span { opacity: .55; }
    }

    .casa__foto {
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;

      img {
        width: 100%;
        border-radius: var(--pastilla);
        aspect-ratio: 4 / 3;
        object-fit: cover;
        box-shadow: 0 24px 48px rgba(0, 0, 0, .16);
      }

      figcaption { opacity: .5; line-height: 1.6; }
    }

    /* ---- Accesos ------------------------------------------------------ */

    .accesos {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 32px;
    }

    .acceso {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 6px 18px;
      padding: 24px 26px;
      border-radius: var(--pastilla);
      background: rgba(255, 255, 255, .07);
      transition: background .4s var(--suave), transform .4s var(--suave);

      &:hover {
        background: var(--naranja);
        transform: translateX(6px);
      }
    }

    .acceso__nombre {
      font-family: Anton, sans-serif;
      font-size: clamp(22px, 4vw, 30px);
      text-transform: uppercase;
    }

    .acceso__nota {
      grid-column: 1;
      font-size: 12px;
      line-height: 1.5;
      opacity: .65;
    }

    .acceso__flecha {
      grid-row: 1 / span 2;
      grid-column: 2;
      font-size: 26px;
      opacity: .7;
    }

    .pie {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 14px;
      margin-top: 44px;
      padding-top: 22px;
      border-top: 1px solid rgba(255, 255, 255, .14);
      opacity: .4;
    }

    /* ---- Escritorio --------------------------------------------------- */

    @media (min-width: 860px) {
      .casa { grid-template-columns: 1.15fr .85fr; gap: 56px; }
      .accesos { grid-template-columns: repeat(3, 1fr); }
      .acceso { align-content: center; }
    }

    @media (max-width: 520px) {
      .circulo { width: 74px; height: 74px; font-size: 8px; }
      .titulo-fila { margin-bottom: 26px; }

      /* Las fotos pierden protagonismo en el movil. En vertical, el 4/5 de
         escritorio se comia casi media pantalla por plato y obligaba a
         desfilar seis pantallazos de foto antes de llegar a nada mas. */
      .ficha__foto { aspect-ratio: 16 / 10; border-radius: 1.8rem; }
      .casa__foto img { aspect-ratio: 16 / 10; border-radius: 1.8rem; }
      .rejilla { gap: 14px; }
    }
  `,
})
export class InicioPage {
  private readonly servicio = inject(CatalogoService);

  readonly restaurante = this.servicio.restaurante;
  readonly destacados = this.servicio.destacados;
  readonly hoy = new Date().getFullYear();

  readonly accesos = [
    { ruta: '/carta', nombre: 'La carta', nota: 'Arroces, carnes, pescados, pizzas y postres.' },
    { ruta: '/menus', nombre: 'Menús', nota: 'Diario, fin de semana, empresas y temporada.' },
    { ruta: '/eventos', nombre: 'Eventos', nota: 'Comuniones, bautizos y celebraciones.' },
  ];
}
