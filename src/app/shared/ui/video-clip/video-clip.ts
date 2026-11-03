import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Clip vertical corto (15–20 s) con póster, carga diferida y subtítulos.
 * Nunca se reproduce solo ni con sonido: la persona decide.
 *
 * TODO (equipo): grabar los 3 clips y guardarlos en `public/video/` junto con su póster y su archivo de subtítulos (.vtt):
 *   1) «Qué es Paso Firme»  2) «Cómo es una visita en tu puesto»  3) «Tu información es tuya».
 * Mientras `src` esté vacío no se muestra nada: no se inventa contenido.
 */
@Component({
  selector: 'app-video-clip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src()) {
      <figure class="clip">
        <video controls preload="none" playsinline [attr.poster]="poster() || null" [attr.aria-label]="titulo()">
          <source [src]="src()" type="video/mp4" />
          @if (subtitulos()) {
            <track kind="subtitles" srclang="es" label="Español" [src]="subtitulos()" default />
          }
        </video>
        <figcaption>{{ titulo() }}</figcaption>
      </figure>
    }
  `,
  styles: `
    .clip {
      margin: 0;
      max-width: 320px;
    }

    video {
      width: 100%;
      aspect-ratio: 9 / 16;
      border-radius: var(--radius);
      background: var(--navy-900);
    }

    figcaption {
      margin-top: var(--space-2);
      font-weight: 700;
      font-size: var(--fs-sm);
    }
  `,
})
export class VideoClip {
  readonly src = input('');
  readonly poster = input('');
  readonly subtitulos = input('');
  readonly titulo = input.required<string>();
}
