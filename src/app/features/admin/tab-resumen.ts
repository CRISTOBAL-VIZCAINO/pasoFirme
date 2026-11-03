import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { fmtDia, fmtDuracion, num } from './admin-fechas';
import { Dashboard } from './admin.service';
import { Barras, ItemBarra } from './barras';

/** Pestaña 1 · Resumen: KPIs, gráfico por día, embudo, módulos, herramientas y CTAs. */
@Component({
  selector: 'app-tab-resumen',
  imports: [Barras],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (d(); as d) {
      <section class="kpis" aria-label="Indicadores">
        @for (k of kpis(); track k.etiqueta) {
          <article class="kpi">
            <span class="kpi-v">{{ k.valor }}</span>
            <span class="kpi-e">{{ k.etiqueta }}</span>
          </article>
        }
        <article class="kpi kpi--conv">
          <span class="kpi-v">{{ conversion() }}</span>
          <span class="kpi-e">Conversión (inscritos ÷ visitantes únicos)</span>
        </article>
      </section>

      <section class="bloque">
        <h3>Visitantes e inscritos por día</h3>
        @if (dias().length) {
          <div class="grafico" role="img" [attr.aria-label]="'Gráfico de ' + dias().length + ' días: visitantes e inscritos'">
            @for (p of dias(); track p.dia; let i = $index) {
              <div class="col" [attr.title]="p.titulo">
                <div class="barras-dia">
                  <span class="b b--vis" [style.height.%]="p.hVis"></span>
                  <span class="b b--ins" [style.height.%]="p.hIns"></span>
                </div>
                <span class="dia">{{ i % paso() === 0 ? p.etiqueta : '' }}</span>
              </div>
            }
          </div>
          <p class="leyenda"><span class="sw sw--vis"></span> Visitantes <span class="sw sw--ins"></span> Inscritos</p>
        } @else {
          <p class="vacio">Aún no hay visitas en este rango.</p>
        }
      </section>

      <div class="dos">
        <section class="bloque">
          <h3>Embudo de inscripción</h3>
          <ol class="embudo">
            @for (p of embudo(); track p.etiqueta) {
              <li>
                <div class="top"><span>{{ p.etiqueta }}</span><b>{{ p.texto }}</b></div>
                <div class="pista"><div class="barra" [style.width.%]="p.ancho"></div></div>
                @if (p.caida !== null) {
                  <small>Se pierde el {{ p.caida }} % respecto al paso anterior</small>
                }
              </li>
            }
          </ol>
        </section>

        <section class="bloque">
          <h3>Módulos más vistos</h3>
          <app-barras [items]="modulos()" vacio="Aún no hay visitas en este rango." />
        </section>
      </div>

      <div class="dos">
        <section class="bloque">
          <h3>Herramientas</h3>
          @if (d.herramientas.length) {
            <table class="tabla">
              <thead>
                <tr><th scope="col">Herramienta</th><th scope="col">Iniciadas</th><th scope="col">Completadas</th></tr>
              </thead>
              <tbody>
                @for (h of d.herramientas; track h.herramienta) {
                  <tr>
                    <th scope="row">{{ h.herramienta }}</th>
                    <td data-label="Iniciadas">{{ n(h.iniciadas) }}</td>
                    <td data-label="Completadas">{{ n(h.completadas) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="vacio">Nadie ha usado las herramientas en este rango.</p>
          }
        </section>

        <section class="bloque">
          <h3>Botones más tocados</h3>
          <app-barras [items]="ctas()" vacio="Aún no hay clics registrados." />
        </section>
      </div>
    } @else {
      <div class="esqueleto" aria-busy="true"></div>
    }
  `,
})
export class TabResumen {
  readonly d = input<Dashboard | null>(null);

  protected readonly n = num;

  protected readonly kpis = computed(() => {
    const k = this.d()?.kpis;
    if (!k) {
      return [];
    }
    return [
      { etiqueta: 'Visitantes únicos', valor: num(k.visitantes_unicos) },
      { etiqueta: 'Sesiones', valor: num(k.sesiones) },
      { etiqueta: 'Páginas vistas', valor: num(k.paginas_vistas) },
      { etiqueta: 'Inscritos (en el rango)', valor: num(k.inscritos) },
      { etiqueta: 'Inscritos totales', valor: num(k.inscritos_total) },
      { etiqueta: 'Formularios iniciados', valor: num(k.formularios_iniciados) },
      { etiqueta: 'Herramientas completadas', valor: num(k.herramientas_completadas) },
      { etiqueta: 'Clics a WhatsApp', valor: num(k.clics_whatsapp) },
    ];
  });

  protected readonly conversion = computed(() => {
    const k = this.d()?.kpis;
    return k && k.visitantes_unicos > 0 ? `${((k.inscritos / k.visitantes_unicos) * 100).toFixed(1).replace('.', ',')} %` : '—';
  });

  /** Máximo 120 días en el gráfico para que las barras sigan siendo legibles. */
  protected readonly dias = computed(() => {
    const filas = (this.d()?.por_dia ?? []).slice(-120);
    const max = Math.max(1, ...filas.map((f) => Math.max(f.visitantes, f.inscritos)));
    return filas
      .filter(() => filas.some((f) => f.visitantes > 0 || f.inscritos > 0))
      .map((f) => ({
        dia: f.dia,
        etiqueta: fmtDia(f.dia),
        titulo: `${fmtDia(f.dia)}: ${f.visitantes} visitantes, ${f.inscritos} inscritos`,
        hVis: (f.visitantes / max) * 100,
        hIns: (f.inscritos / max) * 100,
      }));
  });

  protected readonly paso = computed(() => Math.max(1, Math.ceil(this.dias().length / 8)));

  protected readonly embudo = computed(() => {
    const e = this.d()?.embudo;
    if (!e) {
      return [];
    }
    const pasos = [
      { etiqueta: 'Visitaron el sitio', v: e.visitaron },
      { etiqueta: 'Vieron la inscripción', v: e.vieron_inscripcion },
      { etiqueta: 'Empezaron el formulario', v: e.iniciaron_form },
      { etiqueta: 'Enviaron el formulario', v: e.enviaron_form },
    ];
    const max = Math.max(1, pasos[0].v);
    return pasos.map((p, i) => ({
      etiqueta: p.etiqueta,
      texto: num(p.v),
      ancho: (p.v / max) * 100,
      caida: i > 0 && pasos[i - 1].v > 0 ? Math.round((1 - p.v / pasos[i - 1].v) * 100) : null,
    }));
  });

  protected readonly modulos = computed<ItemBarra[]>(() =>
    (this.d()?.modulos ?? []).map((m) => ({
      etiqueta: m.modulo,
      valor: m.vistas,
      extra: `${num(m.visitantes)} visitantes · ${fmtDuracion(m.seg_prom)} en promedio`,
    })),
  );

  protected readonly ctas = computed<ItemBarra[]>(() => (this.d()?.ctas ?? []).map((c) => ({ etiqueta: c.cta, valor: c.clics })));
}
