import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CARTILLA_COLORES, FAQ, GLOSARIO, MITOS } from '../../data/content';
import { Reveal } from '../../shared/directives/reveal';
import { CtaBanner } from '../../shared/ui/cta-banner/cta-banner';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';

@Component({
  selector: 'app-aprende',
  imports: [RouterLink, Icon, PageHero, SectionHeading, CtaBanner, Reveal],
  templateUrl: './aprende.html',
  styleUrl: './aprende.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Aprende {
  protected readonly mitos = MITOS;
  protected readonly faq = FAQ;
  protected readonly colores = CARTILLA_COLORES;

  /** Mitos cuya realidad ya se reveló (tarjetas volteadas). */
  protected readonly revelados = signal<ReadonlySet<number>>(new Set());

  protected readonly busqueda = signal('');
  protected readonly glosario = computed(() => {
    const q = normalizar(this.busqueda());
    return q ? GLOSARIO.filter((t) => normalizar(`${t.termino} ${t.definicion}`).includes(q)) : GLOSARIO;
  });

  protected alternar(i: number): void {
    this.revelados.update((set) => {
      const next = new Set(set);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  }
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}
