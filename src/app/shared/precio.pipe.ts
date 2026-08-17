import { Pipe, PipeTransform } from '@angular/core';

/* Precio como lo escribe la casa: «12€», «16,50€». Sin decimales cuando son
   cero, porque en una carta «12,00€» se lee peor que «12€». */
@Pipe({ name: 'precio' })
export class PrecioPipe implements PipeTransform {
  transform(valor: number | null | undefined, alternativa = 'S/M'): string {
    if (valor === null || valor === undefined || Number.isNaN(valor)) return alternativa;
    const entero = Number.isInteger(valor);
    return `${valor.toFixed(entero ? 0 : 2).replace('.', ',')}€`;
  }
}
