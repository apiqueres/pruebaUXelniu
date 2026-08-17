import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { Catalogo, Categoria, Menu, Producto, TipoCategoria } from './modelos';

/* Mientras no exista el backend, lo que edita el administrador se guarda en el
   navegador. `catalogo.json` es la semilla: se carga la primera vez y despues
   solo si el cliente pulsa «restaurar».

   Cuando llegue la API de Spring Boot solo cambian `cargar` y `persistir`: el
   resto de la aplicacion lee siempre del mismo signal. */
const CLAVE = 'niu.catalogo.v1';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly datos = signal<Catalogo | null>(null);

  readonly catalogo = this.datos.asReadonly();
  readonly cargado = computed(() => this.datos() !== null);

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

  /** Los seis platos con foto que abren la portada. */
  readonly destacados = computed(() =>
    this.productos().filter((p) => p.destacado && p.activo),
  );

  // ---- Carga y persistencia ------------------------------------------------

  async inicializar(): Promise<void> {
    if (this.datos()) return;

    const guardado = this.leerLocal();
    if (guardado) {
      this.datos.set(guardado);
      return;
    }
    await this.cargarSemilla();
  }

  /* Ojo con el orden: la carta no puede quedarse en null ni un instante
     mientras se descarga la semilla, porque las paginas ya pintadas la estan
     leyendo y reventarian. Primero se trae el JSON y luego se sustituye. */
  async restaurarSemilla(): Promise<void> {
    localStorage.removeItem(CLAVE);
    await this.cargarSemilla();
  }

  private async cargarSemilla(): Promise<void> {
    const semilla = await firstValueFrom(this.http.get<Catalogo>('data/catalogo.json'));
    this.datos.set(semilla);
  }

  private leerLocal(): Catalogo | null {
    try {
      const crudo = localStorage.getItem(CLAVE);
      return crudo ? (JSON.parse(crudo) as Catalogo) : null;
    } catch {
      // Un JSON corrupto no debe dejar la carta en blanco: se ignora y se
      // vuelve a la semilla.
      return null;
    }
  }

  private persistir(): void {
    const actual = this.datos();
    if (actual) localStorage.setItem(CLAVE, JSON.stringify(actual));
  }

  private modificar(cambio: (c: Catalogo) => Catalogo): void {
    const actual = this.datos();
    if (!actual) return;
    this.datos.set(cambio(actual));
    this.persistir();
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

  guardarProducto(producto: Producto): void {
    this.modificar((c) => {
      const i = c.productos.findIndex((p) => p.id === producto.id);
      const productos = [...c.productos];
      if (i >= 0) productos[i] = producto;
      else productos.push(producto);
      return { ...c, productos };
    });
  }

  borrarProducto(id: string): void {
    this.modificar((c) => ({ ...c, productos: c.productos.filter((p) => p.id !== id) }));
  }

  guardarMenu(menu: Menu): void {
    this.modificar((c) => {
      const i = c.menus.findIndex((m) => m.id === menu.id);
      const menus = [...c.menus];
      if (i >= 0) menus[i] = menu;
      else menus.push(menu);
      return { ...c, menus };
    });
  }

  borrarMenu(id: string): void {
    this.modificar((c) => ({ ...c, menus: c.menus.filter((m) => m.id !== id) }));
  }

  guardarCategoria(categoria: Categoria): void {
    this.modificar((c) => {
      const i = c.categorias.findIndex((x) => x.id === categoria.id);
      const categorias = [...c.categorias];
      if (i >= 0) categorias[i] = categoria;
      else categorias.push(categoria);
      return { ...c, categorias };
    });
  }

  /** Borrar una categoria arrastra sus productos: no deben quedar huerfanos. */
  borrarCategoria(id: string): void {
    this.modificar((c) => ({
      ...c,
      categorias: c.categorias.filter((x) => x.id !== id),
      productos: c.productos.filter((p) => p.categoriaId !== id),
    }));
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
