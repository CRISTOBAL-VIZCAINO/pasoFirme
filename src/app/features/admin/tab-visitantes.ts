import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';

import { fmtFechaHora, num, unir } from './admin-fechas';
import { AdminService, FilaVisitante } from './admin.service';
import { AdminLinea } from './linea';

const LIMITE = 50;

/** Pestaña 4 · Visitantes: lista paginada y línea de tiempo de cada uno. */
@Component({
  selector: 'app-tab-visitantes',
  imports: [AdminLinea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="nota">
      Un visitante es un navegador (identificador aleatorio). Solo sabemos su nombre si se inscribió.
    </p>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    @if (cargando() && !items().length) {
      <div class="esqueleto" aria-busy="true"></div>
    } @else if (!items().length) {
      <p class="vacio">Aún no hay visitas en este rango.</p>
    } @else {
      <table class="tabla tabla--cards">
        <thead>
          <tr>
            <th scope="col">Última visita</th><th scope="col">Ciudad</th><th scope="col">Dispositivo</th>
            <th scope="col">Navegador</th><th scope="col">Fuente</th><th scope="col">Páginas</th><th scope="col">Inscrito</th>
          </tr>
        </thead>
        <tbody>
          @for (v of items(); track v.visitor_id) {
            <tr>
              <th scope="row" data-label="Última visita">
                <button type="button" class="enlace" (click)="abrir(v)">{{ fecha(v.ultima_visita) }}</button>
              </th>
              <td data-label="Ciudad">{{ unir([v.ciudad, v.departamento], ', ') || '—' }}</td>
              <td data-label="Dispositivo">{{ v.dispositivo || '—' }}</td>
              <td data-label="Navegador">{{ v.navegador || '—' }}</td>
              <td data-label="Fuente">{{ v.fuente || 'Directo' }}</td>
              <td data-label="Páginas">{{ n(v.paginas) }}</td>
              <td data-label="Inscrito">
                @if (v.inscrito) {
                  <span class="insignia">Inscrito: {{ v.nombre_inscrito }}</span>
                } @else {
                  —
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
      <div class="paginas">
        <button type="button" class="btn btn--outline btn--sm" (click)="pagina(-1)" [disabled]="desde() === 0 || cargando()">Anterior</button>
        <button type="button" class="btn btn--outline btn--sm" (click)="pagina(1)" [disabled]="items().length < limite || cargando()">Siguiente</button>
      </div>
    }

    @if (sel(); as v) {
      <div class="velo" (click)="cerrar()" aria-hidden="true"></div>
      <aside class="cajon" role="dialog" aria-modal="true" aria-label="Detalle del visitante" (keydown.escape)="cerrar()">
        <header>
          <h3>{{ v.inscrito ? v.nombre_inscrito : 'Visitante anónimo' }}</h3>
          <button type="button" class="cerrar" (click)="cerrar()" aria-label="Cerrar detalle">×</button>
        </header>
        <app-admin-linea [visitorId]="v.visitor_id" />
      </aside>
    }
  `,
})
export class TabVisitantes {
  protected readonly unir = unir;
  /** Inicio del rango en ISO con offset. */
  readonly desdeIso = input.required<string>();

  private readonly admin = inject(AdminService);
  protected readonly limite = LIMITE;
  protected readonly n = num;
  protected readonly items = signal<FilaVisitante[]>([]);
  protected readonly desde = signal(0);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sel = signal<FilaVisitante | null>(null);

  constructor() {
    effect(() => {
      this.desdeIso();
      untracked(() => {
        this.desde.set(0);
        void this.cargar();
      });
    });
  }

  protected fecha(iso: string): string {
    return fmtFechaHora(iso);
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const r = await this.admin.get<{ items: FilaVisitante[] }>('admin-visitantes', {
        limit: LIMITE,
        offset: this.desde(),
        desde: this.desdeIso(),
      });
      this.items.set(r.items ?? []);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }

  protected pagina(dir: number): void {
    this.desde.update((d) => Math.max(0, d + dir * LIMITE));
    void this.cargar();
  }

  protected abrir(v: FilaVisitante): void {
    this.sel.set(v);
  }

  protected cerrar(): void {
    this.sel.set(null);
  }
}
