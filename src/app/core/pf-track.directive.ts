import { Directive, HostListener, inject, input } from '@angular/core';

import { TrackingService } from './tracking.service';

/** Mide clics de botones y enlaces sin ensuciar los componentes: `<a pfTrack="inscribete_hero">`. */
@Directive({ selector: '[pfTrack]' })
export class PfTrackDirective {
  readonly pfTrack = input.required<string>();
  private readonly tracking = inject(TrackingService);

  @HostListener('click')
  protected alClic(): void {
    this.tracking.registrar('cta_click', { cta: this.pfTrack() });
  }
}
