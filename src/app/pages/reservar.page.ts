import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CatalogoService } from '../core/catalogo.service';
import { FotoPipe } from '../shared/foto.pipe';
import { Revelar } from '../shared/revelar';

@Component({
  selector: 'niu-reservar',
  imports: [FormsModule, FotoPipe, Revelar],
  template: `
    <section class="hoja hoja--reservar">
      <div class="contenido">
        <p class="antetitulo entra">Visítanos</p>
        <h1 class="titular titular--claro entra">Reserva</h1>

        <div class="columnas">
          <!-- Peticion de reserva ---------------------------------------- -->
          <div class="bloque entra-1">
            <p class="entradilla bloque__intro">
              Reserva por teléfono o por WhatsApp y te confirmamos al momento. También
              puedes dejarnos la petición aquí.
            </p>

            <div class="directo">
              <a class="boton boton--claro" [href]="'tel:+34' + restaurante().telefono">
                {{ telefonoBonito() }}
              </a>
              <a class="boton" [href]="whatsapp()" target="_blank" rel="noopener">WhatsApp</a>
            </div>

            <form class="formulario" (ngSubmit)="enviar()">
              <div class="formulario__fila">
                <label class="campo">
                  <span>Nombre</span>
                  <input name="nombre" [(ngModel)]="nombre" required autocomplete="name" />
                </label>
                <label class="campo">
                  <span>Teléfono</span>
                  <input name="telefono" [(ngModel)]="telefono" required autocomplete="tel" />
                </label>
              </div>

              <div class="formulario__fila">
                <label class="campo">
                  <span>Día</span>
                  <input type="date" name="dia" [(ngModel)]="dia" required />
                </label>
                <label class="campo">
                  <span>Hora</span>
                  <input type="time" name="hora" [(ngModel)]="hora" required />
                </label>
                <label class="campo campo--corto">
                  <span>Personas</span>
                  <input type="number" name="personas" min="1" max="100" [(ngModel)]="personas" />
                </label>
              </div>

              <label class="campo">
                <span>Comentario</span>
                <textarea
                  name="comentario"
                  [(ngModel)]="comentario"
                  placeholder="Alergias, trona, celebración..."
                ></textarea>
              </label>

              <button type="submit" class="boton" [disabled]="!completo()">
                {{ enviado() ? '¡Gracias! Te llamamos' : 'Pedir reserva' }}
              </button>

              @if (enviado()) {
                <p class="apunte" role="status">
                  Esto es una maqueta: todavía no hay servidor detrás, así que la petición
                  no sale del navegador. Para reservar en firme, llámanos o escríbenos por
                  WhatsApp.
                </p>
              }
            </form>
          </div>

          <!-- Datos de la casa ------------------------------------------- -->
          <div class="bloque entra-2">
            <div class="datos">
              <div class="dato">
                <span class="etiqueta dato__clave">Dónde</span>
                <a [href]="restaurante().mapa" target="_blank" rel="noopener" class="dato__valor">
                  {{ restaurante().direccion }}<br />{{ restaurante().poblacion }}
                </a>
              </div>

              <div class="dato">
                <span class="etiqueta dato__clave">Horario</span>
                <div class="horarios">
                  @for (h of restaurante().horarios; track h.dias) {
                    <div class="horario" [class.horario--cerrado]="h.cerrado">
                      <span class="horario__dias">{{ h.dias }}</span>
                      @if (h.cerrado) {
                        <span class="horario__turno">Cerrado</span>
                      } @else {
                        @for (t of h.turnos; track t) {
                          <span class="horario__turno">{{ t }}</span>
                        }
                      }
                    </div>
                  }
                </div>
              </div>

              <div class="dato">
                <span class="etiqueta dato__clave">Síguenos</span>
                <div class="redes">
                  <a [href]="restaurante().instagram" target="_blank" rel="noopener" class="boton boton--linea">Instagram</a>
                  <a [href]="restaurante().facebook" target="_blank" rel="noopener" class="boton boton--linea">Facebook</a>
                </div>
              </div>
            </div>

            <div class="mosaico" revelar>
              @for (f of mosaico(); track f.id) {
                <img [src]="f.imagen | foto" [alt]="f.titulo" loading="lazy" decoding="async" />
              }
            </div>
          </div>
        </div>

        <div class="pie" revelar>
          <span class="etiqueta">© {{ hoy }} {{ restaurante().nombre }}</span>
          <span class="etiqueta">Aviso legal · Cookies · Privacidad</span>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    .hoja--reservar { background: var(--tinta); color: var(--arena); }
    .titular--claro { color: var(--arena); }

    .columnas {
      display: grid;
      grid-template-columns: 1fr;
      gap: 44px;
      margin-top: 34px;
    }

    .bloque__intro { margin: 0 0 22px; opacity: .75; max-width: 40ch; }

    .directo { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; }

    .formulario { display: flex; flex-direction: column; gap: 16px; }

    .formulario__fila {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
      gap: 14px;
    }

    .campo--corto { max-width: 160px; }

    /* Los campos van sobre fondo oscuro: se invierte la piel clara del
       sistema para que no den un salto de brillo en medio del panel. */
    .campo > span { opacity: .45; }

    .campo input,
    .campo textarea {
      background: rgba(255, 255, 255, .06);
      border-color: rgba(255, 255, 255, .16);
      color: var(--arena);

      &::placeholder { color: rgba(222, 219, 214, .35); }
      &:focus { border-color: var(--naranja); background: rgba(255, 255, 255, .1); }
    }

    /* El icono del selector de fecha y hora es negro sobre negro en Chromium. */
    .campo input::-webkit-calendar-picker-indicator { filter: invert(1); opacity: .5; }

    .formulario .boton { align-self: flex-start; }

    .apunte {
      margin: 0;
      font-size: 11px;
      line-height: 1.6;
      opacity: .5;
      max-width: 46ch;
    }

    /* ---- Datos --------------------------------------------------------- */

    .datos { display: flex; flex-direction: column; gap: 26px; }

    .dato { display: flex; flex-direction: column; gap: 10px; }

    .dato__clave { opacity: .4; }

    .dato__valor {
      font-size: 15px;
      line-height: 1.6;
      opacity: .9;

      &:hover { color: var(--naranja); }
    }

    .horarios { display: flex; flex-direction: column; gap: 14px; }

    .horario {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 6px 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, .12);
    }

    .horario__dias {
      flex: 1 1 160px;
      font-size: 13px;
      line-height: 1.4;
      opacity: .85;
    }

    .horario__turno {
      font-family: Anton, sans-serif;
      font-size: 15px;
      letter-spacing: .02em;
    }

    .horario--cerrado .horario__turno { color: var(--naranja); }

    .redes { display: flex; flex-wrap: wrap; gap: 10px; }

    .mosaico {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 30px;

      img {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 1.2rem;
      }
    }

    .pie {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 14px;
      margin-top: 48px;
      padding-top: 22px;
      border-top: 1px solid rgba(255, 255, 255, .14);
      opacity: .35;
    }

    @media (min-width: 900px) {
      .columnas { grid-template-columns: 1.1fr .9fr; gap: 60px; }
    }
  `,
})
export class ReservarPage {
  private readonly servicio = inject(CatalogoService);

  readonly restaurante = this.servicio.restaurante;
  readonly hoy = new Date().getFullYear();

  readonly nombre = signal('');
  readonly telefono = signal('');
  readonly dia = signal('');
  readonly hora = signal('');
  readonly personas = signal<number | null>(2);
  readonly comentario = signal('');
  readonly enviado = signal(false);

  readonly completo = computed(
    () => !!this.nombre().trim() && !!this.telefono().trim() && !!this.dia() && !!this.hora(),
  );

  /** Seis fotos de la galeria como retrato del comedor. */
  readonly mosaico = computed(() => this.servicio.galeria().slice(0, 6));

  telefonoBonito(): string {
    return this.restaurante().telefono.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  whatsapp(): string {
    return `https://wa.me/${this.restaurante().whatsapp}`;
  }

  enviar(): void {
    if (!this.completo()) return;
    // Sin backend todavia: se acusa recibo y se recuerda el canal real.
    this.enviado.set(true);
  }
}
