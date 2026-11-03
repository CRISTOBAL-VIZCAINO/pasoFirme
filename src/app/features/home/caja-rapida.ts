import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CopPipe } from '../../shared/pipes/cop.pipe';
import { Icon } from '../../shared/ui/icon/icon';
import { calcularCaja } from '../herramientas/calculos';

const aNumero = (v: string): number => Number(v.replace(/\D/g, '')) || 0;
const miles = new Intl.NumberFormat('es-CO');

/**
 * Versión corta de la herramienta «¿Cuánto ganas de verdad?» para el inicio.
 * Usa la misma lógica que /herramientas/caja-diaria. No guarda nada de lo que se escribe.
 */
@Component({
  selector: 'app-caja-rapida',
  imports: [RouterLink, Icon, CopPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="calc">
      <form class="fields" (submit)="$event.preventDefault()" aria-label="Calculadora de ganancia diaria">
        <div class="field">
          <label class="label" for="cr-ventas">Hoy vendí</label>
          <input id="cr-ventas" class="input" inputmode="numeric" autocomplete="off" placeholder="$ 200.000" [value]="ventas()" (input)="ventas.set(valor($event))" />
        </div>
        <div class="field">
          <label class="label" for="cr-merc">Compré de mercancía</label>
          <input id="cr-merc" class="input" inputmode="numeric" autocomplete="off" placeholder="$ 110.000" [value]="mercancia()" (input)="mercancia.set(valor($event))" />
        </div>
        <div class="field">
          <label class="label" for="cr-gastos">Otros gastos del negocio</label>
          <input id="cr-gastos" class="input" inputmode="numeric" autocomplete="off" placeholder="$ 15.000" [value]="gastos()" (input)="gastos.set(valor($event))" />
        </div>
        <div class="field">
          <label class="label" for="cr-casa">Saqué para la casa</label>
          <input id="cr-casa" class="input" inputmode="numeric" autocomplete="off" placeholder="$ 70.000" [value]="casa()" (input)="casa.set(valor($event))" />
        </div>
      </form>

      <div class="result" aria-live="polite" [class]="'result result--' + (r()?.semaforo ?? 'vacio')">
        @if (r(); as res) {
          <span class="light" aria-hidden="true"></span>
          <p class="big">
            Te quedaron <strong>{{ res.gananciaRealDiaria | cop }}</strong> de ganancia hoy
          </p>
          <p class="msg">{{ mensaje() }}</p>
          <div class="actions">
            <a class="btn btn--primary" routerLink="/inscripcion">Quiero que me ayuden a ordenar mi caja</a>
            <a class="btn btn--outline" [href]="compartir()" target="_blank" rel="noopener">
              <app-icon name="chat" [size]="18" /> Compartir por WhatsApp
            </a>
          </div>
        } @else {
          <p class="msg">Escribe cuánto vendiste y gastaste hoy. Verás tu ganancia real en un segundo. No guardamos lo que escribes.</p>
        }
      </div>
    </div>
  `,
  styles: `
    .calc {
      display: grid;
      gap: var(--space-5);
      padding: clamp(1.25rem, 1rem + 2vw, 2rem);
      border-radius: var(--radius-lg);
      background: var(--white);
      border: 1px solid var(--line);
      box-shadow: var(--shadow);

      @media (min-width: 900px) {
        grid-template-columns: 1fr 1fr;
        align-items: stretch;
      }
    }

    .fields {
      display: grid;
      gap: var(--space-4);
      grid-template-columns: 1fr 1fr;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .result {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-5);
      border-radius: var(--radius);
      background: var(--sand-100);
      border-left: 8px solid var(--line-strong);
    }

    .result--verde {
      background: var(--teal-50);
      border-left-color: var(--teal-600);
    }

    .result--amarillo {
      background: var(--sun-100);
      border-left-color: var(--sun-500);
    }

    .result--rojo {
      background: var(--coral-100);
      border-left-color: var(--coral-600);
    }

    .light {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: currentColor;
    }

    .result--verde .light {
      color: var(--teal-600);
    }

    .result--amarillo .light {
      color: var(--sun-500);
    }

    .result--rojo .light {
      color: var(--coral-600);
    }

    .big {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--fs-lg);
      color: var(--navy-900);

      strong {
        display: block;
        font-size: var(--fs-2xl);
        line-height: 1.1;
      }
    }

    .msg {
      margin: 0;
      color: var(--ink-700);
    }

    .actions {
      display: grid;
      gap: var(--space-3);
      margin-top: var(--space-2);
    }
  `,
})
export class CajaRapida {
  protected readonly ventas = signal('');
  protected readonly mercancia = signal('');
  protected readonly gastos = signal('');
  protected readonly casa = signal('');

  /** Deja solo dígitos y los muestra con separador de miles. */
  protected valor(e: Event): string {
    const limpio = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    return limpio ? miles.format(Number(limpio)) : '';
  }

  protected readonly r = computed(() => {
    const ventas = aNumero(this.ventas());
    if (ventas <= 0) {
      return null;
    }
    return calcularCaja({
      ventasDiarias: ventas,
      diasSemana: 6,
      costoMercanciaPct: Math.min(100, (aNumero(this.mercancia()) / ventas) * 100),
      gastosNegocioDiarios: aNumero(this.gastos()),
      retiroCasaDiario: aNumero(this.casa()),
      cuotaDeudaDiaria: 0,
    });
  });

  protected readonly mensaje = computed(() => {
    const r = this.r();
    if (!r) {
      return '';
    }
    if (r.semaforo === 'verde') {
      return 'Vas bien: después de lo que sacas para la casa, todavía te sobra plata para resurtir y ahorrar.';
    }
    if (r.semaforo === 'amarillo') {
      return 'Ojo: casi toda la ganancia se va a la casa. Si sigue así, el negocio no crece.';
    }
    return 'Estás sacando más de lo que gana el negocio. Así el negocio se va quedando sin capital.';
  });

  protected readonly compartir = computed(() => {
    const r = this.r();
    const ganancia = r ? miles.format(Math.round(r.gananciaRealDiaria)) : '';
    const texto = `Hice las cuentas de mi negocio con Paso Firme: hoy me quedaron $${ganancia} de ganancia.`;
    return `https://wa.me/?text=${encodeURIComponent(texto)}`;
  });
}
