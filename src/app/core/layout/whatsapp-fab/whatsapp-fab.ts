import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { TrackingService } from '../../tracking.service';

import { whatsappUrl } from '../../contacto';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-whatsapp-fab',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'revisar()',
    '(window:resize)': 'revisar()',
  },
  template: `
    <a class="fab" [class.fab--hidden]="oculto()" [attr.tabindex]="oculto() ? -1 : null" [attr.aria-hidden]="oculto() ? 'true' : null" [href]="url" target="_blank" rel="noopener" (click)="alClic()">
      <app-icon name="chat" [size]="24" />
      <span class="text">¿Hablamos?</span>
      <span class="visually-hidden">(se abre WhatsApp en una pestaña nueva)</span>
    </a>
  `,
  styles: `
    .fab {
      position: fixed;
      right: clamp(1rem, 3vw, 1.75rem);
      bottom: calc(clamp(0.75rem, 3vw, 1.75rem) + env(safe-area-inset-bottom, 0px));
      z-index: 90;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 48px;
      min-height: 48px;
      justify-content: center;
      padding: 0 0.8rem;
      border-radius: var(--radius-pill);
      background: #128c4a;
      color: var(--white);
      font-family: var(--font-display);
      font-weight: 700;
      text-decoration: none;
      box-shadow: var(--shadow-lg);
      transition: transform 0.2s var(--ease);

      &:hover {
        color: var(--white);
        transform: translateY(-2px) scale(1.02);
      }
    }

    .fab--hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px);
    }

    .text {
      display: none;

      @media (min-width: 720px) {
        display: inline;
      }
    }
  `,
})
export class WhatsappFab {
  /** Se oculta cuando ya hay un botón de WhatsApp a la vista (elementos con `data-hide-fab`). */
  protected readonly oculto = signal(false);
  private readonly tracking = inject(TrackingService);

  protected alClic(): void {
    this.tracking.registrar('whatsapp_click', { origen: 'flotante' });
  }

  private pendiente = false;

  protected revisar(): void {
    if (this.pendiente) {
      return;
    }
    this.pendiente = true;
    requestAnimationFrame(() => {
      this.pendiente = false;
      const alto = window.innerHeight;
      const visible = Array.from(document.querySelectorAll('[data-hide-fab]')).some((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < alto;
      });
      this.oculto.set(visible);
    });
  }

  protected readonly url = whatsappUrl('Hola, quiero que me visiten en mi puesto.');
}
