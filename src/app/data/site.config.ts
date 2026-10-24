/**
 * Datos generales del sitio.
 * IMPORTANTE: el número de WhatsApp y el correo son marcadores de posición.
 * Reemplázalos por los canales oficiales antes de publicar.
 */
export const SITE = {
  nombre: 'Paso Firme',
  sigla: 'P.A.S.O. FIRME',
  lema: 'Tu negocio, con paso firme',
  mtp: 'Transformar la información del comercio popular en dignidad financiera, acceso justo al crédito y crecimiento sostenible para las familias del Atlántico.',
  whatsapp: '570000000000',
  correo: 'contacto@pasofirme.example',
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

export const NAV: NavItem[] = [
  { label: 'Inicio', path: '/', exact: true },
  { label: 'El programa', path: '/programa' },
  { label: 'Herramientas', path: '/herramientas' },
  { label: 'Entidades', path: '/entidades' },
  { label: 'Impacto', path: '/impacto' },
  { label: 'Aprende', path: '/aprende' },
  { label: 'Nosotros', path: '/nosotros' },
];
