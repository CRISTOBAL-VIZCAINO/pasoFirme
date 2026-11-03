import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { fmtFechaHora, num, unir } from './admin-fechas';
import { AdminService, Inscripcion } from './admin.service';
import { AdminLinea } from './linea';

const ESTADOS = ['nuevo', 'contactado', 'visitado', 'descartado'] as const;
const LIMITE = 25;

/** Pestaña 3 · Inscritos: lista, búsqueda, estado editable, notas, CSV, línea de tiempo y supresión. */
@Component({
  selector: 'app-tab-inscritos',
  imports: [AdminLinea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="herramientas-barra">
      <label class="visually-hidden" for="ins-buscar">Buscar por nombre, celular o zona</label>
      <input id="ins-buscar" type="search" placeholder="Buscar por nombre, celular o zona" (input)="buscar($event)" />
      <label class="visually-hidden" for="ins-estado">Filtrar por estado</label>
      <select id="ins-estado" (change)="filtrarEstado($event)">
        <option value="">Todos los estados</option>
        @for (e of estados; track e) {
          <option [value]="e">{{ e }}</option>
        }
      </select>
      <button type="button" class="btn btn--outline btn--sm" (click)="exportar()" [disabled]="exportando()">
        {{ exportando() ? 'Preparando…' : 'Exportar CSV' }}
      </button>
    </div>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }

    @if (cargando() && !items().length) {
      <div class="esqueleto" aria-busy="true"></div>
    } @else if (!items().length) {
      <p class="vacio">Aún no hay inscritos con estos filtros.</p>
    } @else {
      <p class="nota">{{ n(total()) }} inscritos · mostrando {{ n(desde() + 1) }}–{{ n(desde() + items().length) }}</p>
      <table class="tabla tabla--cards">
        <thead>
          <tr>
            <th scope="col">Fecha</th><th scope="col">Nombre</th><th scope="col">Celular</th><th scope="col">Lugar</th>
            <th scope="col">Necesidades</th><th scope="col">Contacto</th><th scope="col">Origen</th><th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (i of items(); track i.id) {
            <tr>
              <td data-label="Fecha">{{ fecha(i.created_at) }}</td>
              <th scope="row" data-label="Nombre">
                <button type="button" class="enlace" (click)="abrir(i)">{{ i.nombre }}</button>
              </th>
              <td data-label="Celular">
                <a [href]="'https://wa.me/57' + i.celular" target="_blank" rel="noopener">{{ i.celular }}</a>
              </td>
              <td data-label="Lugar">{{ unir([i.municipio, i.zona], ' · ') || '—' }}</td>
              <td data-label="Necesidades">{{ i.necesidades?.join(', ') || '—' }}</td>
              <td data-label="Contacto">{{ unir([i.canal_contacto, i.horario], ' · ') || '—' }}</td>
              <td data-label="Origen">{{ i.utm_source || i.referrer || 'Directo' }}</td>
              <td data-label="Estado">
                <label class="visually-hidden" [for]="'est-' + i.id">Estado de {{ i.nombre }}</label>
                <select [id]="'est-' + i.id" [value]="i.estado" (change)="cambiarEstado(i, $event)">
                  @for (e of estados; track e) {
                    <option [value]="e" [selected]="e === i.estado">{{ e }}</option>
                  }
                </select>
              </td>
            </tr>
          }
        </tbody>
      </table>
      <div class="paginas">
        <button type="button" class="btn btn--outline btn--sm" (click)="pagina(-1)" [disabled]="desde() === 0 || cargando()">Anterior</button>
        <button type="button" class="btn btn--outline btn--sm" (click)="pagina(1)" [disabled]="desde() + items().length >= total() || cargando()">Siguiente</button>
      </div>
    }

    @if (sel(); as s) {
      <div class="velo" (click)="cerrar()" aria-hidden="true"></div>
      <aside class="cajon" role="dialog" aria-modal="true" [attr.aria-label]="'Detalle de ' + s.nombre" (keydown.escape)="cerrar()">
        <header>
          <h3>{{ s.nombre }}</h3>
          <button type="button" class="cerrar" (click)="cerrar()" aria-label="Cerrar detalle">×</button>
        </header>
        <dl class="datos">
          <div><dt>Inscrito</dt><dd>{{ fecha(s.created_at) }}</dd></div>
          <div><dt>Celular</dt><dd><a [href]="'https://wa.me/57' + s.celular" target="_blank" rel="noopener">{{ s.celular }}</a></dd></div>
          <div><dt>Municipio</dt><dd>{{ s.municipio || '—' }}</dd></div>
          <div><dt>Zona</dt><dd>{{ s.zona || '—' }}</dd></div>
          <div><dt>Negocio</dt><dd>{{ unir([s.tipo_negocio, s.actividad, s.antiguedad], ' · ') || '—' }}</dd></div>
          <div><dt>Necesidades</dt><dd>{{ s.necesidades?.join(', ') || '—' }}</dd></div>
          <div><dt>Contacto</dt><dd>{{ unir([s.canal_contacto, s.horario], ' · ') || '—' }}</dd></div>
          <div><dt>Campaña</dt><dd>{{ unir([s.utm_source, s.utm_medium, s.utm_campaign], ' / ') || '—' }}</dd></div>
          <div><dt>Referencia</dt><dd>{{ s.referrer || '—' }}</dd></div>
        </dl>

        <label for="notas">Notas del equipo</label>
        <textarea id="notas" rows="4" [value]="notas()" (input)="notas.set($any($event.target).value)"></textarea>
        <button type="button" class="btn btn--primary btn--sm" (click)="guardarNotas()" [disabled]="guardando()">
          {{ guardando() ? 'Guardando…' : 'Guardar notas' }}
        </button>

        @if (s.visitor_id) {
          <h4>Qué hizo en el sitio</h4>
          <app-admin-linea [visitorId]="s.visitor_id" />
        } @else {
          <p class="nota">No tenemos su navegación: se inscribió sin pasar por una visita medida.</p>
        }

        <div class="peligro">
          <h4>Eliminar inscripción</h4>
          <p class="nota">Derecho de supresión: borra todos sus datos de forma definitiva. Para confirmar, escribe su nombre: <b>{{ s.nombre }}</b></p>
          <label class="visually-hidden" for="conf">Escribe el nombre para confirmar</label>
          <input id="conf" type="text" autocomplete="off" [value]="confirmacion()" (input)="confirmacion.set($any($event.target).value)" />
          <button type="button" class="btn btn--danger btn--sm" (click)="eliminar()" [disabled]="confirmacion().trim() !== s.nombre">Eliminar definitivamente</button>
        </div>
      </aside>
    }
  `,
})
export class TabInscritos implements OnInit {
  protected readonly unir = unir;
  private readonly admin = inject(AdminService);

  protected readonly estados = ESTADOS;
  protected readonly n = num;
  protected readonly items = signal<Inscripcion[]>([]);
  protected readonly total = signal(0);
  protected readonly desde = signal(0);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly exportando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly sel = signal<Inscripcion | null>(null);
  protected readonly notas = signal('');
  protected readonly confirmacion = signal('');

  private q = '';
  private estado = '';
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    void this.cargar();
  }

  protected fecha(iso: string): string {
    return fmtFechaHora(iso);
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const r = await this.admin.get<{ total: number; items: Inscripcion[] }>('admin-inscripciones', {
        limit: LIMITE,
        offset: this.desde(),
        q: this.q,
        estado: this.estado,
      });
      this.items.set(r.items ?? []);
      this.total.set(r.total ?? 0);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }

  protected buscar(e: Event): void {
    this.q = (e.target as HTMLInputElement).value;
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.desde.set(0);
      void this.cargar();
    }, 350);
  }

  protected filtrarEstado(e: Event): void {
    this.estado = (e.target as HTMLSelectElement).value;
    this.desde.set(0);
    void this.cargar();
  }

  protected pagina(dir: number): void {
    this.desde.update((d) => Math.max(0, d + dir * LIMITE));
    void this.cargar();
  }

  protected async exportar(): Promise<void> {
    this.exportando.set(true);
    try {
      await this.admin.descargarCsv({ q: this.q, estado: this.estado });
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.exportando.set(false);
    }
  }

  protected async cambiarEstado(i: Inscripcion, e: Event): Promise<void> {
    const estado = (e.target as HTMLSelectElement).value as Inscripcion['estado'];
    try {
      await this.admin.enviar('PATCH', 'admin-inscripciones', undefined, { id: i.id, estado });
      this.items.update((lista) => lista.map((x) => (x.id === i.id ? { ...x, estado } : x)));
      if (this.sel()?.id === i.id) {
        this.sel.update((s) => (s ? { ...s, estado } : s));
      }
    } catch (err) {
      this.error.set((err as Error).message);
      void this.cargar();
    }
  }

  protected abrir(i: Inscripcion): void {
    this.sel.set(i);
    this.notas.set(i.notas ?? '');
    this.confirmacion.set('');
  }

  protected cerrar(): void {
    this.sel.set(null);
  }

  protected async guardarNotas(): Promise<void> {
    const s = this.sel();
    if (!s) {
      return;
    }
    this.guardando.set(true);
    try {
      await this.admin.enviar('PATCH', 'admin-inscripciones', undefined, { id: s.id, notas: this.notas() });
      this.items.update((lista) => lista.map((x) => (x.id === s.id ? { ...x, notas: this.notas() } : x)));
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.guardando.set(false);
    }
  }

  protected async eliminar(): Promise<void> {
    const s = this.sel();
    if (!s || this.confirmacion().trim() !== s.nombre) {
      return;
    }
    try {
      await this.admin.enviar('DELETE', 'admin-inscripciones', { id: s.id });
      this.cerrar();
      await this.cargar();
    } catch (err) {
      this.error.set((err as Error).message);
    }
  }
}
