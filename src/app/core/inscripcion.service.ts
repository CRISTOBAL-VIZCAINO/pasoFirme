import { Injectable, inject } from '@angular/core';

import { TrackingService } from './tracking.service';

/** Versión del texto de consentimiento y de la política vigente al momento del envío. */
export const VERSION_POLITICA = '2026-11';

export interface DatosInscripcion {
  nombre: string;
  celular: string;
  canal: string;
  municipio: string;
  zona: string;
  tipo: string;
  actividad: string;
  antiguedad: string;
  necesidades: string[];
  horario: string;
  consentimiento: boolean;
  /** Campo trampa: debe ir vacío. */
  website: string;
  /** Milisegundos desde que se abrió el formulario. */
  tiempoMs: number;
}

export interface ResultadoInscripcion {
  ok: boolean;
  error?: string;
}

/** Envía la inscripción a la función de Netlify. El navegador nunca habla directo con la base de datos. */
@Injectable({ providedIn: 'root' })
export class InscripcionService {
  private readonly tracking = inject(TrackingService);

  async enviar(datos: DatosInscripcion): Promise<ResultadoInscripcion> {
    try {
      const respuesta = await fetch('/.netlify/functions/inscripcion', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...datos,
          versionPolitica: VERSION_POLITICA,
          visitorId: this.tracking.visitorId,
          sesionId: this.tracking.sesionId,
          ...this.tracking.origen,
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => ({}))) as ResultadoInscripcion;
      if (respuesta.ok && cuerpo.ok) {
        return { ok: true };
      }
      return { ok: false, error: cuerpo.error ?? 'No pudimos guardar tu inscripción. Intenta de nuevo.' };
    } catch {
      return { ok: false, error: 'Sin conexión. Revisa tu internet e intenta de nuevo.' };
    }
  }
}
