import { IconName } from '../shared/ui/icon/icons';

/**
 * Contenido editorial del sitio. Cifras y decisiones provienen de los documentos
 * del proyecto (Tareas 1–3 UNAB·UNIMINUTO y estudio de prefactibilidad).
 */

export type Tone = 'teal' | 'sun' | 'coral' | 'navy' | 'sky';

export interface Problema {
  icon: IconName;
  tone: Tone;
  titulo: string;
  texto: string;
  dato: string;
  datoTexto: string;
  fuente: string;
}

export const PROBLEMAS: Problema[] = [
  {
    icon: 'wallet',
    tone: 'sun',
    titulo: 'La «caja única»',
    texto:
      'La plata de la casa y la del negocio viven en el mismo bolsillo. Sin darse cuenta, lo que era para resurtir se va en gastos del hogar y el negocio se descapitaliza.',
    dato: '72%',
    datoTexto: 'de los micronegocios no lleva libros ni software contable',
    fuente: 'Proyecto RELOG Atlántico, 2024',
  },
  {
    icon: 'alert',
    tone: 'coral',
    titulo: 'La trampa del «gota a gota»',
    texto:
      'Sin historial ni registros, el banco dice que no. El prestamista informal dice que sí, pero cobra intereses que se comen toda la ganancia y pone en riesgo la tranquilidad de la familia.',
    dato: '20%',
    datoTexto: 'mensual es la tasa promedio que pagan los comerciantes endeudados informalmente',
    fuente: 'Encuesta Modelo PEDAF, Malambo 2024',
  },
  {
    icon: 'shield',
    tone: 'navy',
    titulo: 'El miedo a la DIAN y a perder subsidios',
    texto:
      'Muchos creen que sacar el RUT o anotar sus ventas los saca del Sisbén o de Renta Ciudadana. Ese temor los mantiene lejos de cualquier ayuda formal.',
    dato: '57,1%',
    datoTexto: 'de los micronegocios no tiene RUT',
    fuente: 'Proyecto RELOG Atlántico, 2024',
  },
  {
    icon: 'clock',
    tone: 'teal',
    titulo: 'No hay tiempo para ir a clases',
    texto:
      'Cerrar el puesto 3 horas para ir a una capacitación es perder «el diario» y arriesgar el espacio. Por eso los programas en aula no llegan a quien más los necesita.',
    dato: '3 h',
    datoTexto: 'de puesto cerrado pueden significar perder la comida del día',
    fuente: 'Trabajo de campo, Paseo Bolívar',
  },
];

export interface PilarPaso {
  letra: string;
  titulo: string;
  icon: IconName;
  resumen: string;
  puntos: string[];
}

export const METODO_PASO: PilarPaso[] = [
  {
    letra: 'P',
    titulo: 'Pedagogía contable',
    icon: 'book',
    resumen: 'Aprendes a anotar, costear y calcular tu margen con una cartilla de colores, en microtalleres de 15 minutos.',
    puntos: [
      'Cartilla de Caja Diaria con código de colores y pictogramas',
      'Microtalleres en horas valle, sin tecnicismos',
      'Cálculo de costo, precio y margen de tus productos',
    ],
  },
  {
    letra: 'A',
    titulo: 'Acompañamiento in-situ',
    icon: 'map-pin',
    resumen: 'Vamos hasta tu puesto. No cierras, no pagas transporte y no pierdes ni una venta.',
    puntos: [
      'Brigadistas universitarios de la red NAF en tu punto de venta',
      'Revisiones quincenales durante los primeros 90 días',
      'Seguimiento por WhatsApp con notas de voz o fotos',
    ],
  },
  {
    letra: 'S',
    titulo: 'Simulación tributaria',
    icon: 'calculator',
    resumen: 'Simulamos de forma anónima cuánto pagarías en el Régimen Simple o de ICA. Primero entiendes, luego decides.',
    puntos: [
      'Simulación pedagógica del RST y del ICA distrital',
      'Sin inscribirte en nada y sin compartir tus datos',
      'Aclaramos los mitos sobre el RUT y los subsidios',
    ],
  },
  {
    letra: 'O',
    titulo: 'Organización financiera',
    icon: 'trending-up',
    resumen: 'Separamos la plata de la casa y la del negocio, ordenamos tu flujo de caja y construimos tu perfil para un crédito justo.',
    puntos: [
      'Fin de la «caja única»: te asignas un sueldo fijo',
      'Resumen semanal de cuánto ganas de verdad',
      'Perfil financiero alternativo para microcrédito formal',
    ],
  },
];

export interface Paso {
  icon: IconName;
  titulo: string;
  texto: string;
}

export const COMO_FUNCIONA: Paso[] = [
  {
    icon: 'users',
    titulo: 'Te visitamos',
    texto: 'Un brigadista universitario llega a tu puesto, conversa contigo y entiende tu negocio. Sin papeleo y sin juicios.',
  },
  {
    icon: 'mic',
    titulo: 'Anotas a tu manera',
    texto: 'En la cartilla de colores o con una nota de voz o una foto por WhatsApp. El copiloto de IA lo convierte en registros ordenados.',
  },
  {
    icon: 'chart',
    titulo: 'Ves cuánto ganas',
    texto: 'Cada semana recibes un resumen sencillo, en tu lenguaje: cuánto vendiste, cuánto gastaste y cuánto ganaste de verdad.',
  },
  {
    icon: 'landmark',
    titulo: 'Accedes a crédito justo',
    texto: 'Con tus registros armamos tu perfil y, si tú lo autorizas, lo presentamos a microfinancieras aliadas. Meta: pre-aprobación en menos de 24 horas.',
  },
];

export interface Audiencia {
  icon: IconName;
  tone: Tone;
  para: string;
  titulo: string;
  texto: string;
  puntos: string[];
  cta: string;
  ruta: string;
  fragmento?: string;
}

export const AUDIENCIAS: Audiencia[] = [
  {
    icon: 'store',
    tone: 'sun',
    para: 'Comerciantes',
    titulo: 'Gratis para ti, en tu puesto',
    texto: 'Para vendedores estacionarios, semiestacionarios y tiendas de barrio del Paseo Bolívar y el Atlántico.',
    puntos: ['Orden de caja sin tecnicismos', 'Salida del gota a gota', 'Simulación tributaria anónima'],
    cta: 'Inscribe tu negocio',
    ruta: '/inscripcion',
  },
  {
    icon: 'landmark',
    tone: 'teal',
    para: 'Microfinancieras y fintech',
    titulo: 'Clientes precalificados con datos reales',
    texto: 'Expedientes con flujo de caja diario verificado en campo y scoring alternativo para originar microcrédito sano.',
    puntos: ['Menor costo de adquisición', 'Menor riesgo de mora', 'Risk-as-a-Service vía API'],
    cta: 'Ver propuesta B2B',
    ruta: '/entidades',
    fragmento: 'microfinancieras',
  },
  {
    icon: 'building',
    tone: 'navy',
    para: 'Sector público y gremios',
    titulo: 'Inclusión con impacto medible',
    texto: 'Programas de fortalecimiento en territorio con formalización progresiva, no traumática, y retorno social medido.',
    puntos: ['Meta de SROI superior a 2,5', 'Tableros de indicadores', 'Ejecución con universidades'],
    cta: 'Ver propuesta B2G',
    ruta: '/entidades',
    fragmento: 'sector-publico',
  },
];

export interface Meta {
  valor: string;
  texto: string;
}

export const METAS_PILOTO: Meta[] = [
  { valor: '60%', texto: 'de los comerciantes con registros de caja al día a los 90 días' },
  { valor: '30%', texto: 'accede a su primer microcrédito formal' },
  { valor: '40%', texto: 'menos gasto financiero al dejar la usura' },
  { valor: '> 2,5', texto: 'de retorno social (SROI) por cada peso invertido' },
];

export interface Mito {
  mito: string;
  realidad: string;
}

export const MITOS: Mito[] = [
  {
    mito: 'Si saco el RUT pierdo el Sisbén y Renta Ciudadana.',
    realidad:
      'Tener RUT no es, por sí solo, causal de salida de los programas sociales. La focalización se basa en tus condiciones de vida e ingresos reales (Sisbén IV y la transición al Registro Universal de Ingresos, RUI). Ordenar tus cuentas te ayuda a demostrar tu situación real.',
  },
  {
    mito: 'Si anoto mis ventas, la DIAN me va a cobrar.',
    realidad:
      'Tus registros son tuyos. En Paso Firme son confidenciales: no los compartimos con autoridades. Sirven para que tomes mejores decisiones y, solo si tú lo autorizas, para solicitar un crédito.',
  },
  {
    mito: 'Los bancos nunca le prestan a quien vende en la calle.',
    realidad:
      'Existen microfinancieras y cooperativas especializadas en microcrédito. Lo que piden es ver que tu negocio genera plata, y tus registros diarios son justamente esa prueba.',
  },
  {
    mito: 'El gota a gota es más fácil y rápido.',
    realidad:
      'Es rápido, pero carísimo: al 20% mensual, un préstamo de $500.000 te cuesta $100.000 cada mes. Si lo renuevas todo el año, pagas $1.200.000 en intereses: más del doble de lo que te prestaron.',
  },
  {
    mito: 'Lo que sobra en el cajón es ganancia.',
    realidad:
      'No siempre. Parte de esa plata es para volver a comprar mercancía. Si se gasta en la casa, el negocio se va quedando sin capital poco a poco, aunque venda bien.',
  },
  {
    mito: 'Para ordenar mi negocio necesito un contador caro.',
    realidad:
      'Con una cartilla de colores y cinco minutos al día puedes saber cuánto ganas. Y el acompañamiento de Paso Firme no le cuesta nada al comerciante.',
  },
];

export interface Pregunta {
  pregunta: string;
  respuesta: string;
}

export const FAQ: Pregunta[] = [
  {
    pregunta: '¿Cuánto me cuesta?',
    respuesta:
      'Nada. Paso Firme no le cobra al comerciante. El programa se financia con convenios institucionales y con comisiones que pagan las entidades financieras cuando aprueban un crédito.',
  },
  {
    pregunta: '¿Tengo que cerrar mi puesto o ir a algún lugar?',
    respuesta:
      'No. Vamos a tu puesto en las horas de menos movimiento. Las sesiones duran unos 15 minutos y puedes seguir atendiendo a tus clientes.',
  },
  {
    pregunta: '¿Ustedes son de la DIAN o de la Alcaldía?',
    respuesta:
      'No. Paso Firme es una iniciativa de emprendimiento social nacida en la academia. No fiscalizamos ni cobramos impuestos. Nos articulamos con programas como los Núcleos de Apoyo Contable y Fiscal (NAF), que ofrecen orientación gratuita, pero no compartimos tu información con autoridades.',
  },
  {
    pregunta: '¿Quiénes son los brigadistas?',
    respuesta:
      'Estudiantes de últimos semestres de Contaduría Pública y Administración, vinculados a universidades y a la red NAF, siempre supervisados por consultores contables con experiencia.',
  },
  {
    pregunta: '¿Necesito un celular inteligente?',
    respuesta:
      'No. Puedes llevar tus cuentas en la Cartilla de Caja Diaria en papel. Si tienes WhatsApp, puedes enviarnos notas de voz o fotos y te ahorras aún más tiempo.',
  },
  {
    pregunta: '¿Me atiende un robot?',
    respuesta:
      'No. Siempre hay una persona contigo. La inteligencia artificial trabaja «en la sombra»: transcribe tus notas de voz y lee tus recibos para que el brigadista dedique su tiempo a conversar contigo.',
  },
  {
    pregunta: '¿Me garantizan el crédito?',
    respuesta:
      'No podemos garantizarlo: la decisión es de cada entidad. Lo que hacemos es ayudarte a construir un perfil sólido con tus registros reales para que te evalúen de forma justa.',
  },
  {
    pregunta: '¿Qué pasa con mis datos?',
    respuesta:
      'Tus datos se tratan conforme a la Ley 1581 de 2012 de protección de datos personales. Solo se usan para acompañarte y nunca se comparten con una entidad financiera sin tu autorización expresa.',
  },
];

export interface Termino {
  termino: string;
  definicion: string;
}

export const GLOSARIO: Termino[] = [
  { termino: 'Caja única', definicion: 'Cuando la plata de la casa y la del negocio se mezclan en el mismo bolsillo o cajón.' },
  { termino: 'Gota a gota', definicion: 'Préstamo informal con cobro diario y tasas usureras, usualmente cercanas al 20% mensual.' },
  { termino: 'Margen', definicion: 'Lo que te queda de cada venta después de descontar lo que te costó la mercancía.' },
  { termino: 'Flujo de caja', definicion: 'El registro de la plata que entra y sale de tu negocio día a día.' },
  { termino: 'RUT', definicion: 'Registro Único Tributario. Te identifica ante la DIAN; tenerlo no implica pagar impuestos de inmediato.' },
  { termino: 'RST', definicion: 'Régimen Simple de Tributación: un solo pago que integra varios impuestos, pensado para pequeños negocios.' },
  { termino: 'ICA', definicion: 'Impuesto de Industria y Comercio que cobra el municipio o distrito sobre los ingresos del negocio.' },
  { termino: 'UVT', definicion: 'Unidad de Valor Tributario. Valor en pesos que fija la DIAN cada año para calcular topes y sanciones.' },
  { termino: 'Sisbén IV / RUI', definicion: 'Sistemas para focalizar subsidios según condiciones de vida e ingresos reales del hogar.' },
  { termino: 'NAF', definicion: 'Núcleos de Apoyo Contable y Fiscal: consultorios gratuitos de universidades en alianza con la DIAN.' },
  { termino: 'Scoring alternativo', definicion: 'Evaluación de capacidad de pago basada en tus registros reales de ventas, no solo en historial bancario.' },
  { termino: 'SROI', definicion: 'Retorno Social de la Inversión: cuánto valor social genera cada peso invertido en el programa.' },
];

export interface ColorCartilla {
  color: string;
  nombre: string;
  uso: string;
}

export const CARTILLA_COLORES: ColorCartilla[] = [
  { color: 'var(--teal-600)', nombre: 'Verde', uso: 'Lo que vendes: toda la plata que entra al negocio.' },
  { color: 'var(--coral-600)', nombre: 'Rojo', uso: 'Lo que gasta el negocio: mercancía, bolsas, transporte, pago del puesto.' },
  { color: 'var(--sky-600)', nombre: 'Azul', uso: 'Tu sueldo: la plata fija que llevas a la casa cada día.' },
  { color: 'var(--sun-500)', nombre: 'Amarillo', uso: 'Tu ahorro: lo que guardas para resurtir o para imprevistos.' },
];

export interface Fuente {
  nombre: string;
  aporte: string;
}

export const FUENTES: Fuente[] = [
  {
    nombre: 'DANE – EMICRON',
    aporte: 'Más del 90% de los micronegocios del país son trabajadores por cuenta propia y unidades de subsistencia.',
  },
  {
    nombre: 'Proyecto RELOG (SENA Atlántico)',
    aporte: '72% no lleva libros ni software contable; 72,2% sin registro mercantil; 57,1% sin RUT (Barranquilla, Galapa, Soledad y Puerto Colombia).',
  },
  {
    nombre: 'Modelo PEDAF (Malambo)',
    aporte: 'El 100% de los endeudados informales recurre a créditos usureros cercanos al 20% mensual; valida cartillas físicas para baja escolaridad.',
  },
  {
    nombre: 'Universidad Simón Bolívar',
    aporte: 'Dinámicas de los vendedores del centro histórico y fricciones de su reubicación en el Gran Bazar.',
  },
  {
    nombre: 'Estudio Estadio Metropolitano (Ley 1988 de 2019)',
    aporte: '60% opera en carretillas y 60% solicita apoyo en capital de trabajo ante procesos de reubicación.',
  },
  {
    nombre: 'Guía General NAF – DIAN',
    aporte: 'Protocolos para asesoría tributaria gratuita y descentralizada a personas de baja renta y pequeños negocios.',
  },
  {
    nombre: 'Metodología SROI (Proyecto INSOLA)',
    aporte: 'Marco para monetizar impactos como sanciones evitadas, ahorro en intereses y valor social generado.',
  },
];

export interface IntegranteEquipo {
  nombre: string;
  /** Foto opcional (cuadrada, mín. 400×400) en `public/images/equipo/`; si no existe se muestran las iniciales. */
  foto?: string;
}

/** Grupo 4 · Diplomado Internacional en Transformación Digital y Creación de Startups. */
export const EQUIPO: IntegranteEquipo[] = [
  { nombre: 'Daniel Enrique Sarmiento Llanos', foto: 'images/equipo/daniel-sarmiento.jpg' },
  { nombre: 'Jorge Luis Rueda Narváez', foto: 'images/equipo/jorge-rueda.jpg' },
  { nombre: 'Cristian David Baena Camargo', foto: 'images/equipo/cristian-baena.jpg' },
  { nombre: 'Estefanía Juliana María Valentina Barón Huertas', foto: 'images/equipo/estefania-baron.jpg' },
  { nombre: 'Cristóbal Vizcaino Mercado', foto: 'images/equipo/cristobal-vizcaino.jpg' },
];

export interface GrupoAliado {
  icon: IconName;
  categoria: string;
  actores: string[];
}

export const ECOSISTEMA: GrupoAliado[] = [
  { icon: 'graduation', categoria: 'Academia', actores: ['UNIMINUTO', 'UNAB', 'CUC', 'UCC', 'Universidad Simón Bolívar'] },
  { icon: 'scale', categoria: 'Red NAF', actores: ['Núcleos de Apoyo Contable y Fiscal (programa DIAN–universidades)'] },
  {
    icon: 'building',
    categoria: 'Sector público',
    actores: ['Secretaría de Desarrollo Económico de Barranquilla', 'Gobernación del Atlántico', 'Cámaras de Comercio'],
  },
  {
    icon: 'users',
    categoria: 'Comunidad y gremios',
    actores: ['ACOPI Atlántico', 'Asocentro', 'Red de Mujeres Lideresas', 'Asociaciones de vendedores del Paseo Bolívar'],
  },
  { icon: 'landmark', categoria: 'Sector financiero', actores: ['Microfinancieras', 'Cooperativas de crédito', 'Fintech de inclusión'] },
];

export const ZONAS = ['Paseo Bolívar', 'Gran Bazar', 'Mercado Central (Barranquillita)', 'Estadio Metropolitano', 'Soledad', 'Malambo', 'Galapa'];

/**
 * Fotos de los carruseles de confianza.
 * Para activar una foto basta con guardar el archivo en `public/` con el nombre indicado en `src`;
 * mientras no exista, el carrusel muestra un espacio reservado con la sugerencia de toma.
 * Toda foto de comerciantes requiere su autorización escrita de uso de imagen.
 */
export interface Foto {
  src: string;
  alt: string;
  titulo: string;
  lugar: string;
  /** Qué debería mostrar la foto (se ve solo mientras falta el archivo). */
  sugerencia: string;
}

export const FOTOS_TERRITORIO: Foto[] = [
  {
    src: 'images/territorio/01-conversacion-paseo-bolivar.jpg',
    alt: 'Brigadista de Paso Firme conversa con una vendedora en su puesto del Paseo Bolívar',
    titulo: 'Conversamos en tu puesto',
    lugar: 'Paseo Bolívar, Barranquilla',
    sugerencia: 'Brigadista conversando de frente con una vendedora en su puesto, ambos sonriendo. Plano medio, luz natural.',
  },
  {
    src: 'images/territorio/02-cartilla-colores.jpg',
    alt: 'Comerciante muestra su Cartilla de Caja Diaria diligenciada con colores',
    titulo: 'La cartilla, en manos del comerciante',
    lugar: 'Gran Bazar',
    sugerencia: 'Manos del comerciante sosteniendo la Cartilla de Caja Diaria llena, con el puesto desenfocado al fondo.',
  },
  {
    src: 'images/territorio/03-foto-recibo-whatsapp.jpg',
    alt: 'Brigadista toma con el celular la foto de un recibo para registrarlo por WhatsApp',
    titulo: 'Del recibo arrugado al registro ordenado',
    lugar: 'Mercado Central (Barranquillita)',
    sugerencia: 'Brigadista fotografiando con el celular un recibo o cuaderno de fiado, junto al comerciante.',
  },
  {
    src: 'images/territorio/04-microtaller-tienda.jpg',
    alt: 'Microtaller de 15 minutos con la dueña de una tienda de barrio',
    titulo: 'Microtalleres de 15 minutos',
    lugar: 'Tienda de barrio, Soledad',
    sugerencia: 'Brigadista explicando algo en una hoja a la dueña de una tienda, detrás del mostrador.',
  },
  {
    src: 'images/territorio/05-brigada-gran-bazar.jpg',
    alt: 'Grupo de brigadistas universitarios con chalecos de Paso Firme recorriendo el Gran Bazar',
    titulo: 'Brigadas universitarias en la calle',
    lugar: 'Gran Bazar, Barranquilla',
    sugerencia: 'Grupo de 3 a 5 brigadistas con chaleco o camiseta del proyecto caminando entre los puestos.',
  },
  {
    src: 'images/territorio/06-comerciante-orgulloso.jpg',
    alt: 'Comerciante sonriente frente a su puesto de frutas',
    titulo: 'Negocios que avanzan con paso firme',
    lugar: 'Malambo, Atlántico',
    sugerencia: 'Retrato del comerciante orgulloso frente a su puesto, mirando a la cámara. Transmite dignidad.',
  },
];

export const FOTOS_EQUIPO: Foto[] = [
  {
    src: 'images/equipo/01-equipo-fundador.jpg',
    alt: 'Equipo fundador de Paso Firme reunido',
    titulo: 'El equipo fundador',
    lugar: 'Grupo 4 · UNAB · UNIMINUTO',
    sugerencia: 'Foto grupal del equipo, de pie y cercanos, preferiblemente en exteriores o en el Paseo Bolívar.',
  },
  {
    src: 'images/equipo/02-mentoria.jpg',
    alt: 'Consultor sénior acompaña a un practicante durante un diagnóstico',
    titulo: 'Mentoría sénior–júnior',
    lugar: 'Consultorio contable NAF',
    sugerencia: 'Un consultor sénior revisando con un estudiante un diagnóstico en papel o en el computador.',
  },
  {
    src: 'images/equipo/03-sesion-trabajo.jpg',
    alt: 'Sesión de trabajo del equipo con el lienzo del modelo de negocio',
    titulo: 'Pienso, pregunto, contrasto, decido',
    lugar: 'Sesión de diseño del modelo',
    sugerencia: 'Equipo trabajando frente a un tablero o lienzo con notas adhesivas (Business Model Canvas).',
  },
  {
    src: 'images/equipo/04-presentacion.jpg',
    alt: 'Presentación del proyecto Paso Firme ante aliados',
    titulo: 'Presentando el proyecto',
    lugar: 'UNIMINUTO, Barranquilla',
    sugerencia: 'Un integrante presentando el proyecto ante un público o un jurado académico.',
  },
];
