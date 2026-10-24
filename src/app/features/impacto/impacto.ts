import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FUENTES, METAS_PILOTO } from '../../data/content';
import { Reveal } from '../../shared/directives/reveal';
import { CtaBanner } from '../../shared/ui/cta-banner/cta-banner';
import { Icon } from '../../shared/ui/icon/icon';
import { IconName } from '../../shared/ui/icon/icons';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';

interface Proxy {
  icon: IconName;
  titulo: string;
  texto: string;
}

interface Fase {
  fase: string;
  titulo: string;
  texto: string;
  estado: 'hecho' | 'siguiente' | 'futuro';
}

@Component({
  selector: 'app-impacto',
  imports: [RouterLink, Icon, PageHero, SectionHeading, CtaBanner, Reveal],
  templateUrl: './impacto.html',
  styleUrl: './impacto.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Impacto {
  protected readonly metas = [
    ...METAS_PILOTO,
    { valor: '< 24 h', texto: 'para emitir una pre-aprobación crediticia' },
    { valor: '60%', texto: 'mantiene el reporte por WhatsApp durante 8 semanas seguidas' },
    { valor: '2', texto: 'entidades financieras que acepten el score alternativo' },
    { valor: '4×', texto: 'capacidad de atención del brigadista con el copiloto de IA' },
  ];

  protected readonly proxies: Proxy[] = [
    {
      icon: 'shield',
      titulo: 'Sanciones tributarias evitadas',
      texto: 'Valor de las sanciones mínimas por extemporaneidad o no declaración del ICA que se evitan con el acompañamiento preventivo.',
    },
    {
      icon: 'coins',
      titulo: 'Sustitución de la usura',
      texto: 'Diferencia entre pagar el 20% mensual del gota a gota y una tasa formal de microcrédito de entre el 1,5% y el 2,5% mensual.',
    },
    {
      icon: 'book',
      titulo: 'Consultoría equivalente',
      texto: 'Costo de mercado de los servicios contables y tributarios que la comunidad recibe sin costo.',
    },
    {
      icon: 'landmark',
      titulo: 'Recaudo público incremental',
      texto: 'Ingresos tributarios de largo plazo derivados de la formalización progresiva y voluntaria.',
    },
  ];

  protected readonly fases: Fase[] = [
    {
      fase: 'Fase 0',
      titulo: 'Investigación y diseño',
      texto: 'Diagnóstico territorial, estudio de prefactibilidad, modelo de negocio y rediseño organizacional con IA.',
      estado: 'hecho',
    },
    {
      fase: 'Fase 1',
      titulo: 'Piloto controlado de 90 días',
      texto: 'Hasta 50 micronegocios en el Paseo Bolívar o el Gran Bazar. Validación de hipótesis críticas.',
      estado: 'siguiente',
    },
    {
      fase: 'Fase 2',
      titulo: 'Escalamiento metropolitano',
      texto: 'Soledad, Malambo, Galapa y Puerto Colombia, con más universidades y núcleos NAF.',
      estado: 'futuro',
    },
    {
      fase: 'Fase 3',
      titulo: 'Atlántico y Risk-as-a-Service',
      texto: 'Cobertura departamental y API de evaluación de riesgo para entidades financieras.',
      estado: 'futuro',
    },
  ];

  protected readonly fuentes = FUENTES;

  /** Serie de demostración para el tablero ilustrativo (no son datos reales). */
  protected readonly demoAdopcion = [22, 31, 38, 44, 49, 53, 57, 61];
}
