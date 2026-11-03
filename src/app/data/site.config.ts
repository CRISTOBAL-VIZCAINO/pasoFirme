/**
 * Datos generales del sitio.
 * TODO: el número de WhatsApp es un marcador de posición: reemplázalo por el oficial antes de publicar.
 * TODO: `correo` queda vacío hasta tener uno real; mientras tanto el sitio no lo muestra.
 */
export const SITE = {
  nombre: 'Paso Firme',
  sigla: 'P.A.S.O. FIRME',
  lema: 'Tu negocio, con paso firme',
  mtp: 'Transformar la información del comercio popular en dignidad financiera, acceso justo al crédito y crecimiento sostenible para las familias del Atlántico.',
  whatsapp: '570000000000',
  correo: '',
  ubicacion: 'Barranquilla, Atlántico · Colombia',
  instituciones: 'Universidad Andrés Bello (UNAB) · Corporación Universitaria Minuto de Dios (UNIMINUTO)',
} as const;

export function whatsappUrl(mensaje: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
}

/** Menú del comerciante: cinco opciones como máximo. */
export const NAV: NavItem[] = [
  { label: 'Inicio', path: '/', exact: true },
  { label: 'Cómo funciona', path: '/programa' },
  { label: 'Herramientas', path: '/herramientas' },
  { label: 'Aprende', path: '/aprende' },
  { label: 'Nosotros', path: '/nosotros' },
];

/** Enlace discreto para microfinancieras, sector público y universidades. */
export const NAV_ALIADOS: NavItem = { label: 'Para aliados e instituciones', path: '/entidades' };

/**
 * TODO: audio de presentación (nota de voz de ~1 minuto, tono cercano) en `public/audio/`.
 * Mientras esté vacío, el reproductor no se muestra.
 */
export const AUDIO_PRESENTACION = '';

