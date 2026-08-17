import { Component, computed, inject, signal } from '@angular/core';

import { CatalogoService } from '../core/catalogo.service';
import { ReservasService } from '../core/reservas.service';
import type { Reserva } from '../core/modelos';
import {
  DIAS_SEMANA,
  fechaCorta,
  fechaLarga,
  finMes,
  hoyIso,
  inicioMes,
  inicioSemana,
  nombreMes,
  rejillaMes,
  sumarDias,
  sumarMeses,
} from '../core/fechas';

type Alcance = 'dia' | 'semana' | 'mes';

@Component({
  selector: 'niu-admin-reservas',
  template: `
    <div class="admin-cabecera">
      <h2 class="admin-cabecera__titulo">Reservas</h2>
      <span class="resumen etiqueta">
        {{ pendientes().length }} por confirmar · {{ proximas().length }} próximas
      </span>
    </div>

    <!-- Peticiones por confirmar --------------------------------------- -->
    <section class="bloque">
      <h3 class="bloque__titulo etiqueta">Peticiones por confirmar</h3>

      @if (pendientes().length) {
        <div class="admin-lista">
          @for (r of pendientes(); track r.id) {
            <article class="peticion">
              <div class="peticion__cuerpo">
                <div class="peticion__nombre">
                  {{ r.nombre }}
                  <span class="insignia">Pendiente</span>
                </div>
                <div class="peticion__cuando">
                  {{ diaLargo(r.dia) }} · {{ r.hora }} · {{ r.personas }}
                  {{ r.personas === 1 ? 'persona' : 'personas' }}
                </div>
                <div class="peticion__contacto">
                  <a [href]="'tel:' + r.telefono">{{ r.telefono }}</a>
                  <a [href]="'mailto:' + r.email">{{ r.email }}</a>
                </div>
                @if (r.comentario) {
                  <p class="peticion__comentario">“{{ r.comentario }}”</p>
                }
              </div>

              <div class="peticion__acciones">
                <button type="button" class="boton" (click)="confirmar(r)">Confirmar</button>
                <button type="button" class="admin-mini" (click)="rechazar(r)">Rechazar</button>
              </div>
            </article>
          }
        </div>
      } @else {
        <p class="admin-vacio">No hay peticiones pendientes.</p>
      }
    </section>

    <!-- Calendario ------------------------------------------------------ -->
    <section class="bloque">
      <div class="calendario__barra">
        <h3 class="bloque__titulo etiqueta">Calendario</h3>
        <div class="calendario__mando">
          <button type="button" class="admin-mini" (click)="moverMes(-1)" aria-label="Mes anterior">
            ‹
          </button>
          <span class="calendario__mes">{{ tituloMes() }}</span>
          <button type="button" class="admin-mini" (click)="moverMes(1)" aria-label="Mes siguiente">
            ›
          </button>
          <button type="button" class="admin-mini" (click)="irAHoy()">Hoy</button>
        </div>
      </div>

      <div class="calendario">
        <div class="calendario__cabecera">
          @for (d of diasSemana; track d) {
            <span>{{ d }}</span>
          }
        </div>

        <div class="calendario__rejilla">
          @for (c of celdas(); track c.iso) {
            <button
              type="button"
              class="dia"
              [class.dia--fuera]="!c.delMes"
              [class.dia--hoy]="c.iso === hoy"
              [class.dia--elegido]="c.iso === diaElegido()"
              [class.dia--ocupado]="c.reservas > 0"
              (click)="diaElegido.set(c.iso)"
            >
              <span class="dia__numero">{{ c.numero }}</span>
              @if (c.reservas) {
                <span class="dia__marca">{{ c.comensales }}</span>
              }
            </button>
          }
        </div>
      </div>

      <!-- Detalle del dia elegido -->
      <div class="detalle">
        <div class="detalle__cabecera">
          <span class="detalle__fecha">{{ diaLargo(diaElegido()) }}</span>
          @if (reservasDelDia().length) {
            <span class="detalle__total etiqueta">
              {{ reservasDelDia().length }}
              {{ reservasDelDia().length === 1 ? 'mesa' : 'mesas' }} ·
              {{ comensalesDelDia() }} comensales
            </span>
          }
        </div>

        @if (reservasDelDia().length) {
          <div class="admin-lista">
            @for (r of reservasDelDia(); track r.id) {
              <div class="admin-fila">
                <span class="hora">{{ r.hora }}</span>
                <div class="admin-fila__cuerpo">
                  <div class="admin-fila__nombre">
                    {{ r.nombre }} · {{ r.personas }}
                    {{ r.personas === 1 ? 'persona' : 'personas' }}
                  </div>
                  <div class="admin-fila__meta">
                    {{ r.telefono }} · {{ r.email }}
                    @if (r.comentario) {
                      · {{ r.comentario }}
                    }
                  </div>
                </div>
                <div class="admin-fila__acciones">
                  <button type="button" class="admin-mini" (click)="devolver(r)">Anular</button>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="admin-vacio">Sin reservas confirmadas este día.</p>
        }
      </div>
    </section>

    <!-- Exportar -------------------------------------------------------- -->
    <section class="bloque">
      <h3 class="bloque__titulo etiqueta">Descargar en PDF</h3>
      <p class="exportar__nota">
        Toma como referencia el día elegido en el calendario ({{ fechaCortaDe(diaElegido()) }}).
      </p>
      <div class="exportar">
        <button type="button" class="boton" (click)="descargarPdf('dia')">Del día</button>
        <button type="button" class="boton" (click)="descargarPdf('semana')">De la semana</button>
        <button type="button" class="boton" (click)="descargarPdf('mes')">Del mes</button>
      </div>
    </section>

  `,
  styles: `
    :host {
      display: block;
    }

    .resumen {
      opacity: 0.45;
    }

    .bloque {
      margin-bottom: 30px;
    }

    .bloque__titulo {
      display: block;
      margin: 0 0 12px 6px;
      opacity: 0.4;
    }

    /* ---- Peticiones pendientes ---------------------------------------- */

    /* En naranja, que es el color con el que la casa distingue de un vistazo
       lo que todavia reclama una decision. */
    .peticion {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      border-radius: 1.5rem;
      background: rgba(226, 112, 30, 0.12);
      border: 1px solid rgba(226, 112, 30, 0.45);
    }

    .peticion__cuerpo {
      flex: 1 1 260px;
      min-width: 0;
    }

    .peticion__nombre {
      font-size: 15px;
      font-weight: 700;
    }

    .peticion__cuando {
      margin-top: 4px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--naranja);
    }

    .peticion__contacto {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      margin-top: 6px;
      font-size: 12px;
      opacity: 0.65;

      a:hover {
        color: var(--naranja);
      }
    }

    .peticion__comentario {
      margin: 8px 0 0;
      font-size: 12px;
      line-height: 1.5;
      opacity: 0.7;
      font-style: italic;
    }

    .peticion__acciones {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .peticion__acciones .boton {
      padding: 12px 20px;
    }

    .insignia {
      display: inline-block;
      margin-left: 8px;
      padding: 3px 9px;
      border-radius: 999px;
      background: var(--naranja);
      color: var(--blanco);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      vertical-align: middle;
    }

    /* ---- Calendario ---------------------------------------------------- */

    .calendario__barra {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .calendario__mando {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .calendario__mes {
      min-width: 9.5em;
      text-align: center;
      font-family: Anton, sans-serif;
      font-size: 17px;
      text-transform: uppercase;
    }

    /* Con el ancho del panel entero las celdas cuadradas salian de 180 px y el
       mes ocupaba dos pantallas. Topado, el calendario se lee de un vistazo y
       el detalle del dia queda al lado en las pantallas anchas. */
    .calendario {
      max-width: 760px;
      padding: 16px;
      border-radius: var(--pastilla);
      background: var(--arena-clara);
    }

    .calendario__cabecera,
    .calendario__rejilla {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 6px;
    }

    .calendario__cabecera {
      margin-bottom: 8px;

      span {
        text-align: center;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        opacity: 0.4;
      }
    }

    .dia {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      aspect-ratio: 1;
      border: 0;
      cursor: pointer;
      border-radius: 14px;
      background: rgba(46, 46, 46, 0.04);
      color: var(--tinta);
      font-family: Inter, sans-serif;
      transition:
        background 0.25s var(--suave),
        color 0.25s var(--suave);

      &:hover {
        background: rgba(46, 46, 46, 0.12);
      }
    }

    .dia__numero {
      font-size: 13px;
      font-weight: 700;
    }

    .dia--fuera {
      opacity: 0.3;
    }

    .dia--hoy {
      box-shadow: inset 0 0 0 2px rgba(46, 46, 46, 0.35);
    }

    /* Los dias con mesa confirmada llevan el numero de comensales, que es el
       dato que de verdad se mira al planificar el servicio. */
    .dia--ocupado {
      background: var(--naranja);
      color: var(--blanco);
    }
    .dia--ocupado:hover {
      background: #c85f14;
    }

    .dia__marca {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.06em;
      opacity: 0.85;
    }

    .dia--elegido {
      box-shadow: inset 0 0 0 2px var(--tinta);
      background: var(--tinta);
      color: var(--arena-clara);
    }

    .dia--elegido:hover {
      background: var(--tinta);
    }

    /* ---- Detalle del dia ----------------------------------------------- */

    .detalle {
      margin-top: 18px;
    }

    .detalle__cabecera {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      margin: 0 6px 10px;
    }

    .detalle__fecha {
      font-family: Anton, sans-serif;
      font-size: 16px;
      text-transform: uppercase;
    }

    .detalle__total {
      opacity: 0.45;
    }

    .hora {
      flex: none;
      font-family: Anton, sans-serif;
      font-size: 17px;
      color: var(--naranja);
    }

    /* ---- Exportar ------------------------------------------------------ */

    .exportar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .exportar__nota {
      margin: 0 6px 14px;
      font-size: 12px;
      line-height: 1.6;
      opacity: 0.55;
      max-width: 62ch;
    }

    @media (max-width: 620px) {
      .peticion__acciones {
        width: 100%;
      }
      .peticion__acciones .boton,
      .peticion__acciones .admin-mini {
        flex: 1;
      }
      .calendario {
        padding: 10px;
      }
      .dia {
        border-radius: 11px;
      }
      .dia__numero {
        font-size: 12px;
      }
    }
  `,
})
export class AdminReservas {
  private readonly reservas = inject(ReservasService);
  private readonly catalogo = inject(CatalogoService);

  readonly restaurante = this.catalogo.restaurante;
  readonly pendientes = this.reservas.pendientes;
  readonly proximas = this.reservas.proximas;

  readonly diasSemana = DIAS_SEMANA;
  readonly hoy = hoyIso();

  /** Mes que se esta mirando, representado por su dia 1. */
  readonly mes = signal(inicioMes(hoyIso()));
  readonly diaElegido = signal(hoyIso());

  readonly tituloMes = computed(() => nombreMes(this.mes()));

  readonly celdas = computed(() =>
    rejillaMes(this.mes()).map((c) => {
      const delDia = this.reservas.deDia(c.iso);
      return {
        ...c,
        numero: Number(c.iso.slice(8)),
        reservas: delDia.length,
        comensales: delDia.reduce((s, r) => s + r.personas, 0),
      };
    }),
  );

  readonly reservasDelDia = computed(() => this.reservas.deDia(this.diaElegido()));
  readonly comensalesDelDia = computed(() =>
    this.reservasDelDia().reduce((s, r) => s + r.personas, 0),
  );

  // ---- Formatos ------------------------------------------------------------

  diaLargo(iso: string): string {
    return fechaLarga(iso);
  }

  fechaCortaDe(iso: string): string {
    return fechaCorta(iso);
  }

  // ---- Calendario ----------------------------------------------------------

  moverMes(pasos: number): void {
    this.mes.set(sumarMeses(this.mes(), pasos));
  }

  irAHoy(): void {
    this.mes.set(inicioMes(this.hoy));
    this.diaElegido.set(this.hoy);
  }

  // ---- Decisiones ----------------------------------------------------------

  confirmar(r: Reserva): void {
    this.reservas.confirmar(r.id);
    // Se salta al dia de la reserva recien aceptada para verla ya en su sitio.
    this.mes.set(inicioMes(r.dia));
    this.diaElegido.set(r.dia);
  }

  rechazar(r: Reserva): void {
    this.reservas.rechazar(r.id);
  }

  /** Anular devuelve la reserva a la cola en vez de borrarla sin dejar rastro. */
  devolver(r: Reserva): void {
    this.reservas.reabrir(r.id);
  }

  // ---- PDF -----------------------------------------------------------------

  /* El PDF se compone con jsPDF en vez de tirar de `window.print()`.

     Con la impresion del navegador el resultado dependia de cada motor: en
     Safari de iOS los fondos si se imprimen, asi que el color de la web se
     pintaba sobre toda la hoja y salia gris. Componiendo el documento nosotros
     el fichero es identico en cualquier movil u ordenador, y ademas se
     descarga de una vez en lugar de pasar por el dialogo de impresion. */
  async descargarPdf(alcance: Alcance): Promise<void> {
    const referencia = this.diaElegido();
    const { desde, hasta, titulo } = this.rango(alcance, referencia);
    const lista = this.reservas.enRango(desde, hasta);
    const casa = this.restaurante();

    // jsPDF pesa lo suyo y solo hace falta al pulsar el boton: se trae en ese
    // momento y no en la carga del panel.
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margen = 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text(casa.nombre.toUpperCase(), margen, margen + 5);

    doc.setFontSize(11);
    doc.text(titulo, margen, margen + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const comensales = lista.reduce((s, r) => s + r.personas, 0);
    doc.text(
      `${lista.length} ${lista.length === 1 ? 'reserva' : 'reservas'} · ${comensales} comensales`,
      margen,
      margen + 19,
    );

    if (!lista.length) {
      doc.setFontSize(11);
      doc.text('No hay reservas confirmadas en este periodo.', margen, margen + 32);
      doc.save(this.nombreFichero(alcance, referencia));
      return;
    }

    /* Una sola tabla con una fila-titulo por jornada. Asi autoTable se ocupa
       de los saltos de pagina y de repetir la cabecera, en vez de tener que
       calcular a mano donde cabe cada dia. */
    const porDia = new Map<string, Reserva[]>();
    for (const r of lista) {
      const grupo = porDia.get(r.dia) ?? [];
      grupo.push(r);
      porDia.set(r.dia, grupo);
    }

    const filas = [...porDia.entries()].flatMap(([dia, reservas]) => [
      [
        {
          content: fechaLarga(dia),
          colSpan: 6,
          styles: { fillColor: [236, 234, 231], textColor: 20, fontStyle: 'bold' },
        },
      ],
      ...reservas.map((r) => [
        r.hora,
        r.nombre,
        String(r.personas),
        r.telefono,
        r.email,
        r.comentario ?? '',
      ]),
    ]);

    autoTable(doc, {
      startY: margen + 25,
      margin: { left: margen, right: margen },
      head: [['Hora', 'Nombre', 'Pers.', 'Teléfono', 'Correo', 'Observaciones']],
      body: filas as never,
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [46, 46, 46], textColor: 255, fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 14 },
        2: { cellWidth: 12, halign: 'center' },
        3: { cellWidth: 26 },
      },
      didDrawPage: () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(
          `Generado el ${fechaCorta(this.hoy)} · ${casa.nombre} · ${casa.telefono}`,
          margen,
          doc.internal.pageSize.getHeight() - 8,
        );
        doc.setTextColor(0);
      },
    });

    doc.save(this.nombreFichero(alcance, referencia));
  }

  private nombreFichero(alcance: Alcance, referencia: string): string {
    if (alcance === 'dia') return `reservas-${referencia}.pdf`;
    if (alcance === 'semana') return `reservas-semana-${inicioSemana(referencia)}.pdf`;
    return `reservas-mes-${inicioMes(referencia).slice(0, 7)}.pdf`;
  }

  private rango(
    alcance: Alcance,
    referencia: string,
  ): {
    desde: string;
    hasta: string;
    titulo: string;
  } {
    if (alcance === 'dia') {
      return {
        desde: referencia,
        hasta: referencia,
        titulo: `Reservas del ${fechaLarga(referencia)}`,
      };
    }

    if (alcance === 'semana') {
      const desde = inicioSemana(referencia);
      const hasta = sumarDias(desde, 6);
      return {
        desde,
        hasta,
        titulo: `Reservas del ${fechaCorta(desde)} al ${fechaCorta(hasta)}`,
      };
    }

    const desde = inicioMes(referencia);
    return {
      desde,
      hasta: finMes(referencia),
      titulo: `Reservas de ${nombreMes(referencia)}`,
    };
  }
}
