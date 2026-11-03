import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';

import { Logo } from '../../shared/ui/logo/logo';
import { PresetRango, calcularRango, fmtHora, hoyBogota } from './admin-fechas';
import { AdminService, Dashboard } from './admin.service';
import { TabAudiencia } from './tab-audiencia';
import { TabInscritos } from './tab-inscritos';
import { TabResumen } from './tab-resumen';
import { TabVisitantes } from './tab-visitantes';

type Pestana = 'resumen' | 'audiencia' | 'inscritos' | 'visitantes';

/** Panel administrativo: 4 pestañas, rango de fechas en hora de Bogotá y actualización manual. */
@Component({
  selector: 'app-admin-panel',
  imports: [FormsModule, Logo, TabResumen, TabAudiencia, TabInscritos, TabVisitantes],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './admin.scss',
  template: `
    <div class="adm">
      <header class="adm-barra">
        <div class="adm-marca">
          <app-logo />
          <span class="adm-titulo">Panel</span>
        </div>

        <div class="adm-rango" role="group" aria-label="Rango de fechas">
          @for (p of presets; track p.id) {
            <button type="button" class="chip" [class.chip--on]="preset() === p.id" [attr.aria-pressed]="preset() === p.id" (click)="elegir(p.id)">
              {{ p.texto }}
            </button>
          }
        </div>

        <div class="adm-acciones">
          <button type="button" class="btn btn--outline btn--sm" (click)="cargarDashboard()" [disabled]="cargando()">
            {{ cargando() ? 'Actualizando…' : 'Actualizar' }}
          </button>
          <button type="button" class="btn btn--outline btn--sm" (click)="salir()">Cerrar sesión</button>
        </div>
      </header>

      @if (preset() === 'personalizado') {
        <form class="adm-fechas" (ngSubmit)="aplicarPersonalizado()">
          <label>Desde <input type="date" name="desde" [(ngModel)]="desdeDia" [max]="hoy" /></label>
          <label>Hasta <input type="date" name="hasta" [(ngModel)]="hastaDia" [max]="hoy" /></label>
          <button type="submit" class="btn btn--primary btn--sm">Aplicar</button>
        </form>
      }

      <p class="adm-meta">
        Horas en Bogotá.
        @if (actualizado(); as a) {
          Última actualización: {{ a }}.
        }
      </p>

      <nav class="adm-tabs" role="tablist" aria-label="Secciones del panel" (keydown)="teclas($event)">
        @for (t of pestanas; track t.id) {
          <button
            type="button"
            role="tab"
            [id]="'tab-' + t.id"
            [attr.aria-selected]="pestana() === t.id"
            [attr.aria-controls]="'panel-' + t.id"
            [attr.tabindex]="pestana() === t.id ? 0 : -1"
            (click)="pestana.set(t.id)"
          >
            {{ t.texto }}
          </button>
        }
      </nav>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }

      <main class="adm-contenido" [id]="'panel-' + pestana()" role="tabpanel" [attr.aria-labelledby]="'tab-' + pestana()" tabindex="0">
        @switch (pestana()) {
          @case ('resumen') {
            <app-tab-resumen [d]="dashboard()" />
          }
          @case ('audiencia') {
            <app-tab-audiencia [d]="dashboard()" />
          }
          @case ('inscritos') {
            <app-tab-inscritos />
          }
          @case ('visitantes') {
            <app-tab-visitantes [desdeIso]="rango().desde" />
          }
        }
      </main>
    </div>
  `,
})
export class AdminPanel implements OnInit, OnDestroy {
  private readonly admin = inject(AdminService);
  private readonly meta = inject(Meta);

  protected readonly hoy = hoyBogota();
  protected readonly presets: { id: PresetRango; texto: string }[] = [
    { id: 'hoy', texto: 'Hoy' },
    { id: '7', texto: '7 días' },
    { id: '30', texto: '30 días' },
    { id: 'todo', texto: 'Todo' },
    { id: 'personalizado', texto: 'Personalizado' },
  ];
  protected readonly pestanas: { id: Pestana; texto: string }[] = [
    { id: 'resumen', texto: 'Resumen' },
    { id: 'audiencia', texto: 'Audiencia' },
    { id: 'inscritos', texto: 'Inscritos' },
    { id: 'visitantes', texto: 'Visitantes' },
  ];

  protected readonly pestana = signal<Pestana>('resumen');
  protected readonly preset = signal<PresetRango>('30');
  protected desdeDia = '';
  protected hastaDia = '';
  private readonly personalizado = signal<{ desde: string; hasta: string } | null>(null);

  protected readonly rango = computed(() => {
    const p = this.preset();
    const pers = this.personalizado();
    return p === 'personalizado' && pers ? pers : calcularRango(p === 'personalizado' ? '30' : p);
  });

  protected readonly dashboard = signal<Dashboard | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly actualizado = signal<string | null>(null);

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
    void this.cargarDashboard();
  }

  ngOnDestroy(): void {
    this.meta.removeTag("name='robots'");
  }

  protected elegir(p: PresetRango): void {
    this.preset.set(p);
    if (p !== 'personalizado') {
      void this.cargarDashboard();
    }
  }

  protected aplicarPersonalizado(): void {
    this.personalizado.set(calcularRango('personalizado', this.desdeDia, this.hastaDia));
    void this.cargarDashboard();
  }

  protected async cargarDashboard(): Promise<void> {
    const { desde, hasta } = this.rango();
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.dashboard.set(await this.admin.get<Dashboard>('admin-dashboard', { desde, hasta }));
      this.actualizado.set(fmtHora(new Date()));
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }

  protected salir(): void {
    this.admin.logout();
  }

  /** Flechas izquierda/derecha entre pestañas (patrón ARIA tabs). */
  protected teclas(e: KeyboardEvent): void {
    const ids = this.pestanas.map((t) => t.id);
    const i = ids.indexOf(this.pestana());
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (delta) {
      e.preventDefault();
      const sig = ids[(i + delta + ids.length) % ids.length];
      this.pestana.set(sig);
      queueMicrotask(() => document.getElementById(`tab-${sig}`)?.focus());
    }
  }
}
