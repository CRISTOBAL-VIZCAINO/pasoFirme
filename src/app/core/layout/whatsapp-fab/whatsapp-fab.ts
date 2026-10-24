import { ChangeDetectionStrategy, Component } from '@angular/core';

import { whatsappUrl } from '../../../data/site.config';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-whatsapp-fab',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="fab" [href]="url" target="_blank" rel="noopener">
      <app-icon name="chat" [size]="26" />
      <span class="text">¿Hablamos?</span>
      <span class="visually-hidden">(se abre WhatsApp en una pestaña nueva)</span>
    </a>
  `,
  styles: `
    .fab {
      position: fixed;
      right: clamp(1rem, 3vw, 1.75rem);
      bottom: clamp(1rem, 3vw, 1.75rem);
      z-index: 90;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 56px;
      padding: 0 1.1rem;
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

    .text {
      display: none;

      @media (min-width: 720px) {
        display: inline;
      }
    }
  `,
})
export class WhatsappFab {
  protected readonly url = whatsappUrl('Hola, quiero saber más sobre Paso Firme.');
}
