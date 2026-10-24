import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Solicitud, Solicitudes } from '../../core/services/solicitudes';
import { ZONAS } from '../../data/content';
import { whatsappUrl } from '../../data/site.config';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHero } from '../../shared/ui/page-hero/page-hero';

function alMenosUna(group: AbstractControl): ValidationErrors | null {
  return Object.values(group.value as Record<string, boolean>).some(Boolean) ? null : { ninguna: true };
}

@Component({
  selector: 'app-inscripcion',
  imports: [ReactiveFormsModule, RouterLink, Icon, PageHero],
  templateUrl: './inscripcion.html',
  styleUrl: './inscripcion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inscripcion {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly solicitudes = inject(Solicitudes);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly municipios = ['Barranquilla', 'Soledad', 'Malambo', 'Galapa', 'Puerto Colombia', 'Otro municipio del Atlántico'];
  protected readonly zonas = [...ZONAS, 'Otra zona'];
  protected readonly tiposNegocio = ['Puesto fijo', 'Puesto semiestacionario', 'Tienda de barrio', 'Carretilla', 'Otro'];
  protected readonly necesidadesOpciones = [
    { key: 'ordenarCaja', texto: 'Ordenar mi caja y saber cuánto gano' },
    { key: 'salirGota', texto: 'Salir del gota a gota' },
    { key: 'credito', texto: 'Acceder a un crédito formal' },
    { key: 'impuestos', texto: 'Entender mis impuestos (RST, ICA)' },
    { key: 'subsidios', texto: 'Resolver dudas sobre mis subsidios' },
  ] as const;

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    celular: ['', [Validators.required, Validators.pattern(/^3\d{9}$/)]],
    contacto: ['whatsapp', Validators.required],
    municipio: ['', Validators.required],
    zona: ['', Validators.required],
    tipoNegocio: ['', Validators.required],
    actividad: ['', [Validators.required, Validators.minLength(3)]],
    antiguedad: ['', Validators.required],
    necesidades: this.fb.group(
      { ordenarCaja: false, salirGota: false, credito: false, impuestos: false, subsidios: false },
      { validators: alMenosUna },
    ),
    horario: ['manana'],
    autorizacion: [false, Validators.requiredTrue],
  });

  protected readonly antiguedad = toSignal(this.form.controls.antiguedad.valueChanges, { initialValue: '' });
  protected readonly enviando = signal(false);
  protected readonly enviada = signal<Solicitud | null>(null);
  protected readonly intentoEnviar = signal(false);

  protected readonly whatsapp = whatsappUrl('Hola, acabo de inscribir mi negocio en Paso Firme.');

  protected invalido(path: string): boolean {
    const control = this.form.get(path);
    return !!control && control.invalid && (control.touched || this.intentoEnviar());
  }

  protected async enviar(): Promise<void> {
    this.intentoEnviar.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid, textarea.ng-invalid')?.focus();
      return;
    }
    this.enviando.set(true);
    const solicitud = await this.solicitudes.registrar('comerciante', this.form.getRawValue());
    this.enviando.set(false);
    this.enviada.set(solicitud);
    window.scrollTo({ top: 0 });
  }

  protected nuevaInscripcion(): void {
    this.form.reset();
    this.intentoEnviar.set(false);
    this.enviada.set(null);
  }
}
