import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CopPipe } from '../../../shared/pipes/cop.pipe';
import { Icon } from '../../../shared/ui/icon/icon';
import { PageHero } from '../../../shared/ui/page-hero/page-hero';
import { calcularCaja } from '../calculos';

@Component({
  selector: 'app-caja-diaria',
  imports: [ReactiveFormsModule, RouterLink, Icon, PageHero, CopPipe],
  templateUrl: './caja-diaria.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CajaDiaria {
  protected readonly form = inject(FormBuilder).nonNullable.group({
    ventasDiarias: 200_000,
    diasSemana: 6,
    costoMercanciaPct: 55,
    gastosNegocioDiarios: 15_000,
    retiroCasaDiario: 70_000,
    cuotaDeudaDiaria: 0,
  });

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly r = computed(() => {
    const v = { ...this.form.getRawValue(), ...this.valores() };
    return calcularCaja({
      ventasDiarias: v.ventasDiarias ?? 0,
      diasSemana: v.diasSemana ?? 6,
      costoMercanciaPct: v.costoMercanciaPct ?? 0,
      gastosNegocioDiarios: v.gastosNegocioDiarios ?? 0,
      retiroCasaDiario: v.retiroCasaDiario ?? 0,
      cuotaDeudaDiaria: v.cuotaDeudaDiaria ?? 0,
    });
  });

  protected readonly costoPct = computed(() => this.valores().costoMercanciaPct ?? 0);

  protected readonly diasOpciones = [5, 6, 7];
}
