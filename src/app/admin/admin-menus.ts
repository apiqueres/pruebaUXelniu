import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CatalogoService } from '../core/catalogo.service';
import type { Menu } from '../core/modelos';
import { PrecioPipe } from '../shared/precio.pipe';

@Component({
  selector: 'niu-admin-menus',
  imports: [FormsModule, PrecioPipe],
  template: `
    <div class="admin-cabecera">
      <h2 class="admin-cabecera__titulo">Menús</h2>
      <button type="button" class="boton" (click)="nuevo()">Añadir</button>
    </div>

    @if (editando()) {
      <form class="admin-editor" (ngSubmit)="guardar()">
        <h3 class="admin-editor__titulo">{{ esAlta() ? 'Nuevo menú' : 'Editar menú' }}</h3>

        <div class="admin-rejilla">
          <label class="campo">
            <span>Nombre</span>
            <input name="nombre" [(ngModel)]="fNombre" required />
          </label>
          <label class="campo">
            <span>Cuándo se sirve</span>
            <input
              name="disponibilidad"
              placeholder="De miércoles a viernes al mediodía"
              [(ngModel)]="fDisponibilidad"
            />
          </label>
          <label class="campo">
            <span>Precio (€)</span>
            <input type="number" name="precio" step="0.5" min="0" [(ngModel)]="fPrecio" />
          </label>
          <label class="campo">
            <span>Texto si no hay precio</span>
            <input name="precioNota" placeholder="a consultar" [(ngModel)]="fPrecioNota" />
          </label>
        </div>

        <label class="campo">
          <span>Qué incluye (uno por línea)</span>
          <textarea name="incluye" rows="4" [(ngModel)]="fIncluye"></textarea>
        </label>

        <label class="campo">
          <span>Condiciones (una por línea)</span>
          <textarea name="condiciones" [(ngModel)]="fCondiciones"></textarea>
        </label>

        <label class="campo">
          <span>Imagen</span>
          <input name="imagen" placeholder="menus/menu-diario.jpg" [(ngModel)]="fImagen" />
        </label>

        <div class="admin-interruptores">
          <label class="admin-interruptor">
            <input type="checkbox" name="activo" [(ngModel)]="fActivo" />
            Visible en la web
          </label>
          <label class="admin-interruptor">
            <input type="checkbox" name="especial" [(ngModel)]="fEspecial" />
            Menú de temporada
          </label>
        </div>

        <div class="admin-editor__pie">
          <button type="submit" class="boton" [disabled]="!fNombre().trim()">Guardar</button>
          <button type="button" class="boton boton--linea" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    }

    <div class="admin-filtros">
      <select [(ngModel)]="filtro" [ngModelOptions]="{ standalone: true }">
        <option value="">Todos</option>
        <option value="fijo">Menús fijos</option>
        <option value="especial">De temporada</option>
      </select>
    </div>

    <div class="admin-lista">
      @for (m of visibles(); track m.id) {
        <div class="admin-fila" [class.admin-fila--apagada]="!m.activo">
          <div class="admin-fila__cuerpo">
            <div class="admin-fila__nombre">
              {{ m.nombre }}
              @if (m.especial) { <span class="insignia">Temporada</span> }
              @if (!m.activo) { <span class="insignia insignia--gris">Oculto</span> }
            </div>
            <div class="admin-fila__meta">{{ m.disponibilidad || 'Sin fecha indicada' }}</div>
          </div>

          <div class="admin-fila__precio">{{ m.precio | precio: m.precioNota ?? '—' }}</div>

          <div class="admin-fila__acciones">
            <button type="button" class="admin-mini" (click)="alternarActivo(m)">
              {{ m.activo ? 'Ocultar' : 'Mostrar' }}
            </button>
            <button type="button" class="admin-mini" (click)="editar(m)">Editar</button>
            <button
              type="button"
              class="admin-mini admin-mini--peligro"
              [class.admin-mini--activo]="porBorrar() === m.id"
              (click)="borrar(m)"
            >
              {{ porBorrar() === m.id ? '¿Seguro?' : 'Borrar' }}
            </button>
          </div>
        </div>
      } @empty {
        <p class="admin-vacio">No hay menús en este filtro.</p>
      }
    </div>

    <p class="admin-recuento">{{ visibles().length }} de {{ todos().length }} menús</p>
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
export class AdminMenus {
  private readonly servicio = inject(CatalogoService);

  readonly todos = this.servicio.menus;
  readonly filtro = signal<'' | 'fijo' | 'especial'>('');
  readonly porBorrar = signal<string | null>(null);

  readonly editando = signal<Menu | null>(null);
  readonly esAlta = signal(false);

  readonly fNombre = signal('');
  readonly fDisponibilidad = signal('');
  readonly fPrecio = signal<number | null>(null);
  readonly fPrecioNota = signal('');
  readonly fIncluye = signal('');
  readonly fCondiciones = signal('');
  readonly fImagen = signal('');
  readonly fActivo = signal(true);
  readonly fEspecial = signal(false);

  readonly visibles = computed(() => {
    const f = this.filtro();
    if (!f) return this.todos();
    return this.todos().filter((m) => (f === 'especial' ? m.especial : !m.especial));
  });

  nuevo(): void {
    this.esAlta.set(true);
    this.editando.set(this.plantilla());
    this.volcarEnFormulario(this.editando()!);
  }

  editar(m: Menu): void {
    this.esAlta.set(false);
    this.editando.set(m);
    this.volcarEnFormulario(m);
  }

  cancelar(): void {
    this.editando.set(null);
  }

  guardar(): void {
    const base = this.editando();
    if (!base || !this.fNombre().trim()) return;

    const precio = this.fPrecio();
    const menu: Menu = {
      ...base,
      nombre: this.fNombre().trim(),
      disponibilidad: this.fDisponibilidad().trim(),
      precio: precio === null || Number.isNaN(precio) ? null : Number(precio),
      precioNota: this.fPrecioNota().trim() || null,
      incluye: this.lineas(this.fIncluye()),
      condiciones: this.lineas(this.fCondiciones()),
      imagen: this.fImagen().trim() || null,
      activo: this.fActivo(),
      especial: this.fEspecial(),
    };

    if (this.esAlta()) {
      menu.id = this.servicio.nuevoId(
        menu.nombre,
        this.todos().map((m) => m.id),
      );
    }

    this.servicio.guardarMenu(menu);
    this.editando.set(null);
  }

  alternarActivo(m: Menu): void {
    this.servicio.guardarMenu({ ...m, activo: !m.activo });
  }

  borrar(m: Menu): void {
    if (this.porBorrar() !== m.id) {
      this.porBorrar.set(m.id);
      setTimeout(() => {
        if (this.porBorrar() === m.id) this.porBorrar.set(null);
      }, 4000);
      return;
    }
    this.porBorrar.set(null);
    if (this.editando()?.id === m.id) this.editando.set(null);
    this.servicio.borrarMenu(m.id);
  }

  private lineas(texto: string): string[] {
    return texto
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  private plantilla(): Menu {
    return {
      id: '',
      nombre: '',
      disponibilidad: '',
      precio: null,
      precioNota: null,
      incluye: [],
      apartados: [],
      imagen: null,
      condiciones: [],
      especial: false,
      activo: true,
    };
  }

  private volcarEnFormulario(m: Menu): void {
    this.fNombre.set(m.nombre);
    this.fDisponibilidad.set(m.disponibilidad);
    this.fPrecio.set(m.precio);
    this.fPrecioNota.set(m.precioNota ?? '');
    this.fIncluye.set(m.incluye.join('\n'));
    this.fCondiciones.set(m.condiciones.join('\n'));
    this.fImagen.set(m.imagen ?? '');
    this.fActivo.set(m.activo);
    this.fEspecial.set(m.especial);
  }
}
