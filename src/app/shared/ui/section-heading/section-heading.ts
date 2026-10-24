import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-center]': "align() === 'center'" },
  template: `
    @if (eyebrow()) {
      <p class="eyebrow">{{ eyebrow() }}</p>
    }
    <h2 [attr.id]="headingId() || null">{{ title() }}</h2>
    @if (intro()) {
      <p class="lead">{{ intro() }}</p>
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: block;
      max-width: 760px;
      margin-bottom: var(--space-7);
    }

    :host(.is-center) {
      margin-inline: auto;
      text-align: center;

      .eyebrow::before {
        display: none;
      }
    }

    .lead {
      margin-bottom: 0;
    }
  `,
})
export class SectionHeading {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly intro = input<string>();
  readonly align = input<'start' | 'center'>('start');
  readonly headingId = input<string>();
}
