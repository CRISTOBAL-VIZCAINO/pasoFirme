import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

const CLAVE = 'pf_admin';
const BASE = '/.netlify/functions';

export class AdminError extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

// ---------- Contratos de las funciones admin-* ----------
export interface Dashboard {
  kpis: {
    visitantes_unicos: number;
    sesiones: number;
    paginas_vistas: number;
    inscritos: number;
    inscritos_total: number;
    formularios_iniciados: number;
    herramientas_completadas: number;
    clics_whatsapp: number;
  };
  embudo: { visitaron: number; vieron_inscripcion: number; iniciaron_form: number; enviaron_form: number };
  por_dia: { dia: string; visitantes: number; vistas: number; inscritos: number }[];
  modulos: { modulo: string; vistas: number; visitantes: number; seg_prom: number }[];
  fuentes: { fuente: string; visitantes: number }[];
  dispositivos: { dispositivo: string; visitantes: number }[];
  ubicaciones: { ciudad: string | null; departamento: string | null; visitantes: number }[];
  herramientas: { herramienta: string; iniciadas: number; completadas: number }[];
  ctas: { cta: string; clics: number }[];
}

export interface Inscripcion {
  id: string;
  created_at: string;
  nombre: string;
  celular: string;
  canal_contacto: string | null;
  municipio: string | null;
  zona: string | null;
  tipo_negocio: string | null;
  actividad: string | null;
  antiguedad: string | null;
  necesidades: string[] | null;
  horario: string | null;
  estado: 'nuevo' | 'contactado' | 'visitado' | 'descartado';
  notas: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  visitor_id: string | null;
}

export interface FilaVisitante {
  visitor_id: string;
  primera_visita: string;
  ultima_visita: string;
  paginas: number;
  ciudad: string | null;
  departamento: string | null;
  pais: string | null;
  dispositivo: string | null;
  navegador: string | null;
  fuente: string | null;
  inscrito: boolean;
  nombre_inscrito: string | null;
}

export interface EventoLinea {
  created_at: string;
  tipo: string;
  ruta: string | null;
  modulo: string | null;
  detalle: Record<string, unknown> | null;
  duracion_ms: number | null;
}

export interface DetalleVisitante {
  visitante: Record<string, string | null>;
  inscripcion: { id: string; nombre: string; celular: string; estado: string; created_at: string } | null;
  eventos: EventoLinea[];
}

/**
 * Sesión y llamadas del panel. La contraseña se cambia por un token de 8 h que vive solo en `sessionStorage`
 * (se borra al cerrar la pestaña). Cualquier 401 cierra la sesión.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly router = inject(Router);
  private readonly token = signal<string | null>(this.leerToken());
  readonly sesionActiva = computed(() => !!this.token());

  private leerToken(): string | null {
    try {
      return sessionStorage.getItem(CLAVE);
    } catch {
      return null;
    }
  }

  async login(password: string): Promise<{ ok: boolean; error?: string; estado?: number }> {
    try {
      const r = await fetch(`${BASE}/admin-login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const cuerpo = (await r.json().catch(() => ({}))) as { ok?: boolean; token?: string; error?: string };
      if (r.ok && cuerpo.ok && cuerpo.token) {
        try {
          sessionStorage.setItem(CLAVE, cuerpo.token);
        } catch {
          // sin almacenamiento: la sesión vive solo en memoria
        }
        this.token.set(cuerpo.token);
        return { ok: true };
      }
      const mensaje = r.status === 429 ? 'Demasiados intentos, espera 15 minutos.' : (cuerpo.error ?? 'No se pudo entrar.');
      return { ok: false, error: mensaje, estado: r.status };
    } catch {
      return { ok: false, error: 'Sin conexión. Revisa tu internet.' };
    }
  }

  logout(): void {
    try {
      sessionStorage.removeItem(CLAVE);
    } catch {
      // nada que borrar
    }
    this.token.set(null);
    void this.router.navigate(['/admin']);
  }

  private async pedir(metodo: string, ruta: string, params?: Record<string, string | number | undefined>, cuerpo?: unknown): Promise<Response> {
    const url = new URL(`${BASE}/${ruta}`, location.origin);
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v !== undefined && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }
    let r: Response;
    try {
      r = await fetch(url, {
        method: metodo,
        headers: {
          authorization: `Bearer ${this.token() ?? ''}`,
          ...(cuerpo ? { 'content-type': 'application/json' } : {}),
        },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
    } catch {
      throw new AdminError(0, 'Sin conexión. Revisa tu internet.');
    }
    if (r.status === 401) {
      this.logout();
      throw new AdminError(401, 'Tu sesión terminó. Entra de nuevo.');
    }
    if (!r.ok) {
      const c = (await r.json().catch(() => ({}))) as { error?: string };
      throw new AdminError(r.status, c.error ?? 'Algo salió mal. Intenta de nuevo.');
    }
    return r;
  }

  async get<T>(ruta: string, params?: Record<string, string | number | undefined>): Promise<T> {
    return (await this.pedir('GET', ruta, params)).json() as Promise<T>;
  }

  async enviar<T>(metodo: 'PATCH' | 'DELETE', ruta: string, params?: Record<string, string | number | undefined>, cuerpo?: unknown): Promise<T> {
    return (await this.pedir(metodo, ruta, params, cuerpo)).json() as Promise<T>;
  }

  /** Descarga el CSV con el token (un enlace directo no puede llevar el encabezado). */
  async descargarCsv(params: Record<string, string | number | undefined>): Promise<void> {
    const r = await this.pedir('GET', 'admin-inscripciones', { ...params, formato: 'csv' });
    const url = URL.createObjectURL(await r.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inscripciones.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
