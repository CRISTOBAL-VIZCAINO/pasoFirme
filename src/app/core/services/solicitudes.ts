import { Injectable } from '@angular/core';

export type TipoSolicitud = 'comerciante' | 'entidad';

export interface Solicitud<T = Record<string, unknown>> {
  radicado: string;
  tipo: TipoSolicitud;
  fecha: string;
  datos: T;
}

const STORAGE_KEY = 'pasofirme.solicitudes';

/**
 * Registro local de solicitudes.
 * El proyecto es exclusivamente frontend: no hay API. Las solicitudes se guardan
 * en el almacenamiento del navegador para simular el flujo completo; al conectar
 * un backend basta con reemplazar `registrar` por una llamada HTTP.
 */
@Injectable({ providedIn: 'root' })
export class Solicitudes {
  registrar<T extends object>(tipo: TipoSolicitud, datos: T): Promise<Solicitud<T>> {
    const solicitud: Solicitud<T> = {
      radicado: this.generarRadicado(tipo),
      tipo,
      fecha: new Date().toISOString(),
      datos,
    };

    try {
      const previas = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Solicitud[];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...previas, solicitud]));
    } catch {
      // Sin almacenamiento disponible (modo privado): el flujo continúa igual.
    }

    // Latencia simulada para mostrar el estado de envío.
    return new Promise((resolve) => setTimeout(() => resolve(solicitud), 700));
  }

  private generarRadicado(tipo: TipoSolicitud): string {
    const prefijo = tipo === 'comerciante' ? 'PF' : 'PF-E';
    const aleatorio = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `${prefijo}-${new Date().getFullYear()}-${aleatorio}`;
  }
}
