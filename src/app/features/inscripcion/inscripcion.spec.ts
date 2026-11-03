import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WHATSAPP_NUMERO } from '../../core/contacto';
import { InscripcionService } from '../../core/inscripcion.service';
import { TrackingService } from '../../core/tracking.service';
import { Inscripcion } from './inscripcion';

describe('Inscripción: pantalla de éxito según el canal', () => {
  const registrar = vi.fn();
  const enviar = vi.fn(async () => ({ ok: true }));
  let fixture: ComponentFixture<Inscripcion>;
  const el = () => fixture.nativeElement as HTMLElement;

  function escribir(selector: string, valor: string, evento = 'input'): void {
    const campo = el().querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    campo.value = valor;
    campo.dispatchEvent(new Event(evento));
  }

  async function inscribir(canal: string): Promise<void> {
    escribir('#nombre', 'Marta Pérez');
    escribir('#celular', '3001234567');
    escribir('#zona', 'Paseo Bolívar', 'change');
    el().querySelector<HTMLInputElement>(`input[formcontrolname=contacto][value=${canal}]`)!.click();
    el().querySelector<HTMLInputElement>('input[formcontrolname=autorizacion]')!.click();
    fixture.detectChanges();
    el().querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    registrar.mockClear();
    enviar.mockClear();
    await TestBed.configureTestingModule({
      imports: [Inscripcion],
      providers: [
        provideRouter([]),
        { provide: InscripcionService, useValue: { enviar } },
        { provide: TrackingService, useValue: { registrar } },
      ],
    }).compileComponents();
    window.scrollTo = () => undefined;
    fixture = TestBed.createComponent(Inscripcion);
    fixture.detectChanges();
  });

  const casos: [string, string][] = [
    ['whatsapp', '¡Listo! Te escribimos pronto por WhatsApp.'],
    ['llamada', '¡Listo! Te llamamos pronto al número que dejaste.'],
    ['visita', '¡Listo! Pasamos por tu puesto para coordinar la visita.'],
  ];

  it.each(casos)('canal «%s» muestra su mensaje', async (canal, titulo) => {
    await inscribir(canal);
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(el().querySelector('.success h2')?.textContent?.trim()).toBe(titulo);
  });

  it.each(casos)('canal «%s» ofrece «Escríbenos ya por WhatsApp» con el número oficial y mide el clic', async (canal) => {
    await inscribir(canal);
    const enlace = [...el().querySelectorAll<HTMLAnchorElement>('.success a')].find((a) => a.textContent?.includes('Escríbenos ya por WhatsApp'))!;
    expect(enlace).toBeTruthy();
    expect(enlace.href).toContain(`https://wa.me/${WHATSAPP_NUMERO}?text=`);
    expect(decodeURIComponent(enlace.href.split('?text=')[1])).toContain('Hola');
    enlace.addEventListener('click', (e) => e.preventDefault());
    enlace.click();
    expect(registrar).toHaveBeenCalledWith('whatsapp_click', { origen: 'inscripcion_exito' });
  });

  it('«Qué pasa después» no contradice el canal elegido', async () => {
    await inscribir('llamada');
    expect(el().querySelector('.next-steps li')?.textContent).toContain('por el medio que elegiste');
  });
});
