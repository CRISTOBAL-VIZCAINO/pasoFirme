import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Icon } from '../icon/icon';

/**
 * Reproductor de «nota de voz» de la página.
 * TODO: grabar el audio de ~1 minuto (tono cercano, costeño) y poner su ruta en `AUDIO_PRESENTACION`.
 * Mientras `src` esté vacío no se muestra nada: no se inventa contenido.
 */
@Component({
  selector: 'app-voice-note',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src()) {
      <figure class="voice">
        <figcaption><app-icon name="mic" [size]="20" /> Escucha esta página en 1 minuto</figcaption>
        <audio controls preload="none" [src]="src()">Tu navegador no puede reproducir audio.</audio>
        @if (transcripcion()) {
          <details>
            <summary>Leer lo que dice el audio</summary>
            <p>{{ transcripcion() }}</p>
          </details>
        }
        <a class="share" [href]="compartir()" target="_blank" rel="noopener">Compartir por WhatsApp</a>
      </figure>
    }
  `,
  styles: `
    .voice {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: var(--space-4);
      border-radius: var(--radius);
      background: var(--white);
      border: 1px solid var(--line);
    }

    figcaption {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-display);
      font-weight: 700;
      color: var(--navy-900);
    }

    audio {
      width: 100%;
    }

    .share {
      font-weight: 700;
      font-size: var(--fs-sm);
    }
  `,
})
export class VoiceNote {
  readonly src = input('');
  readonly transcripcion = input('');

  protected readonly compartir = computed(
    () => `https://wa.me/?text=${encodeURIComponent('Escucha qué es Paso Firme (1 minuto): ' + (typeof location !== 'undefined' ? location.origin : ''))}`,
  );
}
