import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TrackingService } from '../../core/tracking.service';
import { PfTrackDirective } from '../../core/pf-track.directive';
import { COMPARACION, FOTOS_TERRITORIO, LINEA_TIEMPO, MITOS } from '../../data/content';
import { AUDIO_PRESENTACION } from '../../data/site.config';
import { CountUp } from '../../shared/directives/count-up';
import { Reveal } from '../../shared/directives/reveal';
import { CopPipe } from '../../shared/pipes/cop.pipe';
import { ContadorInscritos } from '../../shared/ui/contador-inscritos/contador-inscritos';
import { CtaBanner } from '../../shared/ui/cta-banner/cta-banner';
import { Icon } from '../../shared/ui/icon/icon';
import { PhotoCarousel } from '../../shared/ui/photo-carousel/photo-carousel';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';
import { VoiceNote } from '../../shared/ui/voice-note/voice-note';
import { CajaRapida } from './caja-rapida';

const aNumero = (v: string): number => Number(v.replace(/\D/g, '')) || 0;
const miles = new Intl.NumberFormat('es-CO');

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, SectionHeading, CtaBanner, Reveal, PhotoCarousel, CajaRapida, CountUp, CopPipe, VoiceNote, PfTrackDirective, ContadorInscritos],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly tiempo = LINEA_TIEMPO;
  protected readonly comparacion = COMPARACION;
  protected readonly fotos = FOTOS_TERRITORIO;
  protected readonly audio = AUDIO_PRESENTACION;

  /** Tres mitos de miedo, con respuesta corta; el resto vive en /aprende. */
  protected readonly mitos = ['Si saco el RUT', 'Si anoto mis ventas', 'Las fundaciones']
    .map((inicio) => MITOS.find((m) => m.mito.startsWith(inicio)))
    .filter((m): m is (typeof MITOS)[number] => !!m);

  // Mini-interacción del hero: «Vendí» − «Gasté» = «Te quedaron».
  protected readonly vendi = signal('');
  protected readonly gaste = signal('');
  protected readonly quedo = computed(() => {
    const ventas = aNumero(this.vendi());
    return ventas > 0 || aNumero(this.gaste()) > 0 ? ventas - aNumero(this.gaste()) : null;
  });

  private readonly tracking = inject(TrackingService);

  /** Al abrir un mito se mide cuál duda es la más consultada (solo una etiqueta, sin texto libre). */
  protected alAbrirMito(e: Event, indice: number): void {
    if ((e.target as HTMLDetailsElement).open) {
      this.tracking.registrar('faq_open', { mito: ['rut_sisben', 'anotar_dian', 'fundaciones'][indice] ?? `mito_${indice}` });
    }
  }

  protected valor(e: Event): string {
    const limpio = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    return limpio ? miles.format(Number(limpio)) : '';
  }
}
