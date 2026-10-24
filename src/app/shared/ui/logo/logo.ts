import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Logotipo: cuatro escalones (P·A·S·O) que suben hacia el último, en color sol. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="logo" [class.logo--light]="light()">
      <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true" focusable="false">
        <rect width="40" height="40" rx="11" [attr.fill]="light() ? '#ffffff' : '#0b2239'" />
        <rect x="6" y="24" width="6" height="10" rx="2" fill="#179482" />
        <rect x="13.5" y="18" width="6" height="16" rx="2" fill="#179482" />
        <rect x="21" y="12" width="6" height="22" rx="2" fill="#179482" />
        <rect x="28.5" y="6" width="6" height="28" rx="2" fill="#f4a51c" />
      </svg>
      <span class="wordmark">Paso<strong>Firme</strong></span>
    </span>
  `,
  styles: `
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
    }

    .wordmark {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.35rem;
      letter-spacing: -0.03em;
      color: var(--navy-900);

      strong {
        font-weight: 800;
        color: var(--teal-700);
      }
    }

    .logo--light .wordmark {
      color: var(--white);

      strong {
        color: var(--sun-400);
      }
    }
  `,
})
export class Logo {
  readonly light = input(false);
}
