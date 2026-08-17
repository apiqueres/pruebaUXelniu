import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CatalogoService } from '../core/catalogo.service';
import type { Producto, TipoCategoria } from '../core/modelos';
import { PrecioPipe } from '../shared/precio.pipe';

@Component({
  selector: 'niu-admin-productos',
  imports: [FormsModule, PrecioPipe],
  template: `
    <div class="admin-cabecera">
      <h2 class="admin-cabecera__titulo">Platos y bebidas</h2>
      <button type="button" class="boton" (click)="nuevo()">Añadir</button>
    </div>

    @if (editando()) {
      <form class="admin-editor" (ngSubmit)="guardar()">
        <h3 class="admin-editor__titulo">
          {{ esAlta() ? 'Nuevo producto' : 'Editar producto' }}
        </h3>

        <label class="campo">
          <span>Nombre</span>
          <input name="nombre" [(ngModel)]="fNombre" required />
        </label>

        <label class="campo">
          <span>Descripción</span>
          <textarea name="descripcion" [(ngModel)]="fDescripcion"></textarea>
        </label>

        <div class="admin-rejilla">
          <label class="campo">
            <span>Categoría</span>
            <select name="categoria" [(ngModel)]="fCategoria">
              @for (c of categorias(); track c.id) {
                <option [value]="c.id">{{ etiquetaTipo(c.tipo) }} · {{ c.nombre }}</option>
              }
            </select>
          </label>

          <label class="campo">
            <span>Precio (€)</span>
            <input
              type="number"
              name="precio"
              step="0.5"
              min="0"
              placeholder="Vacío = sin precio fijo"
              [(ngModel)]="fPrecio"
            />
          </label>

          <label class="campo">
            <span>Texto si no hay precio</span>
            <input name="precioNota" placeholder="S/M, a consultar..." [(ngModel)]="fPrecioNota" />
          </label>

          <label class="campo">
            <span>Ración</span>
            <input name="unidad" placeholder="12 u., media ración..." [(ngModel)]="fUnidad" />
          </label>
        </div>

        <div class="admin-rejilla">
          <label class="campo">
            <span>Imagen</span>
            <input name="imagen" placeholder="galeria/paella.jpg" [(ngModel)]="fImagen" />
          </label>

          <label class="campo">
            <span>Distintivos (uno por línea)</span>
            <textarea name="distintivos" [(ngModel)]="fDistintivos"></textarea>
          </label>
        </div>

        <div class="admin-interruptores">
          <label class="admin-interruptor">
            <input type="checkbox" name="activo" [(ngModel)]="fActivo" />
            Visible en la carta
          </label>
          <label class="admin-interruptor">
            <input type="checkbox" name="destacado" [(ngModel)]="fDestacado" />
            Destacado en la portada
          </label>
        </div>

        <div class="admin-editor__pie">
          <button type="submit" class="boton" [disabled]="!fNombre().trim()">Guardar</button>
          <button type="button" class="boton boton--linea" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    }

    <div class="admin-filtros">
      <input
        name="busqueda"
        placeholder="Buscar por nombre..."
        [(ngModel)]="busqueda"
        [ngModelOptions]="{ standalone: true }"
      />
      <select [(ngModel)]="filtroTipo" [ngModelOptions]="{ standalone: true }">
        <option value="">Todos los tipos</option>
        <option value="plato">Cocina</option>
        <option value="postre">Postres</option>
        <option value="bebida">Bodega</option>
      </select>
      <select [(ngModel)]="filtroCategoria" [ngModelOptions]="{ standalone: true }">
        <option value="">Todas las categorías</option>
        @for (c of categoriasFiltro(); track c.id) {
          <option [value]="c.id">{{ c.nombre }}</option>
        }
      </select>
    </div>

    <div class="admin-lista">
      @for (p of visibles(); track p.id) {
        <div class="admin-fila" [class.admin-fila--apagada]="!p.activo">
          <div class="admin-fila__cuerpo">
            <div class="admin-fila__nombre">
              {{ p.nombre }}
              @if (p.destacado) { <span class="insignia">Portada</span> }
              @if (!p.activo) { <span class="insignia insignia--gris">Oculto</span> }
            </div>
            <div class="admin-fila__meta">
              {{ nombreCategoria(p.categoriaId) }}
              @if (p.descripcion) { · {{ p.descripcion }} }
            </div>
          </div>

          <div class="admin-fila__precio">
            {{ p.precio | precio: p.precioNota ?? '—' }}
          </div>

          <div class="admin-fila__acciones">
            <button type="button" class="admin-mini" (click)="alternarActivo(p)">
              {{ p.activo ? 'Ocultar' : 'Mostrar' }}
            </button>
            <button type="button" class="admin-mini" (click)="editar(p)">Editar</button>
            <button
              type="button"
              class="admin-mini admin-mini--peligro"
              [class.admin-mini--activo]="porBorrar() === p.id"
              (click)="borrar(p)"
            >
              {{ porBorrar() === p.id ? '¿Seguro?' : 'Borrar' }}
            </button>
          </div>
        </div>
      } @empty {
        <p class="admin-vacio">No hay productos que encajen con el filtro.</p>
      }
    </div>

    <p class="admin-recuento">{{ visibles().length }} de {{ todos().length }} productos</p>
  `,
  styles: `
    :host { display: block; }

    .insignia {
      display: inline-block;
      margin-left: 8px;
      padding: 3px 9px;
      border-radius: 999px;
      background: rgba(226, 112, 30, .15);
      color: var(--naranja);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      vertical-align: middle;
    }

    .insignia--gris { background: rgba(46, 46, 46, .1); color: var(--tinta); opacity: .6; }
  `,
})
export class AdminProductos {
  private readonly servicio = inject(CatalogoService);

  readonly categorias = this.servicio.categorias;
  readonly todos = this.servicio.productos;

  readonly busqueda = signal('');
  readonly filtroTipo = signal<'' | TipoCategoria>('');
  readonly filtroCategoria = signal('');
  readonly porBorrar = signal<string | null>(null);

  /** Id del producto en edicion; cadena vacia cuando es un alta. */
  readonly editando = signal<Producto | null>(null);
  readonly esAlta = signal(false);

  // Campos del formulario. Uno por campo para que la vista se refresque sola
  // en modo zoneless.
  readonly fNombre = signal('');
  readonly fDescripcion = signal('');
  readonly fCategoria = signal('');
  readonly fPrecio = signal<number | null>(null);
  readonly fPrecioNota = signal('');
  readonly fUnidad = signal('');
  readonly fImagen = signal('');
  readonly fDistintivos = signal('');
  readonly fActivo = signal(true);
  readonly fDestacado = signal(false);

  readonly categoriasFiltro = computed(() => {
    const t = this.filtroTipo();
    return t ? this.categorias().filter((c) => c.tipo === t) : this.categorias();
  });

  readonly visibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const tipo = this.filtroTipo();
    const cat = this.filtroCategoria();
    const porId = new Map(this.categorias().map((c) => [c.id, c]));

    return this.todos()
      .filter((p) => {
        if (cat && p.categoriaId !== cat) return false;
        if (tipo && porId.get(p.categoriaId)?.tipo !== tipo) return false;
        if (texto && !p.nombre.toLowerCase().includes(texto)) return false;
        return true;
      })
      .sort((a, b) => {
        const ca = porId.get(a.categoriaId)?.orden ?? 0;
        const cb = porId.get(b.categoriaId)?.orden ?? 0;
        return ca - cb || a.orden - b.orden;
      });
  });

  nombreCategoria(id: string): string {
    return this.servicio.categoria(id)?.nombre ?? 'Sin categoría';
  }

  etiquetaTipo(t: TipoCategoria): string {
    return t === 'plato' ? 'Cocina' : t === 'postre' ? 'Postres' : 'Bodega';
  }

  // ---- Alta y edicion ------------------------------------------------------

  nuevo(): void {
    const primera = this.categoriasFiltro()[0] ?? this.categorias()[0];
    this.esAlta.set(true);
    this.editando.set(this.plantilla(primera?.id ?? ''));
    this.volcarEnFormulario(this.editando()!);
  }

  editar(p: Producto): void {
    this.esAlta.set(false);
    this.editando.set(p);
    this.volcarEnFormulario(p);
  }

  cancelar(): void {
    this.editando.set(null);
  }

  guardar(): void {
    const base = this.editando();
    if (!base || !this.fNombre().trim()) return;

    const precio = this.fPrecio();
    const producto: Producto = {
      ...base,
      nombre: this.fNombre().trim(),
      descripcion: this.fDescripcion().trim() || null,
      categoriaId: this.fCategoria(),
      precio: precio === null || Number.isNaN(precio) ? null : Number(precio),
      precioNota: this.fPrecioNota().trim() || null,
      unidad: this.fUnidad().trim() || null,
      imagen: this.fImagen().trim() || null,
      distintivos: this.fDistintivos()
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
      activo: this.fActivo(),
      destacado: this.fDestacado(),
    };

    // El id se fija en el alta y ya no cambia: es la referencia que usaran las
    // fotos y, mas adelante, el backend.
    if (this.esAlta()) {
      producto.id = this.servicio.nuevoId(
        producto.nombre,
        this.todos().map((p) => p.id),
      );
      producto.orden = this.servicio.productosDe(producto.categoriaId, false).length;
    }

    this.servicio.guardarProducto(producto);
    this.editando.set(null);
  }

  alternarActivo(p: Producto): void {
    this.servicio.guardarProducto({ ...p, activo: !p.activo });
  }

  /* Dos toques para borrar: el primero pregunta y el segundo ejecuta. */
  borrar(p: Producto): void {
    if (this.porBorrar() !== p.id) {
      this.porBorrar.set(p.id);
      setTimeout(() => {
        if (this.porBorrar() === p.id) this.porBorrar.set(null);
      }, 4000);
      return;
    }
    this.porBorrar.set(null);
    if (this.editando()?.id === p.id) this.editando.set(null);
    this.servicio.borrarProducto(p.id);
  }

  private plantilla(categoriaId: string): Producto {
    return {
      id: '',
      categoriaId,
      nombre: '',
      descripcion: null,
      precio: null,
      precioNota: null,
      unidad: null,
      imagen: null,
      distintivos: [],
      destacado: false,
      activo: true,
      orden: 0,
    };
  }

  private volcarEnFormulario(p: Producto): void {
    this.fNombre.set(p.nombre);
    this.fDescripcion.set(p.descripcion ?? '');
    this.fCategoria.set(p.categoriaId);
    this.fPrecio.set(p.precio);
    this.fPrecioNota.set(p.precioNota ?? '');
    this.fUnidad.set(p.unidad ?? '');
    this.fImagen.set(p.imagen ?? '');
    this.fDistintivos.set(p.distintivos.join('\n'));
    this.fActivo.set(p.activo);
    this.fDestacado.set(p.destacado);
  }
}
