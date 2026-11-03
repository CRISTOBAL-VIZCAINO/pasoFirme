import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Muestra el elemento con una transición suave al entrar en pantalla.
 * Con `prefers-reduced-motion` el CSS desactiva el efecto.
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal' },
})
export class Reveal {
  /** Retardo en milisegundos, útil para escalonar tarjetas. */
  readonly revealDelay = input(0);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const node = this.el.nativeElement;
      // Estado inicial seguro: si ya está cerca de la pantalla o no hay observer, se muestra sin animar.
      const cerca = node.getBoundingClientRect().top < window.innerHeight + 120;
      if (cerca || !('IntersectionObserver' in window)) {
        node.classList.add('is-visible');
        return;
      }
      node.classList.add('reveal--armed');
      node.style.transitionDelay = `${Math.min(this.revealDelay(), 120)}ms`;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            node.classList.add('is-visible');
            observer.disconnect();
          }
        },
        { threshold: 0, rootMargin: '0px 0px 160px 0px' },
      );
      observer.observe(node);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
