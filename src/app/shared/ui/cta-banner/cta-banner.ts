import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { whatsappUrl } from '../../../data/site.config';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-cta-banner',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section section--tight" aria-labelledby="cta-title">
      <div class="container">
        <div class="banner">
          <div>
            <h2 id="cta-title">{{ title() }}</h2>
            <p>{{ text() }}</p>
          </div>
          <div class="btn-row">
            <a class="btn btn--primary" routerLink="/inscripcion">
              Inscribe tu negocio
              <app-icon name="arrow-right" [size]="20" />
            </a>
            <a class="btn btn--light" [href]="whatsapp" target="_blank" rel="noopener">
              <app-icon name="chat" [size]="20" />
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .banner {
      display: grid;
      gap: var(--space-5);
      align-items: center;
      padding: clamp(1.75rem, 1rem + 3vw, 3rem);
      border-radius: var(--radius-lg);
      background:
        radial-gradient(circle at 0% 100%, rgb(23 148 130 / 0.55), transparent 55%),
        radial-gradient(circle at 100% 0%, rgb(244 165 28 / 0.35), transparent 45%),
        var(--navy-900);
      color: #d6e0ea;
      box-shadow: var(--shadow-lg);

      @media (min-width: 900px) {
        grid-template-columns: 1.4fr auto;
      }
    }

    h2 {
      color: var(--white);
      font-size: var(--fs-xl);
      margin-bottom: var(--space-2);
    }

    p {
      margin: 0;
      max-width: 60ch;
    }
  `,
})
export class CtaBanner {
  readonly title = input('¿Listo para darle paso firme a tu negocio?');
  readonly text = input('Te visitamos en tu puesto, sin costo y sin que dejes de vender. Inscríbete en dos minutos.');

  protected readonly whatsapp = whatsappUrl('Hola, quiero que Paso Firme visite mi negocio.');
}
