/* El modelo que comparten la web publica y el panel de administracion.
   Es tambien el contrato que tendra que devolver el backend cuando lo haya. */

export type TipoCategoria = 'plato' | 'postre' | 'bebida';

export interface Categoria {
  id: string;
  nombre: string;
  tipo: TipoCategoria;
  orden: number;
  nota: string | null;
}

export interface Producto {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion: string | null;
  /** Nulo cuando el precio no es fijo; entonces manda `precioNota` (p. ej. «S/M»). */
  precio: number | null;
  precioNota: string | null;
  /** Aclaracion de la racion: «12 u.», «media racion»... */
  unidad: string | null;
  imagen: string | null;
  distintivos: string[];
  destacado: boolean;
  activo: boolean;
  orden: number;
}

export interface ApartadoMenu {
  titulo: string;
  opciones: string[];
}

export interface Menu {
  id: string;
  nombre: string;
  disponibilidad: string;
  precio: number | null;
  precioNota: string | null;
  incluye: string[];
  apartados: ApartadoMenu[];
  imagen: string | null;
  condiciones: string[];
  /** Los especiales son los de temporada (Navidad, comuniones...). */
  especial: boolean;
  activo: boolean;
}

export interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
}

export interface Foto {
  id: string;
  imagen: string;
  categoria: string;
  titulo: string;
}

export interface Horario {
  dias: string;
  turnos: string[];
  cerrado: boolean;
}

export interface Restaurante {
  nombre: string;
  reclamo: string;
  presentacion: string[];
  direccion: string;
  poblacion: string;
  telefono: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  mapa: string;
  capacidad: { salon: number; privado: number };
  desde: number;
  horarios: Horario[];
}

/* ---- Reservas -------------------------------------------------------------

   Una reserva nace «pendiente» cuando la pide un cliente desde la web y no
   ocupa mesa hasta que la casa la confirma. Las rechazadas se conservan para
   poder mirar atras y para no perder el telefono de quien se quedo fuera. */

export type EstadoReserva = 'pendiente' | 'confirmada' | 'rechazada';

export interface Reserva {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  /** Dia en formato «AAAA-MM-DD», tal cual lo da el <input type="date">. */
  dia: string;
  /** Hora en formato «HH:MM». */
  hora: string;
  personas: number;
  comentario: string | null;
  estado: EstadoReserva;
  /** Fecha ISO en que el cliente la pidio. */
  creada: string;
  /** Fecha ISO en que la casa la confirmo o la rechazo. */
  resuelta: string | null;
}

/** Lo que manda el formulario de la web; el resto lo pone el servicio. */
export type PeticionReserva = Omit<Reserva, 'id' | 'estado' | 'creada' | 'resuelta'>;

export interface Catalogo {
  restaurante: Restaurante;
  categorias: Categoria[];
  productos: Producto[];
  menus: Menu[];
  eventos: Evento[];
  galeria: Foto[];
  avisos: { alergenos: string; bodega: string };
}
