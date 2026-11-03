import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { InscripcionService } from '../../core/inscripcion.service';
import { TrackingService } from '../../core/tracking.service';
import { ZONAS } from '../../data/content';
import { whatsappUrl } from '../../core/contacto';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHero } from '../../shared/ui/page-hero/page-hero';

@Component({
  selector: 'app-inscripcion',
  imports: [ReactiveFormsModule, RouterLink, Icon, PageHero],
  templateUrl: './inscripcion.html',
  styleUrl: './inscripcion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inscripcion {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly servicio = inject(InscripcionService);
  private readonly tracking = inject(TrackingService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly abierto = Date.now();
  private empezo = false;

  protected readonly municipios = ['Barranquilla', 'Soledad', 'Malambo', 'Galapa', 'Puerto Colombia', 'Otro municipio del Atlántico'];
  protected readonly zonas = [...ZONAS, 'Otra zona'];
  protected readonly tiposNegocio = ['Puesto fijo', 'Puesto semiestacionario', 'Tienda de barrio', 'Carretilla', 'Otro'];
  protected readonly necesidadesOpciones = [
    { key: 'ordenarCaja', texto: 'Ordenar mi caja y saber cuánto gano' },
    { key: 'salirGota', texto: 'Salir del gota a gota' },
    { key: 'credito', texto: 'Acceder a un crédito formal' },
    { key: 'impuestos', texto: 'Entender mis impuestos sin miedo' },
    { key: 'subsidios', texto: 'Resolver dudas sobre mis subsidios' },
  ] as const;

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    celular: ['', [Validators.required, Validators.pattern(/^3\d{9}$/)]],
    contacto: ['whatsapp', Validators.required],
    zona: ['', Validators.required],
    // Paso 2 (opcional): lo completa la persona o el brigadista en la visita.
    municipio: [''],
    tipoNegocio: [''],
    actividad: [''],
    antiguedad: [''],
    necesidades: this.fb.group({ ordenarCaja: false, salirGota: false, credito: false, impuestos: false, subsidios: false }),
    horario: ['manana'],
    autorizacion: [false, Validators.requiredTrue],
    /** Campo trampa para bots: las personas no lo ven y debe quedar vacío. */
    website: [''],
  });

  protected readonly antiguedad = toSignal(this.form.controls.antiguedad.valueChanges, { initialValue: '' });
  protected readonly enviando = signal(false);
  protected readonly enviada = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly intentoEnviar = signal(false);

  protected readonly whatsapp = whatsappUrl('Hola, acabo de inscribir mi negocio en Paso Firme.');

  protected invalido(path: string): boolean {
    const control = this.form.get(path);
    return !!control && control.invalid && (control.touched || this.intentoEnviar());
  }

  /** Primer foco en cualquier campo: la persona empezó a llenar el formulario. */
  protected alEmpezar(): void {
    if (!this.empezo) {
      this.empezo = true;
      this.tracking.registrar('form_start');
    }
  }

  protected async enviar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorServidor.set(null);
    if (this.form.invalid) {
      this.tracking.registrar('form_submit_error', { motivo: 'validacion' });
      this.form.markAllAsTouched();
      this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid, textarea.ng-invalid')?.focus();
      return;
    }
    const v = this.form.getRawValue();
    this.enviando.set(true);
    const r = await this.servicio.enviar({
      nombre: v.nombre,
      celular: v.celular,
      canal: v.contacto,
      municipio: v.municipio,
      zona: v.zona,
      tipo: v.tipoNegocio,
      actividad: v.actividad,
      antiguedad: v.antiguedad,
      necesidades: this.necesidadesOpciones.filter((n) => v.necesidades[n.key]).map((n) => n.texto),
      horario: v.horario,
      consentimiento: v.autorizacion,
      website: v.website,
      tiempoMs: Date.now() - this.abierto,
    });
    this.enviando.set(false);
    if (!r.ok) {
      this.tracking.registrar('form_submit_error', { motivo: 'servidor' });
      this.errorServidor.set(r.error ?? 'No pudimos guardar tu inscripción. Intenta de nuevo.');
      return;
    }
    this.tracking.registrar('form_submit_ok');
    this.enviada.set(true);
    window.scrollTo({ top: 0 });
  }

  protected nuevaInscripcion(): void {
    this.form.reset();
    this.intentoEnviar.set(false);
    this.enviada.set(false);
    this.errorServidor.set(null);
  }
}
