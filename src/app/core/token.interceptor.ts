import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { API } from './api';
import { AutenticacionService } from './autenticacion.service';

/* Pone el token en todas las llamadas a la API y, si el servidor contesta que
   ya no vale, cierra la sesion para que el panel vuelva a pedir la clave en vez
   de quedarse dando errores. */
export const interceptorToken: HttpInterceptorFn = (peticion, siguiente) => {
  const auth = inject(AutenticacionService);
  const token = auth.token();
  const esLogin = peticion.url.includes('/auth/login');

  const conToken =
    token && peticion.url.startsWith(API) && !esLogin
      ? peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : peticion;

  return siguiente(conToken).pipe(
    catchError((error: HttpErrorResponse) => {
      // En el login un 401 solo significa que la clave no era esa.
      if (error.status === 401 && token && !esLogin) {
        auth.salir();
      }
      return throwError(() => error);
    }),
  );
};
