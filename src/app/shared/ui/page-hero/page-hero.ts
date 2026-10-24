import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../icon/icon';

export interface Breadcrumb {
  label: string;
  path?: string;
}

/** Encabezado de las páginas internas, con migas de pan y una ranura para acciones. */
@Component({
  selector: 'app-page-hero',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-hero">
      <div class="container">
        <nav aria-label="Ruta de navegación">
          <ol class="crumbs">
            <li><a routerLink="/">Inicio</a></li>
            @for (crumb of breadcrumbs(); track crumb.label) {
              <li>
                <app-icon name="chevron-right" [size]="14" />
                @if (crumb.path) {
                  <a [routerLink]="crumb.path">{{ crumb.label }}</a>
                } @else {
                  <span aria-current="page">{{ crumb.label }}</span>
                }
              </li>
            }
          </ol>
        </nav>
        <div class="content">
          @if (eyebrow()) {
            <p class="eyebrow">{{ eyebrow() }}</p>
          }
          <h1>{{ title() }}</h1>
          @if (lead()) {
            <p class="lead">{{ lead() }}</p>
          }
          <ng-content />
        </div>
      </div>
      <svg class="steps" viewBox="0 0 220 160" aria-hidden="true" focusable="false">
        <rect x="0" y="110" width="44" height="50" rx="8" />
        <rect x="56" y="76" width="44" height="84" rx="8" />
        <rect x="112" y="42" width="44" height="118" rx="8" />
        <rect x="168" y="8" width="44" height="152" rx="8" class="top" />
      </svg>
    </header>
  `,
  styles: `
    .page-hero {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 85% 20%, rgb(244 165 28 / 0.18), transparent 40%),
        linear-gradient(160deg, var(--navy-900), var(--navy-800) 60%, #123c5c);
      color: #d6e0ea;
      padding-block: var(--space-6) var(--space-8);
    }

    .crumbs {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      list-style: none;
      padding: 0;
      margin: 0 0 var(--space-7);
      font-size: var(--fs-sm);

      li {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
      }

      a {
        color: #c3d0dd;
        text-decoration: none;

        &:hover {
          color: var(--white);
          text-decoration: underline;
        }
      }

      span {
        color: var(--sun-400);
        font-weight: 700;
      }
    }

    .content {
      position: relative;
      z-index: 1;
      max-width: 780px;
    }

    h1 {
      color: var(--white);
    }

    .eyebrow {
      color: var(--sun-400);
    }

    .lead {
      color: #c3d0dd;
      margin-bottom: var(--space-5);
    }

    .steps {
      position: absolute;
      right: -20px;
      bottom: -10px;
      width: min(34vw, 300px);
      opacity: 0.14;
      fill: var(--teal-500);

      .top {
        fill: var(--sun-500);
      }
    }
  `,
})
export class PageHero {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly lead = input<string>();
  readonly breadcrumbs = input<Breadcrumb[]>([]);
}
