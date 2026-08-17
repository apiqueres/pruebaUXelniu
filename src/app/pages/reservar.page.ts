import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CatalogoService } from '../core/catalogo.service';
import { ReservasService } from '../core/reservas.service';
import { fechaLarga, hoyIso } from '../core/fechas';
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
              Déjanos la petición y te confirmamos la mesa por teléfono o correo. Si
              es para hoy o para dentro de un rato, mejor llámanos.
            </p>

            <div class="directo">
              <a class="boton boton--claro" [href]="'tel:+34' + restaurante().telefono">
                {{ telefonoBonito() }}
              </a>
              <a class="boton" [href]="whatsapp()" target="_blank" rel="noopener">WhatsApp</a>
            </div>

            @if (enviada(); as r) {
              <div class="acuse" role="status">
                <p class="acuse__titulo">Petición recibida</p>
                <p class="acuse__resumen">
                  {{ r.personas }} {{ r.personas === 1 ? 'persona' : 'personas' }} el
                  {{ diaLargo(r.dia) }} a las {{ r.hora }}, a nombre de {{ r.nombre }}.
                </p>
                <p class="acuse__nota">
                  Queda pendiente de que la casa la confirme. Te avisaremos al
                  {{ r.telefono }} o a {{ r.email }}.
                </p>
                <p class="acuse__aviso">
                  Esto es una maqueta: la petición se guarda en este navegador y todavía
                  no llega al restaurante. Para reservar en firme, llámanos.
                </p>
                <button type="button" class="boton boton--claro" (click)="otra()">
                  Pedir otra
                </button>
              </div>
            } @else {
              <form class="formulario" (ngSubmit)="enviar()">
                <label class="campo">
                  <span>Nombre y apellido</span>
                  <input name="nombre" [(ngModel)]="nombre" required autocomplete="name" />
                </label>

                <div class="fila fila--dos">
                  <label class="campo">
                    <span>Teléfono</span>
                    <input
                      type="tel"
                      name="telefono"
                      inputmode="tel"
                      [(ngModel)]="telefono"
                      required
                      autocomplete="tel"
                    />
                  </label>
                  <label class="campo">
                    <span>Correo</span>
                    <input
                      type="email"
                      name="email"
                      inputmode="email"
                      [(ngModel)]="email"
                      required
                      autocomplete="email"
                    />
                  </label>
                </div>

                <div class="fila fila--cuando">
                  <label class="campo">
                    <span>Día</span>
                    <input type="date" name="dia" [min]="minimo" [(ngModel)]="dia" required />
                  </label>
                  <label class="campo">
                    <span>Hora</span>
                    <input type="time" name="hora" [(ngModel)]="hora" required />
                  </label>
                  <label class="campo">
                    <span>Personas</span>
                    <input
                      type="number"
                      name="personas"
                      inputmode="numeric"
                      min="1"
                      max="100"
                      [(ngModel)]="personas"
                      required
                    />
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
                  Pedir reserva
                </button>

                <p class="apunte">
                  Todos los campos son obligatorios salvo el comentario. El correo lo
                  usamos solo para confirmarte la mesa.
                </p>
              </form>
            }
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

    /* Las filas arrancan en una sola columna y solo se abren cuando hay sitio.

       Se usa «minmax(0, 1fr)» y no «1fr» a secas: los campos de fecha y hora
       traen un ancho minimo propio grande, y como los hijos de una rejilla no
       encogen por debajo de su contenido, dos de ellos en la misma fila
       ensanchaban la rejilla, se montaban entre si y empujaban la pagina a lo
       ancho. El minimo en cero les deja encogerse. */
    .fila {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 14px;
    }

    /* Dia, hora y personas: en movil el dia se lleva la fila entera y debajo
       van la hora y el numero de comensales, que son cortos. */
    .fila--cuando { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .fila--cuando > :first-child { grid-column: 1 / -1; }

    .campo { min-width: 0; }

    /* Los campos van sobre fondo oscuro: se invierte la piel clara del
       sistema para que no den un salto de brillo en medio del panel. */
    .campo > span { opacity: .45; }

    .campo input,
    .campo textarea {
      min-width: 0;
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

    /* ---- Acuse de recibo ----------------------------------------------- */

    .acuse {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 26px 24px;
      border-radius: var(--pastilla);
      background: rgba(226, 112, 30, .14);
      border: 1px solid rgba(226, 112, 30, .4);
    }

    .acuse__titulo {
      margin: 0;
      font-family: Anton, sans-serif;
      font-size: 24px;
      text-transform: uppercase;
      color: var(--naranja);
    }

    .acuse__resumen { margin: 0; font-size: 15px; line-height: 1.55; }

    .acuse__nota { margin: 0; font-size: 13px; line-height: 1.55; opacity: .75; }

    .acuse__aviso { margin: 0; font-size: 11px; line-height: 1.6; opacity: .5; }

    .acuse .boton { align-self: flex-start; margin-top: 6px; }

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
      grid-template-columns: repeat(3, minmax(0, 1fr));
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

    @media (min-width: 620px) {
      .fila--dos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .fila--cuando { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .fila--cuando > :first-child { grid-column: auto; }
    }

    @media (min-width: 900px) {
      .columnas { grid-template-columns: 1.1fr .9fr; gap: 60px; }
    }
  `,
})
export class ReservarPage {
  private readonly servicio = inject(CatalogoService);
  private readonly reservas = inject(ReservasService);

  readonly restaurante = this.servicio.restaurante;
  readonly hoy = new Date().getFullYear();

  /** No se puede reservar para ayer. */
  readonly minimo = hoyIso();

  readonly nombre = signal('');
  readonly telefono = signal('');
  readonly email = signal('');
  readonly dia = signal('');
  readonly hora = signal('');
  readonly personas = signal<number | null>(2);
  readonly comentario = signal('');

  /** La reserva recien pedida; mientras exista, en su sitio va el acuse. */
  readonly enviada = signal<{
    nombre: string;
    telefono: string;
    email: string;
    dia: string;
    hora: string;
    personas: number;
  } | null>(null);

  readonly completo = computed(
    () =>
      !!this.nombre().trim() &&
      !!this.telefono().trim() &&
      !!this.email().trim() &&
      !!this.dia() &&
      !!this.hora() &&
      (this.personas() ?? 0) > 0,
  );

  /** Seis fotos de la galeria como retrato del comedor. */
  readonly mosaico = computed(() => this.servicio.galeria().slice(0, 6));

  diaLargo(iso: string): string {
    return fechaLarga(iso);
  }

  telefonoBonito(): string {
    return this.restaurante().telefono.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  whatsapp(): string {
    return `https://wa.me/${this.restaurante().whatsapp}`;
  }

  enviar(): void {
    if (!this.completo()) return;

    const reserva = this.reservas.crear({
      nombre: this.nombre().trim(),
      telefono: this.telefono().trim(),
      email: this.email().trim(),
      dia: this.dia(),
      hora: this.hora(),
      personas: Number(this.personas()),
      comentario: this.comentario().trim() || null,
    });

    this.enviada.set(reserva);
  }

  /** Vuelve al formulario en blanco para pedir otra mesa. */
  otra(): void {
    this.enviada.set(null);
    this.nombre.set('');
    this.telefono.set('');
    this.email.set('');
    this.dia.set('');
    this.hora.set('');
    this.personas.set(2);
    this.comentario.set('');
  }
}
