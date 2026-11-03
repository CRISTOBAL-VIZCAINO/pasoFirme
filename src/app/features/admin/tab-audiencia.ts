import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Dashboard } from './admin.service';
import { Barras, ItemBarra } from './barras';

/** Pestaña 2 · Audiencia: de dónde llegan, con qué equipo y desde qué ciudad. */
@Component({
  selector: 'app-tab-audiencia',
  imports: [Barras],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (d()) {
      <div class="dos">
        <section class="bloque">
          <h3>Fuentes</h3>
          <p class="nota">De qué QR o enlace llegan (utm_source), el sitio que los envió, o «directo».</p>
          <app-barras [items]="fuentes()" />
        </section>
        <section class="bloque">
          <h3>Dispositivos</h3>
          <app-barras [items]="dispositivos()" />
        </section>
      </div>
      <section class="bloque">
        <h3>Ciudades y departamentos</h3>
        <app-barras [items]="ubicaciones()" vacio="Aún no hay ubicaciones registradas." />
      </section>
    } @else {
      <div class="esqueleto" aria-busy="true"></div>
    }
  `,
})
export class TabAudiencia {
  readonly d = input<Dashboard | null>(null);

  protected readonly fuentes = computed<ItemBarra[]>(() =>
    (this.d()?.fuentes ?? []).map((f) => ({ etiqueta: f.fuente || 'Directo', valor: f.visitantes })),
  );
  protected readonly dispositivos = computed<ItemBarra[]>(() =>
    (this.d()?.dispositivos ?? []).map((f) => ({ etiqueta: f.dispositivo || 'Sin dato', valor: f.visitantes })),
  );
  protected readonly ubicaciones = computed<ItemBarra[]>(() =>
    (this.d()?.ubicaciones ?? []).map((u) => ({
      etiqueta: [u.ciudad, u.departamento].filter(Boolean).join(', ') || 'Sin ubicación',
      valor: u.visitantes,
    })),
  );
}
