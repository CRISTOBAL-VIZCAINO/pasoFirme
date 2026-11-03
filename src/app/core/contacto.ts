/**
 * Único lugar donde vive el número oficial de WhatsApp.
 * Ningún componente debe escribir el número a mano: usa `whatsappUrl()` o `WHATSAPP_VISIBLE`.
 */

/** Formato internacional, sin «+» ni espacios. */
export const WHATSAPP_NUMERO = '573206486123';

/** Para mostrar en pantalla. */
export const WHATSAPP_VISIBLE = '320 648 6123';

/** Arma el enlace de WhatsApp con el mensaje ya escrito. */
export function whatsappUrl(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}
