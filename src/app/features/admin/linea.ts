import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';

import { fmtDuracion, fmtFechaHora, unir } from './admin-fechas';
import { AdminService, DetalleVisitante, EventoLinea } from './admin.service';

/** Línea de tiempo de lo que hizo un visitante en el sitio (consulta `admin-visitantes?id=`). */
@Component({
  selector: 'app-admin-linea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cargando()) {
      <div class="esqueleto" aria-busy="true"></div>
    } @else if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (detalle(); as d) {
      <dl class="datos">
        <div><dt>Primera visita</dt><dd>{{ fecha(d.visitante['primera_visita']) }}</dd></div>
        <div><dt>Última visita</dt><dd>{{ fecha(d.visitante['ultima_visita']) }}</dd></div>
        <div><dt>Desde dónde</dt><dd>{{ d.visitante['utm_source'] || d.visitante['referrer'] || 'Directo' }}</dd></div>
        <div><dt>Lugar</dt><dd>{{ unir([d.visitante['ciudad'], d.visitante['departamento']], ', ') || '—' }}</dd></div>
        <div><dt>Equipo</dt><dd>{{ d.visitante['dispositivo'] }} · {{ d.visitante['navegador'] }} · {{ d.visitante['sistema'] }}</dd></div>
        @if (d.inscripcion) {
          <div><dt>Inscripción</dt><dd>{{ d.inscripcion.nombre }} · {{ d.inscripcion.estado }}</dd></div>
        }
      </dl>
      <h4>Lo que hizo</h4>
      @if (d.eventos.length) {
        <ol class="linea">
          @for (e of d.eventos; track $index) {
            <li>
              <time>{{ fecha(e.created_at) }}</time>
              <span>{{ texto(e) }}</span>
            </li>
          }
        </ol>
      } @else {
        <p class="vacio">Sin eventos registrados.</p>
      }
    }
  `,
  styles: `
    .datos {
      display: grid;
      gap: var(--space-2);
      margin: 0 0 var(--space-4);

      div {
        display: grid;
        grid-template-columns: 9rem 1fr;
        gap: var(--space-2);
      }

      dt {
        color: var(--ink-500);
        font-size: var(--fs-sm);
      }

      dd {
        margin: 0;
        font-weight: 600;
        overflow-wrap: anywhere;
      }
    }

    h4 {
      margin: 0 0 var(--space-2);
    }

    .linea {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0 0 0 var(--space-4);
      border-left: 3px solid var(--teal-100);
      list-style: none;
    }

    li {
      display: grid;
      gap: 2px;
    }

    time {
      font-size: var(--fs-xs);
      color: var(--ink-500);
    }

    .esqueleto {
      height: 120px;
      border-radius: var(--radius);
      background: linear-gradient(90deg, var(--sand-100), var(--sand-200), var(--sand-100));
    }

    .error {
      color: var(--coral-700);
    }

    .vacio {
      color: var(--ink-500);
    }
  `,
})
export class AdminLinea {
  protected readonly unir = unir;
  readonly visitorId = input.required<string>();

  private readonly admin = inject(AdminService);
  protected readonly detalle = signal<DetalleVisitante | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.visitorId();
      untracked(() => void this.cargar(id));
    });
  }

  private async cargar(id: string): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.detalle.set(await this.admin.get<DetalleVisitante>('admin-visitantes', { id }));
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }

  protected fecha(iso: string | null | undefined): string {
    return iso ? fmtFechaHora(iso) : '—';
  }

  protected texto(e: EventoLinea): string {
    const d = e.detalle ?? {};
    const modulo = e.modulo || e.ruta || '';
    switch (e.tipo) {
      case 'page_view':
        return `Entró a «${modulo}»`;
      case 'page_leave':
        return `Salió de «${modulo}» tras ${fmtDuracion((e.duracion_ms ?? 0) / 1000)}`;
      case 'cta_click':
        return `Tocó el botón «${String(d['cta'] ?? '')}»`;
      case 'tool_start':
        return `Empezó la herramienta «${String(d['tool'] ?? '')}»`;
      case 'tool_complete':
        return `Terminó la herramienta «${String(d['tool'] ?? '')}»${d['resultado'] ? ` (resultado ${String(d['resultado'])})` : ''}`;
      case 'form_start':
        return 'Empezó el formulario de inscripción';
      case 'form_submit_ok':
        return 'Envió el formulario de inscripción';
      case 'form_submit_error':
        return `Intentó enviar el formulario y falló (${String(d['motivo'] ?? 'error')})`;
      case 'whatsapp_click':
        return `Tocó WhatsApp (${String(d['origen'] ?? '')})`;
      case 'faq_open':
        return `Abrió un mito (${String(d['mito'] ?? '')})`;
      case 'audio_play':
        return 'Escuchó el audio';
      default:
        return e.tipo;
    }
  }
}
