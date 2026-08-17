import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AutenticacionService } from '../core/autenticacion.service';

/** Puerta del panel. Sin token no se pinta nada de administracion. */
@Component({
  selector: 'niu-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="puerta">
      <form class="tarjeta" (ngSubmit)="entrar()">
        <a routerLink="/" class="volver etiqueta">&#8592; Volver a la web</a>

        <h1 class="titulo">Administración</h1>
        <p class="sub">Restaurant el Niu</p>

        <label class="campo">
          <span>Usuario</span>
          <input name="usuario" autocomplete="username" [(ngModel)]="usuario" required />
        </label>

        <label class="campo">
          <span>Clave</span>
          <input
            type="password"
            name="clave"
            autocomplete="current-password"
            [(ngModel)]="clave"
            required
          />
        </label>

        @if (fallo()) {
          <p class="fallo" role="alert">{{ fallo() }}</p>
        }

        <button type="submit" class="boton" [disabled]="!listo() || entrando()">
          {{ entrando() ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .puerta {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100svh;
      padding: 24px 16px;
      background: var(--tinta);
    }

    .tarjeta {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      max-width: 380px;
      padding: 32px 28px;
      border-radius: var(--pastilla);
      background: var(--arena-clara);
    }

    .volver {
      align-self: flex-start;
      opacity: 0.5;

      &:hover {
        color: var(--naranja);
      }
    }

    .titulo {
      margin: 6px 0 0;
      font-family: Anton, sans-serif;
      font-size: 28px;
      text-transform: uppercase;
      line-height: 1;
    }

    .sub {
      margin: 0 0 6px;
      font-size: 12px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      opacity: 0.45;
    }

    .fallo {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      font-weight: 700;
      color: #b3341c;
    }

    .boton {
      margin-top: 4px;
    }
  `,
})
export class LoginPage {
  private readonly auth = inject(AutenticacionService);

  readonly usuario = signal('');
  readonly clave = signal('');
  readonly fallo = signal<string | null>(null);
  readonly entrando = signal(false);

  listo(): boolean {
    return !!this.usuario().trim() && !!this.clave();
  }

  async entrar(): Promise<void> {
    if (!this.listo() || this.entrando()) return;

    this.entrando.set(true);
    this.fallo.set(null);

    const error = await this.auth.entrar(this.usuario().trim(), this.clave());

    this.entrando.set(false);
    if (error) {
      this.fallo.set(error);
      // Se borra la clave pero no el usuario: casi siempre el fallo esta en la
      // clave, y volver a escribir el usuario es una molestia de mas.
      this.clave.set('');
    }
  }
}
