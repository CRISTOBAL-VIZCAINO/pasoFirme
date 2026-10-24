import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { Foto } from '../../../data/content';
import { Icon } from '../icon/icon';

const AUTOPLAY_MS = 6000;

/**
 * Carrusel de fotos accesible basado en scroll-snap: se desliza con el dedo en
 * celular y tiene flechas, puntos y reproducción automática pausable.
 * Si una foto aún no existe, muestra un espacio reservado con la sugerencia de toma.
 */
@Component({
  selector: 'app-photo-carousel',
  imports: [Icon],
  templateUrl: './photo-carousel.html',
  styleUrl: './photo-carousel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(mouseenter)': 'hover.set(true)',
    '(mouseleave)': 'hover.set(false)',
    '(focusin)': 'foco.set(true)',
    '(focusout)': 'foco.set(false)',
  },
})
export class PhotoCarousel {
  readonly fotos = input.required<Foto[]>();
  /** Nombre accesible del carrusel. */
  readonly label = input.required<string>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  protected readonly activo = signal(0);
  protected readonly faltantes = signal<ReadonlySet<number>>(new Set());
  protected readonly reproduciendo = signal(true);
  protected readonly hover = signal(false);
  protected readonly foco = signal(false);
  protected readonly movimientoReducido = signal(false);

  protected readonly autoplayActivo = computed(
    () => this.reproduciendo() && !this.hover() && !this.foco() && !this.movimientoReducido(),
  );

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.movimientoReducido.set(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (this.movimientoReducido()) {
        this.reproduciendo.set(false);
      }
      const timer = window.setInterval(() => {
        if (this.autoplayActivo() && document.visibilityState === 'visible') {
          this.ir((this.activo() + 1) % this.fotos().length);
        }
      }, AUTOPLAY_MS);
      destroyRef.onDestroy(() => window.clearInterval(timer));
    });
  }

  protected ir(indice: number): void {
    const track = this.track().nativeElement;
    const slide = track.children[indice] as HTMLElement | undefined;
    if (!slide) {
      return;
    }
    // scrollTo sobre el propio carrusel: nunca desplaza la página verticalmente.
    track.scrollTo({ left: slide.offsetLeft, behavior: this.movimientoReducido() ? 'auto' : 'smooth' });
    this.activo.set(indice);
  }

  protected anterior(): void {
    const total = this.fotos().length;
    this.ir((this.activo() - 1 + total) % total);
  }

  protected siguiente(): void {
    this.ir((this.activo() + 1) % this.fotos().length);
  }

  /** Sincroniza el punto activo cuando el usuario desliza con el dedo. */
  protected onScroll(): void {
    const track = this.track().nativeElement;
    const [primero, segundo] = Array.from(track.children) as HTMLElement[];
    if (!primero) {
      return;
    }
    const ultimo = this.fotos().length - 1;
    // La última foto no puede alinearse a la izquierda: al llegar al tope del scroll, es la activa.
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) {
      this.activo.set(ultimo);
      return;
    }
    const paso = segundo ? segundo.offsetLeft - primero.offsetLeft : primero.offsetWidth;
    const indice = Math.round(track.scrollLeft / Math.max(1, paso));
    this.activo.set(Math.min(ultimo, Math.max(0, indice)));
  }

  protected marcarFaltante(indice: number): void {
    this.faltantes.update((set) => new Set(set).add(indice));
  }
}
