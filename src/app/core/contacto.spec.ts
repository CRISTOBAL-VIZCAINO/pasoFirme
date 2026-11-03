import { WHATSAPP_NUMERO, WHATSAPP_VISIBLE, whatsappUrl } from './contacto';

describe('Número oficial de WhatsApp', () => {
  it('usa el número oficial en formato internacional y visible', () => {
    expect(WHATSAPP_NUMERO).toBe('573206486123');
    expect(WHATSAPP_VISIBLE).toBe('320 648 6123');
  });

  it('arma el enlace con el mensaje codificado', () => {
    expect(whatsappUrl('Hola, quiero que me visiten en mi puesto.')).toBe(
      'https://wa.me/573206486123?text=Hola%2C%20quiero%20que%20me%20visiten%20en%20mi%20puesto.',
    );
  });
});
