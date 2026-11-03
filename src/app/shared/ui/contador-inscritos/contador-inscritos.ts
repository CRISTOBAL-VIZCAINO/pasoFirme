import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';

/** Solo se muestra el contador cuando ya hay suficientes inscritos (prueba social real, nunca inventada). */
export const MINIMO_CONTADOR = 20;

/** «Ya se han inscrito N comerciantes». Si la consulta falla o N es bajo, no muestra nada. Nunca muestra nombres ni celulares. */
@Component({
  selector: 'app-contador-inscritos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (total() >= minimo) {
      <p class="contador" role="status">
        <span aria-hidden="true">🤝</span> Ya se han inscrito <strong>{{ total() }}</strong> comerciantes
      </p>
    }
  `,
  styles: `
    .contador {
      margin: 0;
      padding: var(--space-3) var(--space-4);
      text-align: center;
      font-family: var(--font-display);
      font-weight: 600;
      color: var(--navy-900);
      background: var(--teal-50);
    }
  `,
})
export class ContadorInscritos implements OnInit {
  protected readonly minimo = MINIMO_CONTADOR;
  protected readonly total = signal(0);

  async ngOnInit(): Promise<void> {
    try {
      const r = await fetch('/.netlify/functions/conteo');
      if (!r.ok) {
        return;
      }
      const datos = (await r.json()) as { total?: number };
      if (typeof datos.total === 'number') {
        this.total.set(datos.total);
      }
    } catch {
      // sin conexión o sin backend: no se muestra nada
    }
  }
}
