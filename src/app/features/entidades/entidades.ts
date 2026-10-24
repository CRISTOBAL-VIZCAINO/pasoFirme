import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Solicitud, Solicitudes } from '../../core/services/solicitudes';
import { ECOSISTEMA } from '../../data/content';
import { Reveal } from '../../shared/directives/reveal';
import { CopPipe } from '../../shared/pipes/cop.pipe';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHero } from '../../shared/ui/page-hero/page-hero';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';

@Component({
  selector: 'app-entidades',
  imports: [ReactiveFormsModule, RouterLink, Icon, PageHero, SectionHeading, Reveal, CopPipe],
  templateUrl: './entidades.html',
  styleUrl: './entidades.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Entidades {
  private readonly solicitudes = inject(Solicitudes);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly ecosistema = ECOSISTEMA;

  protected readonly tiposEntidad = [
    'Microfinanciera',
    'Cooperativa de crédito',
    'Fintech',
    'Banco',
    'Alcaldía o Gobernación',
    'Cámara de Comercio o gremio',
    'Universidad o NAF',
    'Cooperación internacional / fundación',
    'Otra',
  ];

  protected readonly form = inject(FormBuilder).nonNullable.group({
    organizacion: ['', [Validators.required, Validators.minLength(2)]],
    tipo: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    cargo: [''],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.pattern(/^[0-9+\s-]{7,15}$/)],
    mensaje: ['', [Validators.required, Validators.minLength(10)]],
    autorizacion: [false, Validators.requiredTrue],
  });

  protected readonly enviando = signal(false);
  protected readonly enviada = signal<Solicitud | null>(null);
  private readonly intentoEnviar = signal(false);

  /** Expediente ficticio para ilustrar el entregable a microfinancieras. */
  protected readonly expediente = {
    negocio: 'Venta de jugos y frutas',
    zona: 'Paseo Bolívar, Barranquilla',
    antiguedad: '6 años',
    diasRegistro: 84,
    ventaPromedio: 210_000,
    margen: 38,
    cuotaSugerida: 18_000,
    riesgo: 'Medio-bajo',
  };

  /** Últimos 30 días del expediente de ejemplo (dos días sin registro). */
  protected readonly registroDias = Array.from({ length: 30 }, (_, i) => i);

  protected invalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && (c.touched || this.intentoEnviar());
  }

  protected async enviar(): Promise<void> {
    this.intentoEnviar.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement.querySelector<HTMLElement>('#contacto-entidad .ng-invalid:is(input, select, textarea)')?.focus();
      return;
    }
    this.enviando.set(true);
    this.enviada.set(await this.solicitudes.registrar('entidad', this.form.getRawValue()));
    this.enviando.set(false);
  }
}
