import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

const formatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/**
 * Cuenta de 0 al valor final (≈ 800 ms, una sola vez) cuando el número entra en pantalla.
 * El texto final ya viene escrito en la plantilla: sin JS o con `prefers-reduced-motion` no hay animación.
 */
@Directive({ selector: '[appCountUp]' })
export class CountUp {
  readonly appCountUp = input.required<number>();
  readonly prefix = input('');
  readonly suffix = input('');

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);
    const node = this.el.nativeElement;
    const texto = (n: number) => `${this.prefix()}${formatter.format(Math.round(n))}${this.suffix()}`;

    afterNextRender(() => {
      const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducir || !('IntersectionObserver' in window)) {
        return;
      }
      let raf = 0;
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        observer.disconnect();
        const meta = this.appCountUp();
        const inicio = performance.now();
        const paso = (ahora: number) => {
          const t = Math.min(1, (ahora - inicio) / 800);
          const suave = 1 - Math.pow(1 - t, 3);
          node.textContent = texto(meta * suave);
          if (t < 1) {
            raf = requestAnimationFrame(paso);
          }
        };
        raf = requestAnimationFrame(paso);
      });
      observer.observe(node);
      destroyRef.onDestroy(() => {
        observer.disconnect();
        cancelAnimationFrame(raf);
      });
    });
  }
}
