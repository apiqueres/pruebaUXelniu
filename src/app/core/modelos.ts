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

export interface Catalogo {
  restaurante: Restaurante;
  categorias: Categoria[];
  productos: Producto[];
  menus: Menu[];
  eventos: Evento[];
  galeria: Foto[];
  avisos: { alergenos: string; bodega: string };
}
