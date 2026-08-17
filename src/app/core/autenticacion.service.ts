import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API } from './api';

interface RespuestaAcceso {
  token: string | null;
  expira: string | null;
  usuario: string;
  rol: string;
}

/* El token se guarda en el navegador para no tener que volver a entrar en cada
   recarga. Va en `localStorage` y no en una cookie porque la API es sin sesion:
   el token viaja en la cabecera de cada peticion y no lo manda el navegador
   solo, asi que un tercero no puede provocar una peticion autenticada. */
const CLAVE = 'niu.token';
const CLAVE_USUARIO = 'niu.usuario';

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly http = inject(HttpClient);

  private readonly guardado = signal<string | null>(localStorage.getItem(CLAVE));
  readonly usuario = signal<string | null>(localStorage.getItem(CLAVE_USUARIO));

  readonly identificado = computed(() => this.guardado() !== null);

  token(): string | null {
    return this.guardado();
  }

  /** Devuelve el mensaje de error, o nulo si ha entrado. */
  async entrar(usuario: string, clave: string): Promise<string | null> {
    try {
      const r = await firstValueFrom(
        this.http.post<RespuestaAcceso>(`${API}/auth/login`, { usuario, clave }),
      );
      if (!r.token) return 'El servidor no ha devuelto ningún token.';

      localStorage.setItem(CLAVE, r.token);
      localStorage.setItem(CLAVE_USUARIO, r.usuario);
      this.guardado.set(r.token);
      this.usuario.set(r.usuario);
      return null;
    } catch (e: unknown) {
      const estado = (e as { status?: number }).status;
      if (estado === 401) return 'Usuario o clave incorrectos.';
      if (estado === 0) return 'No hay conexión con el servidor. ¿Está arrancado?';
      return 'No se ha podido entrar. Inténtalo de nuevo.';
    }
  }

  salir(): void {
    localStorage.removeItem(CLAVE);
    localStorage.removeItem(CLAVE_USUARIO);
    this.guardado.set(null);
    this.usuario.set(null);
  }

  /** Comprueba con el servidor que el token guardado sigue valiendo. */
  async sigueValiendo(): Promise<boolean> {
    if (!this.guardado()) return false;
    try {
      await firstValueFrom(this.http.get<RespuestaAcceso>(`${API}/auth/yo`));
      return true;
    } catch {
      this.salir();
      return false;
    }
  }
}
