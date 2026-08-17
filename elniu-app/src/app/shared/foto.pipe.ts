import { Pipe, PipeTransform } from '@angular/core';

/* Las imagenes se guardan como ruta corta («galeria/paella.jpg») para que el
   panel de administracion no tenga que manejar rutas absolutas.

   La ruta que se devuelve es relativa a proposito, no «/assets/...»: el
   navegador la resuelve contra el `<base href>` del index, asi que la misma
   compilacion sirve tanto en la raiz de un dominio como colgando de una
   subcarpeta, que es como la publica GitHub Pages. */
@Pipe({ name: 'foto' })
export class FotoPipe implements PipeTransform {
  transform(ruta: string | null | undefined): string | null {
    if (!ruta) return null;
    if (/^(https?:|\/|data:)/.test(ruta)) return ruta;
    return `assets/${ruta}`;
  }
}
