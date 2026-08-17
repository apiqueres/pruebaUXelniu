/* Utilidades de fecha para las reservas.

   Todas trabajan con cadenas «AAAA-MM-DD» y construyen los `Date` con el
   constructor de tres numeros, nunca con `new Date('2026-08-20')`: esa forma
   interpreta la cadena como UTC y en España adelanta o atrasa el dia segun la
   hora, con lo que una reserva del 20 aparecia en el calendario el 19. */

export const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function aFecha(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function aIso(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function hoyIso(): string {
  return aIso(new Date());
}

export function sumarDias(iso: string, dias: number): string {
  const f = aFecha(iso);
  f.setDate(f.getDate() + dias);
  return aIso(f);
}

export function sumarMeses(iso: string, meses: number): string {
  const f = aFecha(iso);
  // Al dia 1 antes de sumar: si no, pasar de un 31 a un mes de 30 dias
  // desbordaria al mes siguiente.
  f.setDate(1);
  f.setMonth(f.getMonth() + meses);
  return aIso(f);
}

/** Lunes de la semana a la que pertenece la fecha. */
export function inicioSemana(iso: string): string {
  const f = aFecha(iso);
  // getDay() da 0 para domingo; aqui la semana empieza en lunes.
  const desplazamiento = (f.getDay() + 6) % 7;
  f.setDate(f.getDate() - desplazamiento);
  return aIso(f);
}

export function inicioMes(iso: string): string {
  const f = aFecha(iso);
  f.setDate(1);
  return aIso(f);
}

export function finMes(iso: string): string {
  const f = aFecha(iso);
  // Dia 0 del mes siguiente es el ultimo del actual.
  f.setMonth(f.getMonth() + 1, 0);
  return aIso(f);
}

export function nombreMes(iso: string): string {
  const f = aFecha(iso);
  return `${MESES[f.getMonth()]} ${f.getFullYear()}`;
}

/** «jueves, 20 de agosto de 2026», para las cabeceras del listado impreso. */
export function fechaLarga(iso: string): string {
  return aFecha(iso).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** «20/08/2026», para las cabeceras compactas. */
export function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/* Rejilla del mes: seis filas de siete dias empezando en lunes, rellenando con
   los dias del mes anterior y del siguiente para que no queden huecos. Son
   siempre 42 celdas y no las justas, para que el calendario no cambie de alto
   al pasar de mes y baile el resto de la pagina. */
export function rejillaMes(isoDelMes: string): { iso: string; delMes: boolean }[] {
  const primero = aFecha(inicioMes(isoDelMes));
  const arranque = aFecha(inicioSemana(aIso(primero)));
  const mesActual = primero.getMonth();

  const celdas: { iso: string; delMes: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const f = new Date(arranque);
    f.setDate(f.getDate() + i);
    celdas.push({ iso: aIso(f), delMes: f.getMonth() === mesActual });
  }
  return celdas;
}
