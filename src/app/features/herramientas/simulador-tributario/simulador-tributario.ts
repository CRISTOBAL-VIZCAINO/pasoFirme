import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ACTIVIDADES_RST, TAX_PARAMS } from '../../../data/tax-params';
import { CopPipe } from '../../../shared/pipes/cop.pipe';
import { Icon } from '../../../shared/ui/icon/icon';
import { PageHero } from '../../../shared/ui/page-hero/page-hero';
import { simularTributos } from '../calculos';

@Component({
  selector: 'app-simulador-tributario',
  imports: [ReactiveFormsModule, RouterLink, Icon, PageHero, CopPipe, DecimalPipe],
  templateUrl: './simulador-tributario.html',
  styleUrl: './simulador-tributario.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimuladorTributario {
  protected readonly params = TAX_PARAMS;
  protected readonly actividades = ACTIVIDADES_RST;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    actividad: ACTIVIDADES_RST[0].id,
    ventasMensuales: 4_500_000,
    tarifaRstPct: ACTIVIDADES_RST[0].tarifaRst,
    tarifaIcaPorMil: ACTIVIDADES_RST[0].tarifaIcaPorMil,
    uvt: TAX_PARAMS.uvt as number,
  });

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly r = computed(() => {
    const v = { ...this.form.getRawValue(), ...this.valores() };
    return simularTributos({
      ventasMensuales: v.ventasMensuales ?? 0,
      uvt: v.uvt ?? TAX_PARAMS.uvt,
      tarifaRstPct: v.tarifaRstPct ?? 0,
      tarifaIcaPorMil: v.tarifaIcaPorMil ?? 0,
      topeDeclararRentaUvt: TAX_PARAMS.topeDeclararRentaUvt,
      topeNoResponsableIvaUvt: TAX_PARAMS.topeNoResponsableIvaUvt,
      rstPrimerRangoUvt: TAX_PARAMS.rstPrimerRangoUvt,
      sancionMinimaUvt: TAX_PARAMS.sancionMinimaUvt,
    });
  });

  constructor() {
    // Al cambiar la actividad, se cargan sus tarifas de referencia (el usuario puede editarlas después).
    this.form.controls.actividad.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => {
      const actividad = ACTIVIDADES_RST.find((a) => a.id === id);
      if (actividad) {
        this.form.patchValue({ tarifaRstPct: actividad.tarifaRst, tarifaIcaPorMil: actividad.tarifaIcaPorMil });
      }
    });
  }
}
