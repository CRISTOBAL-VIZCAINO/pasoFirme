import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { METODO_PASO } from '../../data/content';
import { Reveal } from '../../shared/directives/reveal';
import { CtaBanner } from '../../shared/ui/cta-banner/cta-banner';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';

interface Hito {
  cuando: string;
  titulo: string;
  texto: string;
}

interface FilaColaboracion {
  tarea: string;
  quien: 'Persona' | 'IA + persona' | 'IA supervisada';
  detalle: string;
}

@Component({
  selector: 'app-programa',
  imports: [RouterLink, Icon, PageHero, SectionHeading, CtaBanner, Reveal],
  templateUrl: './programa.html',
  styleUrl: './programa.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Programa {
  protected readonly metodo = METODO_PASO;

  protected readonly ruta: Hito[] = [
    { cuando: 'Día 1', titulo: 'Visita y diagnóstico en tu puesto', texto: 'Una conversación de unos 20 minutos para conocer tu negocio, tus ventas y tus preocupaciones.' },
    { cuando: 'Semana 1', titulo: 'Tu Cartilla de Caja Diaria', texto: 'Te entregamos la cartilla de colores y acordamos juntos cómo vas a anotar: en papel, por nota de voz o con fotos.' },
    { cuando: 'Semanas 2 a 12', titulo: 'Registro diario y revisiones quincenales', texto: 'Anotas en cinco minutos al día. Cada quince días el brigadista pasa por tu puesto a revisar y resolver dudas.' },
    { cuando: 'Cada semana', titulo: 'Tu resumen en lenguaje sencillo', texto: 'Recibes por WhatsApp cuánto vendiste, cuánto gastaste y cuánto ganaste de verdad.' },
    { cuando: 'Día 30', titulo: 'Simulación tributaria pedagógica', texto: 'Opcional y anónima: entiendes qué significarían el Régimen Simple y el ICA para ti, sin inscribirte en nada.' },
    { cuando: 'Día 60', titulo: 'Tu perfil financiero alternativo', texto: 'Con tus registros reales construimos un perfil de capacidad de pago, revisado por un consultor sénior.' },
    { cuando: 'Día 90', titulo: 'Crédito justo y plan de crecimiento', texto: 'Si lo autorizas, presentamos tu perfil a microfinancieras aliadas y definimos tus próximas metas.' },
  ];

  protected readonly colaboracion: FilaColaboracion[] = [
    { tarea: 'Conversación de confianza sobre tus miedos con la DIAN y los subsidios', quien: 'Persona', detalle: 'Requiere empatía y escucha. Nunca se delega a un bot.' },
    { tarea: 'Lectura de recibos, facturas y cuadernos de fiado', quien: 'IA supervisada', detalle: 'La IA lee la foto y el brigadista verifica los números dudosos.' },
    { tarea: 'Simulación del Régimen Simple y el ICA', quien: 'IA + persona', detalle: 'La IA calcula escenarios; el brigadista los explica y contrasta con la norma vigente.' },
    { tarea: 'Separar gastos de la casa y del negocio', quien: 'IA + persona', detalle: 'La IA clasifica; el asesor valida con tus hábitos reales (pagos al carretillero, celaduría…).' },
    { tarea: 'Acuerdo de registro diario', quien: 'Persona', detalle: 'Es un pacto de confianza y de cambio de hábito, cara a cara.' },
    { tarea: 'Resumen semanal en lenguaje popular', quien: 'IA + persona', detalle: 'La IA redacta el borrador; el brigadista revisa que sea claro y cercano.' },
    { tarea: 'Perfil de crédito para microfinancieras', quien: 'IA + persona', detalle: 'Ningún perfil sale sin la revisión y firma de un consultor sénior.' },
  ];

  protected readonly requisitos = [
    'Tienes un puesto fijo, semiestacionario o una tienda de barrio.',
    'Vendes en Barranquilla, Soledad, Malambo, Galapa o Puerto Colombia.',
    'Llevas al menos un año con tu negocio.',
    'Quieres dedicarle cinco minutos al día a anotar tus cuentas.',
  ];

  protected readonly noHacemos = [
    'No te cobramos nada.',
    'No fiscalizamos ni reportamos a la DIAN o a la Alcaldía.',
    'No compartimos tus datos sin tu autorización expresa.',
    'No te ponemos a hablar con un robot en lugar de una persona.',
    'No te obligamos a sacar el RUT ni a formalizarte.',
  ];
}
