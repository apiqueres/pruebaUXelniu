import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { CatalogoService } from '../core/catalogo.service';
import type { TipoCategoria } from '../core/modelos';
import { PrecioPipe } from '../shared/precio.pipe';
import { Revelar } from '../shared/revelar';

@Component({
  selector: 'niu-carta',
  imports: [PrecioPipe, Revelar],
  template: `
    <section class="hoja hoja--carta">
      <div class="contenido contenido--estrecho">
        <p class="antetitulo entra">Carta online</p>
        <h1 class="titular entra">La carta</h1>

        <!-- Tres cartas distintas: cocina, postres y bodega. Repartirlas en
             pestanas evita una tira de veintiuna categorias. -->
        <div class="pestanas entra-1" role="tablist">
          @for (t of tipos; track t.id) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="tipo() === t.id"
              class="pestana"
              [class.pestana--activa]="tipo() === t.id"
              (click)="cambiarTipo(t.id)"
            >
              {{ t.etiqueta }}
            </button>
          }
        </div>

        <div class="chips entra-2">
          <button
            type="button"
            class="chip"
            [class.chip--activo]="categoriaActiva() === null"
            (click)="categoriaActiva.set(null)"
          >
            Todo
          </button>
          @for (c of categoriasVisibles(); track c.id) {
            <button
              type="button"
              class="chip"
              [class.chip--activo]="categoriaActiva() === c.id"
              (click)="categoriaActiva.set(c.id)"
            >
              {{ c.nombre }}
            </button>
          }
        </div>

        <div class="grupos">
          @for (g of grupos(); track g.categoria.id) {
            <section class="grupo" [id]="g.categoria.id" revelar>
              <header class="grupo__cabecera">
                <h2 class="grupo__titulo">{{ g.categoria.nombre }}</h2>
                <span class="grupo__cuenta etiqueta">{{ g.platos.length }}</span>
              </header>

              @if (g.categoria.nota) {
                <p class="grupo__nota">{{ g.categoria.nota }}</p>
              }

              <ul class="platos">
                @for (p of g.platos; track p.id) {
                  <!-- La carta va sin fotos a peticion del cliente: se lee
                       como una carta de papel. Las imagenes siguen guardadas
                       en cada plato (y se ven en los destacados de la
                       portada), asi que volver a sacarlas aqui es reponer el
                       <img> que habia en este punto. -->
                  <li class="plato">
                    <div class="plato__texto plato__texto--crece">
                      <div class="plato__nombre">
                        {{ p.nombre }}
                        @if (p.unidad) {
                          <span class="plato__unidad">{{ p.unidad }}</span>
                        }
                      </div>
                      @if (p.descripcion) {
                        <p class="plato__descripcion">{{ p.descripcion }}</p>
                      }
                      @if (p.distintivos.length) {
                        <div class="plato__marcas">
                          @for (d of p.distintivos; track d) {
                            <span class="marca-plato">{{ d }}</span>
                          }
                        </div>
                      }
                    </div>
                    <div class="plato__precio">
                      {{ p.precio | precio: p.precioNota ?? 'S/M' }}
                    </div>
                  </li>
                }
              </ul>
            </section>
          } @empty {
            <p class="vacio">No hay platos en esta categoría todavía.</p>
          }
        </div>

        <p class="aviso" revelar>
          {{ aviso() }}
          <br />
          Precios con IVA incluido.
        </p>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    .hoja--carta { background: var(--arena-media); }

    .pestanas {
      display: flex;
      gap: 4px;
      margin: 28px 0 18px;
      padding: 5px;
      border-radius: 999px;
      background: rgba(46, 46, 46, .07);
      width: fit-content;
      max-width: 100%;
      overflow-x: auto;
    }

    .pestana {
      flex: none;
      border: 0;
      cursor: pointer;
      padding: 11px 20px;
      border-radius: 999px;
      background: transparent;
      color: var(--tinta);
      font-family: Inter, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .2em;
      text-transform: uppercase;
      transition: background .3s var(--suave), color .3s var(--suave);
    }

    .pestana--activa { background: var(--tinta); color: var(--arena-clara); }

    .chips {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 4px 0 20px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;

      &::-webkit-scrollbar { display: none; }
    }

    .chip {
      flex: none;
      border: 0;
      cursor: pointer;
      padding: 12px 18px;
      border-radius: 999px;
      background: var(--blanco);
      color: var(--tinta);
      font-family: Inter, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .2em;
      text-transform: uppercase;
      white-space: nowrap;
      transition: background .3s var(--suave), color .3s var(--suave);
    }

    .chip--activo { background: var(--naranja); color: var(--blanco); }

    .grupos { display: flex; flex-direction: column; gap: 14px; }

    .grupo {
      padding: 28px 24px;
      border-radius: var(--pastilla);
      background: var(--arena-clara);
      /* La cabecera fija mide 66 px: sin este margen el ancla dejaria el
         titulo del grupo escondido debajo. */
      scroll-margin-top: 84px;
    }

    .grupo__cabecera {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }

    .grupo__titulo {
      margin: 0;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .3em;
      text-transform: uppercase;
      color: var(--naranja);
    }

    .grupo__cuenta { opacity: .3; }

    .grupo__nota {
      margin: -6px 0 18px;
      font-size: 12px;
      line-height: 1.5;
      opacity: .6;
    }

    .platos {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .plato {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }

    .plato__texto { min-width: 0; }
    .plato__texto--crece { flex: 1; }

    .plato__nombre {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: .01em;
      text-wrap: pretty;
    }

    .plato__unidad {
      margin-left: 7px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      opacity: .4;
    }

    .plato__descripcion {
      margin: 3px 0 0;
      font-size: 12px;
      line-height: 1.45;
      opacity: .6;
      text-wrap: pretty;
    }

    .plato__marcas {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 7px;
    }

    .marca-plato {
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(226, 112, 30, .12);
      color: var(--naranja);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
    }

    .plato__precio {
      flex: none;
      font-family: Anton, sans-serif;
      font-size: 17px;
      letter-spacing: -.01em;
      white-space: nowrap;
    }

    .vacio, .aviso {
      margin: 22px 0 0;
      font-size: 11px;
      line-height: 1.6;
      opacity: .5;
      max-width: 52ch;
    }

    @media (min-width: 720px) {
      .grupo { padding: 34px 34px; }
      .plato__nombre { font-size: 15px; }
      .plato__descripcion { font-size: 13px; }
      .plato__precio { font-size: 19px; }
    }
  `,
})
export class CartaPage {
  private readonly servicio = inject(CatalogoService);
  private readonly ruta = inject(ActivatedRoute);

  readonly tipos: { id: TipoCategoria; etiqueta: string }[] = [
    { id: 'plato', etiqueta: 'Cocina' },
    { id: 'postre', etiqueta: 'Postres' },
    { id: 'bebida', etiqueta: 'Bodega' },
  ];

  readonly tipo = signal<TipoCategoria>('plato');
  readonly categoriaActiva = signal<string | null>(null);

  readonly categoriasVisibles = computed(() =>
    this.servicio.categorias().filter((c) => c.tipo === this.tipo()),
  );

  readonly grupos = computed(() => {
    const activa = this.categoriaActiva();
    return this.categoriasVisibles()
      .filter((c) => activa === null || c.id === activa)
      .map((categoria) => ({ categoria, platos: this.servicio.productosDe(categoria.id) }))
      .filter((g) => g.platos.length > 0);
  });

  readonly aviso = computed(() =>
    this.tipo() === 'bebida' ? this.servicio.avisos().bodega : this.servicio.avisos().alergenos,
  );

  constructor() {
    /* Al llegar desde un destacado de la portada («/carta#arroces-secos») hay
       que abrir la pestana de ese grupo, o el ancla apuntaria a un bloque que
       no esta pintado.

       Se escucha el fragmento en vez de leerlo del `snapshot` porque al ir de
       un ancla a otra Angular reutiliza este componente y el constructor ya no
       se vuelve a ejecutar. */
    this.ruta.fragment.pipe(takeUntilDestroyed()).subscribe((fragmento) => {
      if (!fragmento) return;

      const categoria = this.servicio.categoria(fragmento);
      if (!categoria) return;

      this.tipo.set(categoria.tipo);
      this.categoriaActiva.set(null);

      this.irAlGrupo(fragmento);
    });
  }

  /* Lleva la pantalla hasta el grupo del ancla.

     Espera a que el grupo exista, porque acaba de abrirse su pestana y Angular
     todavia no lo ha pintado. El salto es `instant` a proposito: el suave que
     hereda de `html { scroll-behavior: smooth }` se cancela en cuanto el
     router hace su restauracion de scroll, y el visitante se quedaba arriba. */
  private irAlGrupo(id: string, intentos = 25): void {
    const destino = document.getElementById(id);

    if (!destino) {
      if (intentos > 0) setTimeout(() => this.irAlGrupo(id, intentos - 1), 40);
      return;
    }

    destino.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  cambiarTipo(t: TipoCategoria): void {
    this.tipo.set(t);
    this.categoriaActiva.set(null);
  }
}
