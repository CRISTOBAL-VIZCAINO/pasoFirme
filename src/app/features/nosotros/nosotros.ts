import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { EQUIPO, FOTOS_EQUIPO } from '../../data/content';
import { SITE } from '../../data/site.config';
import { Reveal } from '../../shared/directives/reveal';
import { CtaBanner } from '../../shared/ui/cta-banner/cta-banner';
import { Icon } from '../../shared/ui/icon/icon';
import { PhotoCarousel } from '../../shared/ui/photo-carousel/photo-carousel';
import { IconName } from '../../shared/ui/icon/icons';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';

interface Item {
  icon: IconName;
  titulo: string;
  texto: string;
}

@Component({
  selector: 'app-nosotros',
  imports: [Icon, PageHero, SectionHeading, CtaBanner, Reveal, PhotoCarousel],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nosotros {
  protected readonly site = SITE;
  protected readonly fotosEquipo = FOTOS_EQUIPO;
  /** Integrantes cuya foto aún no existe: se muestran sus iniciales. */
  protected readonly sinFoto = signal<ReadonlySet<string>>(new Set());
  protected readonly equipo = EQUIPO.map((p) => ({
    ...p,
    iniciales: p.nombre
      .split(' ')
      .filter((parte) => parte.length > 2)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join(''),
  }));

  protected readonly valores: Item[] = [
    { icon: 'heart', titulo: 'Dignidad', texto: 'Hablamos de dignidad financiera, no de impuestos. El comerciante es protagonista, no un expediente.' },
    { icon: 'users', titulo: 'Cercanía', texto: 'La confianza se construye cara a cara, en el puesto y en el lenguaje de la calle.' },
    { icon: 'shield', titulo: 'Transparencia', texto: 'Sin cobros ocultos, sin fiscalización y con reglas claras sobre el uso de los datos.' },
    { icon: 'sparkles', titulo: 'Innovación responsable', texto: 'Usamos IA para multiplicar el tiempo humano, siempre con supervisión y criterio.' },
  ];

  protected readonly exo: Item[] = [
    { icon: 'graduation', titulo: 'Staff on demand', texto: 'Brigadas de practicantes de la red NAF y universidades locales que se renuevan cada semestre.' },
    { icon: 'zap', titulo: 'Algoritmos', texto: 'Copiloto multimodal en WhatsApp que convierte notas de voz y fotos en registros contables.' },
    { icon: 'chart', titulo: 'Dashboards', texto: 'Tableros en tiempo real con los OKR de separación de caja, expedientes entregados y tiempos de registro.' },
    { icon: 'refresh', titulo: 'Experimentación', texto: 'Sprints semanales en micro-zonas: pienso, pregunto, contrasto y decido antes de escalar.' },
  ];

  protected readonly acuerdos: Item[] = [
    { icon: 'refresh', titulo: 'El error es aprendizaje', texto: 'Las hipótesis que no funcionan en campo se comparten abiertamente, sin culpables.' },
    { icon: 'scale', titulo: 'Disentir de la IA es obligatorio', texto: 'Cuestionar a la IA cuando no entiende la realidad del comercio popular es rigor profesional.' },
    { icon: 'eye', titulo: 'Reporte seguro de errores', texto: 'Detectar una alucinación o un error de lectura se reconoce, nunca se castiga.' },
  ];

  protected marcarSinFoto(nombre: string): void {
    this.sinFoto.update((set) => new Set(set).add(nombre));
  }
}
