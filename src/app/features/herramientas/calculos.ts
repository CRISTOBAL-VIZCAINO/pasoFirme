/**
 * Cálculos de las herramientas pedagógicas. Funciones puras, sin dependencias de
 * Angular, para poder probarlas de forma aislada.
 */

// ---------------------------------------------------------------------------
// Caja diaria: ¿cuánto gana de verdad el negocio?
// ---------------------------------------------------------------------------

export interface CajaEntrada {
  ventasDiarias: number;
  diasSemana: number;
  /** Porcentaje de cada venta que corresponde al costo de la mercancía (0–100). */
  costoMercanciaPct: number;
  gastosNegocioDiarios: number;
  retiroCasaDiario: number;
  cuotaDeudaDiaria: number;
}

export type Semaforo = 'verde' | 'amarillo' | 'rojo';

export interface CajaResultado {
  costoMercanciaDiario: number;
  gananciaBrutaDiaria: number;
  gananciaRealDiaria: number;
  /** Ganancia real menos lo que se lleva a la casa y la cuota de deuda. */
  balanceDiario: number;
  balanceSemanal: number;
  balanceMensual: number;
  margenRealPct: number;
  /** Sueldo diario sugerido: 80% de la ganancia real, dejando 20% para ahorro. */
  sueldoSugeridoDiario: number;
  ahorroSugeridoDiario: number;
  semaforo: Semaforo;
}

const SEMANAS_POR_MES = 4.33;

export function calcularCaja(e: CajaEntrada): CajaResultado {
  const ventas = Math.max(0, e.ventasDiarias);
  const costoPct = clamp(e.costoMercanciaPct, 0, 100) / 100;
  const costoMercanciaDiario = ventas * costoPct;
  const gananciaBrutaDiaria = ventas - costoMercanciaDiario;
  const gananciaRealDiaria = gananciaBrutaDiaria - Math.max(0, e.gastosNegocioDiarios);
  const balanceDiario = gananciaRealDiaria - Math.max(0, e.retiroCasaDiario) - Math.max(0, e.cuotaDeudaDiaria);
  const dias = clamp(e.diasSemana, 1, 7);
  const balanceSemanal = balanceDiario * dias;

  const disponible = Math.max(0, gananciaRealDiaria - Math.max(0, e.cuotaDeudaDiaria));
  const sueldoSugeridoDiario = disponible * 0.8;

  let semaforo: Semaforo = 'verde';
  if (balanceDiario < 0) {
    semaforo = 'rojo';
  } else if (gananciaRealDiaria > 0 && balanceDiario < gananciaRealDiaria * 0.1) {
    semaforo = 'amarillo';
  }

  return {
    costoMercanciaDiario,
    gananciaBrutaDiaria,
    gananciaRealDiaria,
    balanceDiario,
    balanceSemanal,
    balanceMensual: balanceSemanal * SEMANAS_POR_MES,
    margenRealPct: ventas > 0 ? (gananciaRealDiaria / ventas) * 100 : 0,
    sueldoSugeridoDiario,
    ahorroSugeridoDiario: disponible - sueldoSugeridoDiario,
    semaforo,
  };
}

// ---------------------------------------------------------------------------
// Gota a gota vs. microcrédito formal
// ---------------------------------------------------------------------------

export interface CreditoEntrada {
  monto: number;
  plazoMeses: number;
  /** Tasa mensual del préstamo informal, en %. Se cobra sobre el capital inicial. */
  tasaInformalMensual: number;
  /** Tasa mensual del microcrédito formal, en %. Cuota fija (sistema francés). */
  tasaFormalMensual: number;
  /** Días de cobro por mes del gota a gota. */
  diasCobroMes: number;
}

export interface CreditoResultado {
  interesesInformal: number;
  totalInformal: number;
  cuotaDiariaInformal: number;
  cuotaMensualFormal: number;
  interesesFormal: number;
  totalFormal: number;
  ahorro: number;
  /** Cuántas veces más intereses se pagan en el gota a gota. */
  veces: number;
}

export function compararCredito(e: CreditoEntrada): CreditoResultado {
  const monto = Math.max(0, e.monto);
  const n = Math.max(1, Math.round(e.plazoMeses));
  const ti = Math.max(0, e.tasaInformalMensual) / 100;
  const tf = Math.max(0, e.tasaFormalMensual) / 100;

  const interesesInformal = monto * ti * n;
  const totalInformal = monto + interesesInformal;
  const cuotaDiariaInformal = totalInformal / (n * Math.max(1, e.diasCobroMes));

  const cuotaMensualFormal = cuotaFija(monto, tf, n);
  const totalFormal = cuotaMensualFormal * n;
  const interesesFormal = totalFormal - monto;

  return {
    interesesInformal,
    totalInformal,
    cuotaDiariaInformal,
    cuotaMensualFormal,
    interesesFormal,
    totalFormal,
    ahorro: interesesInformal - interesesFormal,
    veces: interesesFormal > 0 ? interesesInformal / interesesFormal : 0,
  };
}

/** Cuota fija de un crédito con amortización francesa. */
export function cuotaFija(monto: number, tasaMensual: number, meses: number): number {
  if (meses <= 0) {
    return 0;
  }
  if (tasaMensual === 0) {
    return monto / meses;
  }
  const factor = Math.pow(1 + tasaMensual, meses);
  return (monto * tasaMensual * factor) / (factor - 1);
}

// ---------------------------------------------------------------------------
// Simulador tributario pedagógico
// ---------------------------------------------------------------------------

export interface TributoEntrada {
  ventasMensuales: number;
  uvt: number;
  tarifaRstPct: number;
  tarifaIcaPorMil: number;
  topeDeclararRentaUvt: number;
  topeNoResponsableIvaUvt: number;
  rstPrimerRangoUvt: number;
  sancionMinimaUvt: number;
}

export interface TributoResultado {
  ingresosAnuales: number;
  ingresosUvt: number;
  rstAnual: number;
  rstBimestral: number;
  icaAnual: number;
  sancionMinima: number;
  debeDeclararRenta: boolean;
  puedeSerNoResponsableIva: boolean;
  dentroPrimerRangoRst: boolean;
}

export function simularTributos(e: TributoEntrada): TributoResultado {
  const ingresosAnuales = Math.max(0, e.ventasMensuales) * 12;
  const uvt = Math.max(1, e.uvt);
  const ingresosUvt = ingresosAnuales / uvt;
  const rstAnual = ingresosAnuales * (Math.max(0, e.tarifaRstPct) / 100);

  return {
    ingresosAnuales,
    ingresosUvt,
    rstAnual,
    rstBimestral: rstAnual / 6,
    icaAnual: ingresosAnuales * (Math.max(0, e.tarifaIcaPorMil) / 1000),
    sancionMinima: e.sancionMinimaUvt * uvt,
    debeDeclararRenta: ingresosUvt >= e.topeDeclararRentaUvt,
    puedeSerNoResponsableIva: ingresosUvt < e.topeNoResponsableIvaUvt,
    dentroPrimerRangoRst: ingresosUvt <= e.rstPrimerRangoUvt,
  };
}

// ---------------------------------------------------------------------------
// Autodiagnóstico
// ---------------------------------------------------------------------------

export type Dimension = 'caja' | 'credito' | 'tributario';
export type Respuesta = 'si' | 'aveces' | 'no';

export interface PreguntaDiagnostico {
  id: string;
  texto: string;
  dimension: Dimension;
  /** Si es true, responder «sí» es una señal de riesgo. */
  invertida?: boolean;
}

const PUNTOS: Record<Respuesta, number> = { si: 2, aveces: 1, no: 0 };

export type Nivel = 'firme' | 'en-camino' | 'en-riesgo';

export interface ResultadoDimension {
  dimension: Dimension;
  porcentaje: number;
  nivel: Nivel;
}

export function evaluarDiagnostico(
  preguntas: PreguntaDiagnostico[],
  respuestas: Record<string, Respuesta | undefined>,
): { total: number; nivel: Nivel; dimensiones: ResultadoDimension[] } {
  const acumulado = new Map<Dimension, { puntos: number; max: number }>();

  for (const p of preguntas) {
    const r = respuestas[p.id];
    const actual = acumulado.get(p.dimension) ?? { puntos: 0, max: 0 };
    actual.max += 2;
    if (r) {
      actual.puntos += p.invertida ? 2 - PUNTOS[r] : PUNTOS[r];
    }
    acumulado.set(p.dimension, actual);
  }

  const dimensiones = [...acumulado.entries()].map(([dimension, { puntos, max }]) => {
    const porcentaje = max > 0 ? Math.round((puntos / max) * 100) : 0;
    return { dimension, porcentaje, nivel: nivelPara(porcentaje) };
  });

  const puntos = [...acumulado.values()].reduce((s, d) => s + d.puntos, 0);
  const max = [...acumulado.values()].reduce((s, d) => s + d.max, 0);
  const total = max > 0 ? Math.round((puntos / max) * 100) : 0;

  return { total, nivel: nivelPara(total), dimensiones };
}

function nivelPara(porcentaje: number): Nivel {
  if (porcentaje >= 70) {
    return 'firme';
  }
  return porcentaje >= 40 ? 'en-camino' : 'en-riesgo';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
