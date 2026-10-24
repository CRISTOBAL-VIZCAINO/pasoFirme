import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AUDIENCIAS, COMO_FUNCIONA, FOTOS_TERRITORIO, METAS_PILOTO, METODO_PASO, MITOS, PROBLEMAS } from '../../data/content';
import { Reveal } from '../../shared/directives/reveal';
import { CtaBanner } from '../../shared/ui/cta-banner/cta-banner';
import { Icon } from '../../shared/ui/icon/icon';
import { PhotoCarousel } from '../../shared/ui/photo-carousel/photo-carousel';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, SectionHeading, CtaBanner, Reveal, PhotoCarousel],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly problemas = PROBLEMAS;
  protected readonly metodo = METODO_PASO;
  protected readonly pasos = COMO_FUNCIONA;
  protected readonly audiencias = AUDIENCIAS;
  protected readonly metas = METAS_PILOTO;
  protected readonly mitos = MITOS.slice(0, 3);
  protected readonly fotos = FOTOS_TERRITORIO;

  protected readonly pilarActivo = signal(0);

  protected readonly herramientas = [
    {
      icon: 'wallet',
      titulo: '¿Cuánto gana de verdad tu negocio?',
      texto: 'Descubre si la «caja única» se está comiendo tu capital.',
      ruta: '/herramientas/caja-diaria',
    },
    {
      icon: 'scale',
      titulo: 'Gota a gota vs. microcrédito',
      texto: 'Mira cuánta plata se te va en intereses y cuánto podrías ahorrar.',
      ruta: '/herramientas/gota-a-gota',
    },
    {
      icon: 'calculator',
      titulo: 'Simulador tributario',
      texto: 'Entiende el Régimen Simple y el ICA sin registrarte en nada.',
      ruta: '/herramientas/simulador-tributario',
    },
  ] as const;

  /** Navegación con flechas entre las pestañas del método P.A.S.O. (patrón ARIA tabs). */
  protected onTabKey(event: KeyboardEvent): void {
    const total = this.metodo.length;
    const deltas: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (event.key in deltas) {
      next = (this.pilarActivo() + deltas[event.key] + total) % total;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = total - 1;
    }
    if (next !== null) {
      event.preventDefault();
      this.pilarActivo.set(next);
      document.getElementById(`tab-paso-${next}`)?.focus();
    }
  }
}
