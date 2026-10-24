import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../../shared/ui/icon/icon';
import { PageHero } from '../../../shared/ui/page-hero/page-hero';
import { Dimension, Nivel, PreguntaDiagnostico, Respuesta, evaluarDiagnostico } from '../calculos';

const PREGUNTAS: PreguntaDiagnostico[] = [
  { id: 'separa', texto: '¿Separas la plata de la casa de la plata del negocio?', dimension: 'caja' },
  { id: 'anota', texto: '¿Anotas lo que vendes y lo que gastas cada día?', dimension: 'caja' },
  { id: 'ganancia', texto: '¿Sabes cuánto gana de verdad tu negocio al mes?', dimension: 'caja' },
  { id: 'gota', texto: '¿Has pedido un préstamo «gota a gota» en el último año?', dimension: 'credito', invertida: true },
  { id: 'cuenta', texto: '¿Tienes cuenta de ahorros o billetera digital (Nequi, Daviplata u otra)?', dimension: 'credito' },
  { id: 'ahorro', texto: '¿Guardas algo cada semana para resurtir o para imprevistos?', dimension: 'credito' },
  { id: 'miedo', texto: '¿Te da miedo sacar el RUT porque crees que perderías tus subsidios?', dimension: 'tributario', invertida: true },
  { id: 'conoce', texto: '¿Sabes qué son el Régimen Simple (RST) y el ICA?', dimension: 'tributario' },
];

const DIMENSIONES: Record<Dimension, { nombre: string; consejo: Record<Nivel, string> }> = {
  caja: {
    nombre: 'Orden de caja',
    consejo: {
      firme: 'Tienes buenos hábitos. El siguiente paso es usar tus registros para negociar mejores precios y crédito.',
      'en-camino': 'Vas bien. Empieza a pagarte un sueldo fijo diario y anota tus ventas con la cartilla de colores.',
      'en-riesgo': 'La «caja única» puede estar comiéndose tu capital. Un brigadista puede ayudarte a separar la plata en una sola visita.',
    },
  },
  credito: {
    nombre: 'Salud financiera y crédito',
    consejo: {
      firme: 'Estás preparado para acceder a microcrédito formal. Tus registros pueden convertirse en tu perfil de crédito.',
      'en-camino': 'Un pequeño ahorro semanal y una billetera digital te acercan al crédito formal.',
      'en-riesgo': 'Estás expuesto a la usura. Construyamos juntos un perfil para acceder a un microcrédito justo.',
    },
  },
  tributario: {
    nombre: 'Tranquilidad tributaria',
    consejo: {
      firme: 'Conoces tus opciones. Una simulación personalizada te ayudará a decidir cuándo y cómo formalizarte.',
      'en-camino': 'Prueba el simulador tributario: entender los números quita el miedo.',
      'en-riesgo': 'El miedo a perder subsidios es muy común, pero suele ser un mito. Te lo explicamos sin compromiso.',
    },
  },
};

@Component({
  selector: 'app-autodiagnostico',
  imports: [RouterLink, Icon, PageHero],
  templateUrl: './autodiagnostico.html',
  styleUrl: './autodiagnostico.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Autodiagnostico {
  protected readonly preguntas = PREGUNTAS;
  protected readonly dimensiones = DIMENSIONES;
  protected readonly opciones: { valor: Respuesta; texto: string }[] = [
    { valor: 'si', texto: 'Sí' },
    { valor: 'aveces', texto: 'A veces / más o menos' },
    { valor: 'no', texto: 'No' },
  ];
  protected readonly niveles: Record<Nivel, { titulo: string; texto: string }> = {
    firme: { titulo: 'Tu negocio va con paso firme', texto: 'Tienes bases sólidas. Te podemos ayudar a convertirlas en crédito y crecimiento.' },
    'en-camino': { titulo: 'Vas por buen camino', texto: 'Tienes algunos hábitos valiosos y otros por fortalecer. Con acompañamiento puedes dar el salto.' },
    'en-riesgo': { titulo: 'Tu negocio necesita apoyo', texto: 'No estás solo: es la situación de la mayoría de los micronegocios. Hay soluciones sencillas.' },
  };

  private readonly injector = inject(Injector);

  protected readonly indice = signal(0);
  protected readonly respuestas = signal<Record<string, Respuesta | undefined>>({});
  protected readonly terminado = signal(false);

  protected readonly actual = computed(() => this.preguntas[this.indice()]);
  protected readonly progreso = computed(() => ((this.indice() + (this.terminado() ? 1 : 0)) / this.preguntas.length) * 100);
  protected readonly resultado = computed(() => evaluarDiagnostico(this.preguntas, this.respuestas()));

  protected responder(valor: Respuesta): void {
    this.respuestas.update((r) => ({ ...r, [this.actual().id]: valor }));
  }

  protected siguiente(): void {
    if (this.indice() < this.preguntas.length - 1) {
      this.indice.update((i) => i + 1);
    } else {
      this.terminado.set(true);
    }
    this.enfocarTarjeta();
  }

  protected anterior(): void {
    this.indice.update((i) => Math.max(0, i - 1));
    this.enfocarTarjeta();
  }

  protected reiniciar(): void {
    this.respuestas.set({});
    this.indice.set(0);
    this.terminado.set(false);
    this.enfocarTarjeta();
  }

  /** Lleva el foco al nuevo contenido para lectores de pantalla y teclado. */
  private enfocarTarjeta(): void {
    afterNextRender(() => document.getElementById('diagnostico-foco')?.focus(), { injector: this.injector });
  }
}
