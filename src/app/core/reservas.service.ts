import { computed, Injectable, signal } from '@angular/core';

import type { EstadoReserva, PeticionReserva, Reserva } from './modelos';
import { hoyIso } from './fechas';

/* Las reservas viven en el navegador mientras no haya servidor, igual que la
   carta. La clave es distinta a proposito: restaurar la carta desde el panel
   no debe llevarse por delante las reservas de los clientes.

   Cuando llegue el backend solo cambian `leer` y `persistir`, y `crear` pasara
   a ser el POST que ademas dispara el aviso por correo a la casa. */
const CLAVE = 'niu.reservas.v1';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly datos = signal<Reserva[]>(this.leer());

  readonly reservas = this.datos.asReadonly();

  /** Peticiones sin resolver, la mas antigua primero: se atienden por orden. */
  readonly pendientes = computed(() =>
    this.datos()
      .filter((r) => r.estado === 'pendiente')
      .sort((a, b) => a.creada.localeCompare(b.creada)),
  );

  readonly confirmadas = computed(() => this.datos().filter((r) => r.estado === 'confirmada'));

  /** Confirmadas de hoy en adelante, que son las que hay que tener a mano. */
  readonly proximas = computed(() => {
    const hoy = hoyIso();
    return this.confirmadas()
      .filter((r) => r.dia >= hoy)
      .sort((a, b) => a.dia.localeCompare(b.dia) || a.hora.localeCompare(b.hora));
  });

  // ---- Consultas -----------------------------------------------------------

  /* Las fechas son «AAAA-MM-DD» y las horas «HH:MM», asi que comparar y
     ordenar como texto da el mismo resultado que hacerlo como fecha, sin tener
     que construir un Date por reserva. */

  /** Reservas confirmadas de un dia, ordenadas por hora. */
  deDia(dia: string): Reserva[] {
    return this.confirmadas()
      .filter((r) => r.dia === dia)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }

  /** Confirmadas entre dos dias, ambos incluidos. */
  enRango(desde: string, hasta: string): Reserva[] {
    return this.confirmadas()
      .filter((r) => r.dia >= desde && r.dia <= hasta)
      .sort((a, b) => a.dia.localeCompare(b.dia) || a.hora.localeCompare(b.hora));
  }

  /** Cuantas personas hay sentadas ese dia, para el resumen del calendario. */
  comensalesDe(dia: string): number {
    return this.deDia(dia).reduce((suma, r) => suma + r.personas, 0);
  }

  // ---- Altas y resoluciones ------------------------------------------------

  crear(peticion: PeticionReserva): Reserva {
    const reserva: Reserva = {
      ...peticion,
      id: this.nuevoId(peticion),
      estado: 'pendiente',
      creada: new Date().toISOString(),
      resuelta: null,
    };
    this.datos.update((lista) => [...lista, reserva]);
    this.persistir();
    return reserva;
  }

  confirmar(id: string): void {
    this.resolver(id, 'confirmada');
  }

  rechazar(id: string): void {
    this.resolver(id, 'rechazada');
  }

  /** Devuelve una reserva ya resuelta a la cola de pendientes. */
  reabrir(id: string): void {
    this.datos.update((lista) =>
      lista.map((r) => (r.id === id ? { ...r, estado: 'pendiente' as const, resuelta: null } : r)),
    );
    this.persistir();
  }

  borrar(id: string): void {
    this.datos.update((lista) => lista.filter((r) => r.id !== id));
    this.persistir();
  }

  private resolver(id: string, estado: EstadoReserva): void {
    this.datos.update((lista) =>
      lista.map((r) => (r.id === id ? { ...r, estado, resuelta: new Date().toISOString() } : r)),
    );
    this.persistir();
  }

  // ---- Persistencia --------------------------------------------------------

  private leer(): Reserva[] {
    try {
      const crudo = localStorage.getItem(CLAVE);
      const lista = crudo ? JSON.parse(crudo) : [];
      return Array.isArray(lista) ? (lista as Reserva[]) : [];
    } catch {
      // Un JSON corrupto no debe tumbar la pagina de reservas del cliente.
      return [];
    }
  }

  private persistir(): void {
    localStorage.setItem(CLAVE, JSON.stringify(this.datos()));
  }

  /* Identificador legible: dia, hora y un sufijo corto. Asi, mirando la clave
     en el navegador, ya se sabe de que reserva se trata. */
  private nuevoId(p: PeticionReserva): string {
    const base = `r-${p.dia.replace(/-/g, '')}-${p.hora.replace(':', '')}`;
    const usados = new Set(this.datos().map((r) => r.id));
    let n = 1;
    while (usados.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }
}
