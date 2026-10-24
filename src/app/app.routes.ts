import { Routes } from '@angular/router';

import { Home } from './features/home/home';

/**
 * Cada ruta define `title` y `data.description`; PageTitleStrategy los aplica
 * a la pestaña del navegador y a la meta descripción.
 */
export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Inicio',
    data: {
      description:
        'Acompañamiento contable en tu puesto, simulación tributaria pedagógica y crédito justo para micronegocios de Barranquilla y el Atlántico.',
    },
  },
  {
    path: 'programa',
    loadComponent: () => import('./features/programa/programa').then((m) => m.Programa),
    title: 'El programa',
    data: {
      description: 'Conoce el método P.A.S.O., la ruta de acompañamiento de 90 días y quién puede participar en Paso Firme.',
    },
  },
  {
    path: 'herramientas',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/herramientas/hub/hub').then((m) => m.HerramientasHub),
        title: 'Herramientas gratuitas',
        data: { description: 'Calculadoras pedagógicas para ordenar la caja de tu negocio, comparar créditos y entender tus impuestos.' },
      },
      {
        path: 'caja-diaria',
        loadComponent: () => import('./features/herramientas/caja-diaria/caja-diaria').then((m) => m.CajaDiaria),
        title: '¿Cuánto gana de verdad tu negocio?',
        data: { description: 'Calcula la ganancia real de tu negocio y descubre si la «caja única» lo está descapitalizando.' },
      },
      {
        path: 'gota-a-gota',
        loadComponent: () => import('./features/herramientas/gota-a-gota/gota-a-gota').then((m) => m.GotaAGota),
        title: 'Gota a gota vs. microcrédito',
        data: { description: 'Compara cuánto pagas en intereses con un préstamo gota a gota frente a un microcrédito formal.' },
      },
      {
        path: 'simulador-tributario',
        loadComponent: () =>
          import('./features/herramientas/simulador-tributario/simulador-tributario').then((m) => m.SimuladorTributario),
        title: 'Simulador tributario pedagógico',
        data: { description: 'Simulación anónima y pedagógica del Régimen Simple (RST) y el ICA para micronegocios.' },
      },
      {
        path: 'autodiagnostico',
        loadComponent: () => import('./features/herramientas/autodiagnostico/autodiagnostico').then((m) => m.Autodiagnostico),
        title: 'Autodiagnóstico de tu negocio',
        data: { description: 'Responde 8 preguntas y descubre en qué punto está la salud financiera de tu negocio.' },
      },
    ],
  },
  {
    path: 'entidades',
    loadComponent: () => import('./features/entidades/entidades').then((m) => m.Entidades),
    title: 'Para entidades aliadas',
    data: {
      description: 'Microfinancieras, sector público, gremios y universidades: originación de crédito con datos reales e inclusión con impacto medible.',
    },
  },
  {
    path: 'impacto',
    loadComponent: () => import('./features/impacto/impacto').then((m) => m.Impacto),
    title: 'Impacto y SROI',
    data: { description: 'Metas del piloto, metodología SROI y evidencia empírica que respalda a Paso Firme.' },
  },
  {
    path: 'aprende',
    loadComponent: () => import('./features/aprende/aprende').then((m) => m.Aprende),
    title: 'Aprende',
    data: { description: 'Mitos y realidades sobre el RUT y los subsidios, la Cartilla de Caja Diaria, glosario y preguntas frecuentes.' },
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./features/nosotros/nosotros').then((m) => m.Nosotros),
    title: 'Nosotros',
    data: { description: 'Propósito, origen académico, equipo y forma de trabajo de Paso Firme.' },
  },
  {
    path: 'inscripcion',
    loadComponent: () => import('./features/inscripcion/inscripcion').then((m) => m.Inscripcion),
    title: 'Inscribe tu negocio',
    data: { description: 'Inscribe tu negocio en Paso Firme y recibe acompañamiento gratuito en tu propio puesto.' },
  },
  {
    path: 'privacidad',
    loadComponent: () => import('./features/privacidad/privacidad').then((m) => m.Privacidad),
    title: 'Tratamiento de datos personales',
    data: { description: 'Política de tratamiento de datos personales de Paso Firme (Ley 1581 de 2012).' },
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    title: 'Página no encontrada',
  },
];
