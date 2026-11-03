import { Injectable, NgZone, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, filter } from 'rxjs';

export type TipoEvento =
  | 'page_view'
  | 'page_leave'
  | 'cta_click'
  | 'tool_start'
  | 'tool_complete'
  | 'form_start'
  | 'form_submit_ok'
  | 'form_submit_error'
  | 'whatsapp_click'
  | 'faq_open'
  | 'audio_play';

interface Evento {
  tipo: TipoEvento;
  ruta: string;
  detalle?: Record<string, unknown>;
  duracionMs?: number;
}

interface Origen {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
}

const ENDPOINT = '/.netlify/functions/track';

/**
 * Analítica propia, sin cookies de terceros.
 * Guarda un identificador aleatorio en el navegador y envía solo nombres de página, de herramienta y categorías.
 * NUNCA registrar aquí lo que la persona escribe (nombres, celulares, montos).
 */
@Injectable({ providedIn: 'root' })
export class TrackingService {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private cola: Evento[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private ruta = '';
  private inicioRuta = 0;
  private activo = false;

  readonly visitorId = this.leerId(localStorage, 'pf_vid');
  readonly sesionId = this.leerId(sessionStorage, 'pf_sid');
  readonly origen: Origen = this.capturarOrigen();

  private leerId(store: Storage, clave: string): string {
    try {
      let id = store.getItem(clave);
      if (!id) {
        id = crypto.randomUUID();
        store.setItem(clave, id);
      }
      return id;
    } catch {
      return crypto.randomUUID();
    }
  }

  private capturarOrigen(): Origen {
    try {
      const guardado = sessionStorage.getItem('pf_origen');
      if (guardado) {
        return JSON.parse(guardado) as Origen;
      }
    } catch {
      // sin almacenamiento: se calcula de nuevo
    }
    const p = new URLSearchParams(location.search);
    const origen: Origen = {
      utm_source: p.get('utm_source') ?? undefined,
      utm_medium: p.get('utm_medium') ?? undefined,
      utm_campaign: p.get('utm_campaign') ?? undefined,
      referrer: document.referrer || undefined,
    };
    try {
      sessionStorage.setItem('pf_origen', JSON.stringify(origen));
    } catch {
      // sin almacenamiento
    }
    return origen;
  }

  /** Llamar una vez al arrancar la app (componente raíz). */
  iniciar(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const q = new URLSearchParams(location.search);
    try {
      if (q.get('interno') === '1') {
        localStorage.setItem('pf_interno', '1'); // el equipo no cuenta como visita
      }
      if (q.get('interno') === '0') {
        localStorage.removeItem('pf_interno');
      }
      this.activo = localStorage.getItem('pf_interno') !== '1' && navigator.doNotTrack !== '1';
    } catch {
      this.activo = navigator.doNotTrack !== '1';
    }
    if (!this.activo) {
      return;
    }

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.cerrarRuta();
        const ruta = e.urlAfterRedirects.split(/[?#]/)[0] || '/';
        if (ruta.startsWith('/admin')) {
          this.ruta = ''; // el panel no se mide
          return;
        }
        this.ruta = ruta;
        this.inicioRuta = Date.now();
        this.registrar('page_view');
      });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.cerrarRuta();
        this.vaciar(true);
      } else if (this.ruta) {
        this.inicioRuta = Date.now();
      }
    });
  }

  /**
   * Para calculadoras: registra `tool_start` en el primer cambio y `tool_complete` cuando la persona
   * deja de editar 2,5 s (uso sostenido). Solo viaja el nombre de la herramienta y, si aplica, la categoría.
   */
  seguirHerramienta(tool: string, cambios: Observable<unknown>, categoria?: () => string | undefined): void {
    const unaVez = (fn: () => void) => {
      let hecho = false;
      return () => {
        if (!hecho) {
          hecho = true;
          fn();
        }
      };
    };
    const inicio = unaVez(() => this.registrar('tool_start', { tool }));
    const fin = unaVez(() => this.registrar('tool_complete', { tool, ...(categoria?.() ? { resultado: categoria() } : {}) }));
    let t: ReturnType<typeof setTimeout> | undefined;
    cambios.subscribe(() => {
      inicio();
      clearTimeout(t);
      t = setTimeout(fin, 2500);
    });
  }

  /** Registra un evento. NUNCA incluyas datos escritos por la persona. */
  registrar(tipo: TipoEvento, detalle?: Record<string, unknown>): void {
    if (!this.activo || !this.ruta) {
      return;
    }
    this.encolar({ tipo, ruta: this.ruta, detalle });
  }

  private cerrarRuta(): void {
    if (!this.ruta || !this.inicioRuta) {
      return;
    }
    this.encolar({ tipo: 'page_leave', ruta: this.ruta, duracionMs: Date.now() - this.inicioRuta });
    this.inicioRuta = 0;
  }

  private encolar(e: Evento): void {
    this.cola.push(e);
    if (this.cola.length >= 10) {
      this.vaciar(false);
      return;
    }
    if (!this.timer) {
      this.zone.runOutsideAngular(() => {
        this.timer = setTimeout(() => this.vaciar(false), 1500);
      });
    }
  }

  private vaciar(beacon: boolean): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.cola.length) {
      return;
    }
    const cuerpo = JSON.stringify({
      visitorId: this.visitorId,
      sesionId: this.sesionId,
      ...this.origen,
      ruta: this.cola[0].ruta,
      eventos: this.cola.splice(0, 20),
    });
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([cuerpo], { type: 'application/json' }));
      return;
    }
    fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: cuerpo, keepalive: true }).catch(
      () => {
        // la analítica nunca debe romper la página
      },
    );
  }
}
