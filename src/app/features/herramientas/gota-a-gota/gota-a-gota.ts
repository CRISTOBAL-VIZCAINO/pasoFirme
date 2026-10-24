import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CopPipe } from '../../../shared/pipes/cop.pipe';
import { Icon } from '../../../shared/ui/icon/icon';
import { PageHero } from '../../../shared/ui/page-hero/page-hero';
import { compararCredito } from '../calculos';

@Component({
  selector: 'app-gota-a-gota',
  imports: [ReactiveFormsModule, RouterLink, Icon, PageHero, CopPipe, DecimalPipe],
  templateUrl: './gota-a-gota.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GotaAGota {
  protected readonly form = inject(FormBuilder).nonNullable.group({
    monto: 500_000,
    plazoMeses: 6,
    tasaInformalMensual: 20,
    tasaFormalMensual: 2.2,
    diasCobroMes: 26,
  });

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly r = computed(() => {
    const v = { ...this.form.getRawValue(), ...this.valores() };
    return compararCredito({
      monto: v.monto ?? 0,
      plazoMeses: v.plazoMeses ?? 1,
      tasaInformalMensual: v.tasaInformalMensual ?? 0,
      tasaFormalMensual: v.tasaFormalMensual ?? 0,
      diasCobroMes: v.diasCobroMes ?? 26,
    });
  });

  protected readonly plazo = computed(() => this.valores().plazoMeses ?? 1);

  /** Ancho relativo de las barras de intereses (la mayor ocupa el 100%). */
  protected readonly anchos = computed(() => {
    const { interesesInformal, interesesFormal } = this.r();
    const max = Math.max(interesesInformal, interesesFormal, 1);
    return {
      informal: (interesesInformal / max) * 100,
      formal: (interesesFormal / max) * 100,
    };
  });
}
