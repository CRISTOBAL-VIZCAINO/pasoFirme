/** Fechas del panel: siempre en hora de Bogotá (UTC−5, sin horario de verano) y formato es-CO. */

const ZONA = 'America/Bogota';
const fechaHora = new Intl.DateTimeFormat('es-CO', { timeZone: ZONA, dateStyle: 'medium', timeStyle: 'short' });
const soloHora = new Intl.DateTimeFormat('es-CO', { timeZone: ZONA, hour: '2-digit', minute: '2-digit' });
const soloFecha = new Intl.DateTimeFormat('es-CO', { timeZone: ZONA, day: '2-digit', month: 'short' });
const miles = new Intl.NumberFormat('es-CO');

export type PresetRango = 'hoy' | '7' | '30' | 'todo' | 'personalizado';

export const num = (n: number | null | undefined): string => miles.format(n ?? 0);
export const fmtFechaHora = (iso: string): string => fechaHora.format(new Date(iso));
export const fmtHora = (d: Date): string => soloHora.format(d);

/** «2026-11-03» → «3 nov» */
export const fmtDia = (dia: string): string => soloFecha.format(new Date(`${dia}T12:00:00-05:00`));

export function fmtDuracion(segundos: number | null | undefined): string {
  const s = Math.round(segundos ?? 0);
  if (s < 60) {
    return `${s} s`;
  }
  return `${Math.floor(s / 60)} min ${s % 60} s`;
}

/** Fecha de hoy en Bogotá como YYYY-MM-DD. */
export function hoyBogota(): string {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return p; // en-CA ya entrega YYYY-MM-DD
}

function sumarDias(dia: string, dias: number): string {
  const d = new Date(`${dia}T12:00:00-05:00`);
  d.setUTCDate(d.getUTCDate() + dias);
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Medianoche de Bogotá de un día, en ISO con offset (p. ej. 2026-11-03T00:00:00-05:00). */
export const medianocheBogota = (dia: string): string => `${dia}T00:00:00-05:00`;

/** Rango [desde, hasta) en ISO con offset. `hasta` es exclusivo. */
export function calcularRango(preset: PresetRango, desdeDia?: string, hastaDia?: string): { desde: string; hasta: string } {
  const hoy = hoyBogota();
  const manana = sumarDias(hoy, 1);
  switch (preset) {
    case 'hoy':
      return { desde: medianocheBogota(hoy), hasta: medianocheBogota(manana) };
    case '7':
      return { desde: medianocheBogota(sumarDias(hoy, -6)), hasta: medianocheBogota(manana) };
    case '30':
      return { desde: medianocheBogota(sumarDias(hoy, -29)), hasta: medianocheBogota(manana) };
    case 'todo':
      return { desde: medianocheBogota('2020-01-01'), hasta: medianocheBogota(manana) };
    default: {
      const d = desdeDia || hoy;
      const h = hastaDia || d;
      return { desde: medianocheBogota(d), hasta: medianocheBogota(sumarDias(h, 1)) }; // el día final se incluye
    }
  }
}

/** Une partes de texto ignorando las vacías: unir(['Soledad', null], ' · ') → «Soledad». */
export const unir = (partes: (string | null | undefined)[], separador: string): string => partes.filter((p) => !!p).join(separador);
