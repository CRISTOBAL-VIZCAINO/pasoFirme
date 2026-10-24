import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container container--narrow box">
        <p class="code" aria-hidden="true">404</p>
        <h1>Este paso no existe</h1>
        <p class="lead">La página que buscas se movió o nunca existió. Volvamos a terreno firme.</p>
        <div class="btn-row">
          <a routerLink="/" class="btn btn--primary"><app-icon name="arrow-left" [size]="20" /> Ir al inicio</a>
          <a routerLink="/herramientas" class="btn btn--outline">Ver herramientas</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .box {
      text-align: center;

      .btn-row {
        justify-content: center;
      }
    }

    .code {
      margin: 0;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: clamp(5rem, 3rem + 10vw, 9rem);
      line-height: 1;
      letter-spacing: -0.05em;
      background: linear-gradient(135deg, var(--teal-600), var(--sun-500));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
  `,
})
export class NotFound {}
