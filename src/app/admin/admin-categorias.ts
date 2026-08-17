import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CatalogoService } from '../core/catalogo.service';
import type { Categoria, TipoCategoria } from '../core/modelos';

@Component({
  selector: 'niu-admin-categorias',
  imports: [FormsModule],
  template: `
    <div class="admin-cabecera">
      <h2 class="admin-cabecera__titulo">Categorías</h2>
      <button type="button" class="boton" (click)="nueva()">Añadir</button>
    </div>

    @if (editando()) {
      <form class="admin-editor" (ngSubmit)="guardar()">
        <h3 class="admin-editor__titulo">
          {{ esAlta() ? 'Nueva categoría' : 'Editar categoría' }}
        </h3>

        <div class="admin-rejilla">
          <label class="campo">
            <span>Nombre</span>
            <input name="nombre" [(ngModel)]="fNombre" required />
          </label>
          <label class="campo">
            <span>Carta</span>
            <select name="tipo" [(ngModel)]="fTipo">
              <option value="plato">Cocina</option>
              <option value="postre">Postres</option>
              <option value="bebida">Bodega</option>
            </select>
          </label>
          <label class="campo">
            <span>Orden</span>
            <input type="number" name="orden" [(ngModel)]="fOrden" />
          </label>
        </div>

        <label class="campo">
          <span>Nota bajo el título</span>
          <textarea name="nota" [(ngModel)]="fNota"></textarea>
        </label>

        <div class="admin-editor__pie">
          <button type="submit" class="boton" [disabled]="!fNombre().trim()">Guardar</button>
          <button type="button" class="boton boton--linea" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    }

    @for (bloque of bloques(); track bloque.tipo) {
      <section class="bloque">
        <h3 class="bloque__titulo etiqueta">{{ bloque.etiqueta }}</h3>
        <div class="admin-lista">
          @for (c of bloque.categorias; track c.id) {
            <div class="admin-fila">
              <div class="admin-fila__cuerpo">
                <div class="admin-fila__nombre">{{ c.nombre }}</div>
                <div class="admin-fila__meta">
                  {{ cuantos(c.id) }} productos
                  @if (c.nota) { · {{ c.nota }} }
                </div>
              </div>

              <div class="admin-fila__acciones">
                <button type="button" class="admin-mini" (click)="mover(c, -1)">↑</button>
                <button type="button" class="admin-mini" (click)="mover(c, 1)">↓</button>
                <button type="button" class="admin-mini" (click)="editar(c)">Editar</button>
                <button
                  type="button"
                  class="admin-mini admin-mini--peligro"
                  [class.admin-mini--activo]="porBorrar() === c.id"
                  (click)="borrar(c)"
                >
                  {{ porBorrar() === c.id ? 'Borra ' + cuantos(c.id) + ' platos' : 'Borrar' }}
                </button>
              </div>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    :host { display: block; }

    .bloque { margin-bottom: 26px; }

    .bloque__titulo {
      display: block;
      margin: 0 0 10px 6px;
      opacity: .4;
    }
  `,
})
export class AdminCategorias {
  private readonly servicio = inject(CatalogoService);

  readonly editando = signal<Categoria | null>(null);
  readonly esAlta = signal(false);
  readonly porBorrar = signal<string | null>(null);

  readonly fNombre = signal('');
  readonly fTipo = signal<TipoCategoria>('plato');
  readonly fOrden = signal(0);
  readonly fNota = signal('');

  private readonly tipos: { tipo: TipoCategoria; etiqueta: string }[] = [
    { tipo: 'plato', etiqueta: 'Cocina' },
    { tipo: 'postre', etiqueta: 'Postres' },
    { tipo: 'bebida', etiqueta: 'Bodega' },
  ];

  readonly bloques = computed(() =>
    this.tipos.map((t) => ({
      ...t,
      categorias: this.servicio.categorias().filter((c) => c.tipo === t.tipo),
    })),
  );

  cuantos(categoriaId: string): number {
    return this.servicio.productosDe(categoriaId, false).length;
  }

  nueva(): void {
    this.esAlta.set(true);
    const siguiente = Math.max(0, ...this.servicio.categorias().map((c) => c.orden)) + 1;
    const plantilla: Categoria = {
      id: '',
      nombre: '',
      tipo: 'plato',
      orden: siguiente,
      nota: null,
    };
    this.editando.set(plantilla);
    this.volcarEnFormulario(plantilla);
  }

  editar(c: Categoria): void {
    this.esAlta.set(false);
    this.editando.set(c);
    this.volcarEnFormulario(c);
  }

  cancelar(): void {
    this.editando.set(null);
  }

  guardar(): void {
    const base = this.editando();
    if (!base || !this.fNombre().trim()) return;

    const categoria: Categoria = {
      ...base,
      nombre: this.fNombre().trim(),
      tipo: this.fTipo(),
      orden: Number(this.fOrden()) || 0,
      nota: this.fNota().trim() || null,
    };

    if (this.esAlta()) {
      categoria.id = this.servicio.nuevoId(
        categoria.nombre,
        this.servicio.categorias().map((c) => c.id),
      );
    }

    this.servicio.guardarCategoria(categoria);
    this.editando.set(null);
  }

  /* Subir y bajar intercambian el orden con la vecina dentro de la misma
     carta, que es como lo entiende quien la ve en la web. */
  mover(c: Categoria, paso: number): void {
    const hermanas = this.servicio.categorias().filter((x) => x.tipo === c.tipo);
    const i = hermanas.findIndex((x) => x.id === c.id);
    const vecina = hermanas[i + paso];
    if (!vecina) return;

    this.servicio.guardarCategoria({ ...c, orden: vecina.orden });
    this.servicio.guardarCategoria({ ...vecina, orden: c.orden });
  }

  borrar(c: Categoria): void {
    if (this.porBorrar() !== c.id) {
      this.porBorrar.set(c.id);
      setTimeout(() => {
        if (this.porBorrar() === c.id) this.porBorrar.set(null);
      }, 4000);
      return;
    }
    this.porBorrar.set(null);
    if (this.editando()?.id === c.id) this.editando.set(null);
    this.servicio.borrarCategoria(c.id);
  }

  private volcarEnFormulario(c: Categoria): void {
    this.fNombre.set(c.nombre);
    this.fTipo.set(c.tipo);
    this.fOrden.set(c.orden);
    this.fNota.set(c.nota ?? '');
  }
}
