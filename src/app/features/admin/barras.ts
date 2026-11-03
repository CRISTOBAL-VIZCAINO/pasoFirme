import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { num } from './admin-fechas';

export interface ItemBarra {
  etiqueta: string;
  valor: number;
  /** Texto secundario (p. ej. «12 visitantes · 1 min 5 s»). */
  extra?: string;
}

/** Lista de barras horizontales hecha con CSS, sin librerías. */
@Component({
  selector: 'app-barras',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <ul class="barras">
        @for (it of filas(); track it.etiqueta) {
          <li>
            <div class="top">
              <span class="et">{{ it.etiqueta }}</span>
              <span class="val">{{ it.texto }}</span>
            </div>
            <div class="pista" aria-hidden="true"><div class="barra" [style.width.%]="it.ancho"></div></div>
            @if (it.extra) {
              <small>{{ it.extra }}</small>
            }
          </li>
        }
      </ul>
    } @else {
      <p class="vacio">{{ vacio() }}</p>
    }
  `,
  styles: `
    .barras {
      display: grid;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .top {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      font-size: var(--fs-sm);
    }

    .et {
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .val {
      font-variant-numeric: tabular-nums;
      color: var(--navy-900);
      font-weight: 700;
    }

    .pista {
      height: 10px;
      border-radius: 999px;
      background: var(--sand-200);
      overflow: hidden;
    }

    .barra {
      height: 100%;
      min-width: 2px;
      border-radius: 999px;
      background: var(--teal-600);
    }

    small {
      color: var(--ink-500);
    }

    .vacio {
      margin: 0;
      color: var(--ink-500);
    }
  `,
})
export class Barras {
  readonly items = input.required<ItemBarra[]>();
  readonly vacio = input('Aún no hay datos en este rango.');

  protected readonly filas = computed(() => {
    const max = Math.max(1, ...this.items().map((i) => i.valor));
    return this.items().map((i) => ({ ...i, texto: num(i.valor), ancho: (i.valor / max) * 100 }));
  });
}
