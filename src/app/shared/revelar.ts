import { Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';

/* Hace que un bloque entre desde abajo la primera vez que asoma en pantalla.

   Con IntersectionObserver y no con `animation-timeline: view()` porque esa
   propiedad solo la tiene Chromium y en Firefox y Safari los bloques se
   quedaban quietos. Se desengancha en cuanto ha entrado: la animacion es de
   bienvenida, no debe repetirse al subir y bajar. */
@Directive({
  selector: '[revelar]',
  host: { '[attr.data-revelar]': '""' },
})
export class Revelar implements OnDestroy {
  /** Retardo en milisegundos, para escalonar una rejilla de tarjetas. */
  readonly revelar = input<number | string>(0);

  private readonly el = inject(ElementRef<HTMLElement>);
  private observador?: IntersectionObserver;

  constructor() {
    const nodo = this.el.nativeElement as HTMLElement;

    // Sin soporte o con movimiento reducido se muestra sin mas.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      nodo.classList.add('visible');
      return;
    }

    this.observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const espera = Number(this.revelar()) || 0;
          nodo.style.transitionDelay = `${espera}ms`;
          nodo.classList.add('visible');
          this.desconectar();
        }
      },
      // Un margen negativo abajo evita que se dispare con el bloque apenas
      // asomando por el borde de la pantalla.
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    );
    this.observador.observe(nodo);
  }

  ngOnDestroy(): void {
    this.desconectar();
  }

  private desconectar(): void {
    this.observador?.disconnect();
    this.observador = undefined;
  }
}
