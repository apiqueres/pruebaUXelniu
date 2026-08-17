import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API } from './api';
import { hoyIso } from './fechas';
import type { PeticionReserva, Reserva } from './modelos';

/* El alta la hace cualquiera desde la web; el resto, solo la casa con su token.

   Las reservas se traen todas de una vez y el calendario, los totales y los
   listados se derivan aqui. Es un solo viaje al servidor y luego moverse por
   los meses no cuesta nada, que es como se usa el panel. */
@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly datos = signal<Reserva[]>([]);

  readonly reservas = this.datos.asReadonly();
  readonly error = signal<string | null>(null);

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

  // ---- Carga (solo con token) ---------------------------------------------

  async cargar(): Promise<void> {
    try {
      const lista = await firstValueFrom(this.http.get<Reserva[]>(`${API}/admin/reservas`));
      this.datos.set(lista);
      this.error.set(null);
    } catch (e: unknown) {
      const estado = (e as { status?: number }).status;
      // El 401 lo resuelve el interceptor cerrando la sesion; aqui solo se
      // avisa de lo demas.
      if (estado !== 401) {
        this.error.set('No se han podido traer las reservas del servidor.');
      }
    }
  }

  // ---- Consultas -----------------------------------------------------------

  /* Las fechas son «AAAA-MM-DD» y las horas «HH:MM», asi que comparar y
     ordenar como texto da el mismo resultado que hacerlo como fecha. */

  deDia(dia: string): Reserva[] {
    return this.confirmadas()
      .filter((r) => r.dia === dia)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }

  enRango(desde: string, hasta: string): Reserva[] {
    return this.confirmadas()
      .filter((r) => r.dia >= desde && r.dia <= hasta)
      .sort((a, b) => a.dia.localeCompare(b.dia) || a.hora.localeCompare(b.hora));
  }

  comensalesDe(dia: string): number {
    return this.deDia(dia).reduce((suma, r) => suma + r.personas, 0);
  }

  // ---- Alta desde la web (publica) ----------------------------------------

  async crear(peticion: PeticionReserva): Promise<Reserva> {
    return firstValueFrom(this.http.post<Reserva>(`${API}/reservas`, peticion));
  }

  // ---- Decisiones de la casa ----------------------------------------------

  async confirmar(id: string): Promise<void> {
    await this.resolver(id, 'confirmar');
  }

  async rechazar(id: string): Promise<void> {
    await this.resolver(id, 'rechazar');
  }

  /** Devuelve una reserva ya resuelta a la cola de pendientes. */
  async reabrir(id: string): Promise<void> {
    await this.resolver(id, 'reabrir');
  }

  async borrar(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${API}/admin/reservas/${id}`));
    this.datos.update((lista) => lista.filter((r) => r.id !== id));
  }

  /* Se guarda la reserva que devuelve el servidor en vez de suponer como queda:
     asi el estado y la fecha de resolucion son los que de verdad hay grabados. */
  private async resolver(id: string, accion: string): Promise<void> {
    const actualizada = await firstValueFrom(
      this.http.post<Reserva>(`${API}/admin/reservas/${id}/${accion}`, {}),
    );
    this.datos.update((lista) => lista.map((r) => (r.id === id ? actualizada : r)));
  }
}
