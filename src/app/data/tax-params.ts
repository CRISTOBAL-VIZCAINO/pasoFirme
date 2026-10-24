/**
 * Parámetros de referencia para el simulador tributario PEDAGÓGICO.
 * No constituyen asesoría tributaria. Deben revisarse cada año con la normativa
 * vigente (UVT fijada por la DIAN, art. 908 del Estatuto Tributario para el RST
 * y el Estatuto Tributario Distrital de Barranquilla para el ICA).
 */
export const TAX_PARAMS = {
  anio: 2026,
  /** Valor de la UVT de referencia, en pesos. Verificar el valor oficial vigente. */
  uvt: 52_374,
  /** Ingresos brutos anuales desde los cuales una persona natural debe declarar renta. */
  topeDeclararRentaUvt: 1_400,
  /** Ingresos brutos anuales por debajo de los cuales se puede ser no responsable de IVA (con otros requisitos). */
  topeNoResponsableIvaUvt: 3_500,
  /** Primer rango del Régimen Simple: ingresos brutos anuales hasta este tope. */
  rstPrimerRangoUvt: 6_000,
  /** Sanción mínima de referencia por declaración, en UVT. */
  sancionMinimaUvt: 10,
} as const;

export interface ActividadRst {
  id: string;
  nombre: string;
  /** Tarifa de referencia del primer rango del RST (incluye el ICA consolidado), en %. */
  tarifaRst: number;
  /** Tarifa de referencia de ICA, en por mil (‰), para el escenario ordinario. */
  tarifaIcaPorMil: number;
}

/** Tarifas de referencia editables por el usuario dentro del simulador. */
export const ACTIVIDADES_RST: ActividadRst[] = [
  { id: 'tienda', nombre: 'Tienda de barrio o minimercado', tarifaRst: 1.2, tarifaIcaPorMil: 7 },
  { id: 'comercio', nombre: 'Venta al por menor (ropa, misceláneas, frutas, etc.)', tarifaRst: 1.6, tarifaIcaPorMil: 7 },
  { id: 'comidas', nombre: 'Comidas y bebidas preparadas', tarifaRst: 3.4, tarifaIcaPorMil: 8 },
  { id: 'servicios', nombre: 'Servicios técnicos o de reparación', tarifaRst: 1.6, tarifaIcaPorMil: 8 },
];
