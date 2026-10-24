import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconName } from '../../../shared/ui/icon/icons';
import { Reveal } from '../../../shared/directives/reveal';
import { CtaBanner } from '../../../shared/ui/cta-banner/cta-banner';
import { Icon } from '../../../shared/ui/icon/icon';
import { PageHero } from '../../../shared/ui/page-hero/page-hero';

interface Herramienta {
  icon: IconName;
  tone: string;
  titulo: string;
  texto: string;
  ruta: string;
  tiempo: string;
}

@Component({
  selector: 'app-herramientas-hub',
  imports: [RouterLink, Icon, PageHero, CtaBanner, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      eyebrow="Herramientas gratuitas"
      title="Haz cuentas claras, sin registrarte"
      lead="Calculadoras pedagógicas pensadas para el comercio popular. Todo se calcula en tu celular: no guardamos ni enviamos lo que escribes."
      [breadcrumbs]="[{ label: 'Herramientas' }]"
    />

    <section class="section">
      <div class="container">
        <div class="grid grid--2">
          @for (h of herramientas; track h.ruta; let i = $index) {
            <a class="card card--lift card--link tool" [routerLink]="h.ruta" appReveal [revealDelay]="i * 80">
              <span class="icon-badge icon-badge--{{ h.tone }}"><app-icon [name]="h.icon" [size]="28" /></span>
              <span class="badge badge--navy"><app-icon name="clock" [size]="14" /> {{ h.tiempo }}</span>
              <h2>{{ h.titulo }}</h2>
              <p>{{ h.texto }}</p>
              <span class="link-arrow">Empezar <app-icon name="arrow-right" [size]="18" /></span>
            </a>
          }
        </div>

        <div class="note tool-disclaimer">
          <app-icon name="lock" [size]="20" />
          <p>
            <strong>Tu información se queda contigo.</strong> Estas herramientas funcionan solo en tu navegador y tienen fines educativos.
            Para un acompañamiento personalizado, un brigadista de Paso Firme puede revisar tus números contigo en tu puesto.
          </p>
        </div>
      </div>
    </section>

    <app-cta-banner />
  `,
  styles: `
    .tool {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      h2 {
        font-size: var(--fs-xl);
        margin-top: var(--space-3);
      }

      .link-arrow {
        margin-top: auto;
      }
    }
  `,
})
export class HerramientasHub {
  protected readonly herramientas: Herramienta[] = [
    {
      icon: 'wallet',
      tone: 'sun',
      titulo: '¿Cuánto gana de verdad tu negocio?',
      texto: 'Calcula tu ganancia real, descubre si la «caja única» te está descapitalizando y cuánto puedes pagarte como sueldo.',
      ruta: '/herramientas/caja-diaria',
      tiempo: '2 minutos',
    },
    {
      icon: 'scale',
      tone: 'coral',
      titulo: 'Gota a gota vs. microcrédito',
      texto: 'Compara cuánto pagas en intereses con un prestamista informal frente a un microcrédito formal.',
      ruta: '/herramientas/gota-a-gota',
      tiempo: '1 minuto',
    },
    {
      icon: 'calculator',
      tone: 'navy',
      titulo: 'Simulador tributario pedagógico',
      texto: 'Entiende de forma anónima qué significaría el Régimen Simple o el ICA para tu negocio, y desmonta los mitos.',
      ruta: '/herramientas/simulador-tributario',
      tiempo: '2 minutos',
    },
    {
      icon: 'target',
      tone: 'sky',
      titulo: 'Autodiagnóstico de tu negocio',
      texto: 'Responde 8 preguntas y conoce en qué punto está la salud financiera de tu negocio, con recomendaciones.',
      ruta: '/herramientas/autodiagnostico',
      tiempo: '3 minutos',
    },
  ];
}
