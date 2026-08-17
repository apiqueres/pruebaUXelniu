import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API } from './api';
import type { Catalogo, Categoria, Menu, Producto, TipoCategoria } from './modelos';

/* Toda la carta viene del servidor en una sola llamada, y cada cambio del panel
   se manda y se vuelve a leer.

   Releerla entera despues de guardar es una peticion mas, pero el panel se usa
   al ritmo de una persona editando y asi no hay que repetir aqui las reglas del
   servidor: quien manda sobre los identificadores, el orden o lo que arrastra
   el borrado de una categoria es la API. */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly datos = signal<Catalogo | null>(null);

  readonly catalogo = this.datos.asReadonly();
  readonly cargado = computed(() => this.datos() !== null);

  /** Mensaje para la pantalla cuando el servidor no responde. */
  readonly error = signal<string | null>(null);

  readonly restaurante = computed(() => this.datos()!.restaurante);
  readonly avisos = computed(() => this.datos()!.avisos);
  readonly eventos = computed(() => this.datos()!.eventos);
  readonly galeria = computed(() => this.datos()!.galeria);

  readonly categorias = computed(() =>
    [...(this.datos()?.categorias ?? [])].sort((a, b) => a.orden - b.orden),
  );

  readonly productos = computed(() => this.datos()?.productos ?? []);

  readonly menus = computed(() => this.datos()?.menus ?? []);
  readonly menusFijos = computed(() => this.menus().filter((m) => m.activo && !m.especial));
  readonly menusEspeciales = computed(() => this.menus().filter((m) => m.activo && m.especial));

  /** Los platos con foto que abren la portada. */
  readonly destacados = computed(() => this.productos().filter((p) => p.destacado && p.activo));

  // ---- Carga ---------------------------------------------------------------

  /* No lanza nunca: si el servidor esta caido la aplicacion tiene que arrancar
     igual y decirlo, no quedarse en blanco. */
  async inicializar(): Promise<void> {
    try {
      const catalogo = await firstValueFrom(this.http.get<Catalogo>(`${API}/catalogo`));
      this.datos.set(catalogo);
      this.error.set(null);
    } catch (e: unknown) {
      const estado = (e as { status?: number }).status;
      this.error.set(
        estado === 0
          ? 'No hay conexión con el servidor de la carta.'
          : 'El servidor no ha podido darnos la carta.',
      );
    }
  }

  async recargar(): Promise<void> {
    await this.inicializar();
  }

  // ---- Consultas -----------------------------------------------------------

  categoriasDe(tipo: TipoCategoria): Categoria[] {
    return this.categorias().filter((c) => c.tipo === tipo);
  }

  productosDe(categoriaId: string, soloActivos = true): Producto[] {
    return this.productos()
      .filter((p) => p.categoriaId === categoriaId && (!soloActivos || p.activo))
      .sort((a, b) => a.orden - b.orden);
  }

  categoria(id: string): Categoria | undefined {
    return this.categorias().find((c) => c.id === id);
  }

  // ---- Altas, bajas y modificaciones --------------------------------------

  /* Siempre PUT, tanto al crear como al editar: el frontend ya sabe el
     identificador del elemento y el servidor lo guarda si es nuevo o lo
     sustituye si existia. Una sola ruta para los dos casos. */

  async guardarProducto(producto: Producto): Promise<void> {
    await firstValueFrom(
      this.http.put<Producto>(`${API}/admin/productos/${producto.id}`, producto),
    );
    await this.recargar();
  }

  async borrarProducto(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${API}/admin/productos/${id}`));
    await this.recargar();
  }

  async guardarMenu(menu: Menu): Promise<void> {
    await firstValueFrom(this.http.put<Menu>(`${API}/admin/menus/${menu.id}`, menu));
    await this.recargar();
  }

  async borrarMenu(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${API}/admin/menus/${id}`));
    await this.recargar();
  }

  async guardarCategoria(categoria: Categoria): Promise<void> {
    await firstValueFrom(
      this.http.put<Categoria>(`${API}/admin/categorias/${categoria.id}`, categoria),
    );
    await this.recargar();
  }

  /** Borrar una categoria arrastra sus productos; de eso se encarga el servidor. */
  async borrarCategoria(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${API}/admin/categorias/${id}`));
    await this.recargar();
  }

  /** Identificador legible y unico a partir del nombre que escribe el cliente. */
  nuevoId(nombre: string, usados: string[]): string {
    const base =
      nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'nuevo';

    if (!usados.includes(base)) return base;
    let n = 2;
    while (usados.includes(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }
}
