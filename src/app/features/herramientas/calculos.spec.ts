import { calcularCaja, compararCredito, cuotaFija, evaluarDiagnostico, simularTributos } from './calculos';

describe('calcularCaja', () => {
  it('calcula la ganancia real y el balance diario', () => {
    const r = calcularCaja({
      ventasDiarias: 230_000,
      diasSemana: 6,
      costoMercanciaPct: 40,
      gastosNegocioDiarios: 10_000,
      retiroCasaDiario: 100_000,
      cuotaDeudaDiaria: 0,
    });
    expect(r.gananciaBrutaDiaria).toBe(138_000);
    expect(r.gananciaRealDiaria).toBe(128_000);
    expect(r.balanceDiario).toBe(28_000);
    expect(r.balanceSemanal).toBe(168_000);
    expect(r.semaforo).toBe('verde');
  });

  it('marca rojo cuando lo que sale para la casa supera la ganancia', () => {
    const r = calcularCaja({
      ventasDiarias: 150_000,
      diasSemana: 6,
      costoMercanciaPct: 50,
      gastosNegocioDiarios: 5_000,
      retiroCasaDiario: 80_000,
      cuotaDeudaDiaria: 12_000,
    });
    expect(r.balanceDiario).toBe(-22_000);
    expect(r.semaforo).toBe('rojo');
  });
});

describe('compararCredito', () => {
  it('compara intereses de gota a gota frente a microcrédito', () => {
    const r = compararCredito({ monto: 500_000, plazoMeses: 1, tasaInformalMensual: 20, tasaFormalMensual: 2, diasCobroMes: 25 });
    expect(r.interesesInformal).toBe(100_000);
    expect(r.cuotaDiariaInformal).toBe(24_000);
    expect(r.interesesFormal).toBeCloseTo(10_000, 0);
    expect(r.ahorro).toBeCloseTo(90_000, 0);
  });

  it('calcula la cuota fija con amortización francesa', () => {
    expect(cuotaFija(1_000_000, 0.02, 12)).toBeCloseTo(94_559.6, 0);
    expect(cuotaFija(1_200_000, 0, 12)).toBe(100_000);
  });
});

describe('simularTributos', () => {
  it('aplica tarifas y topes en UVT', () => {
    const r = simularTributos({
      ventasMensuales: 5_000_000,
      uvt: 50_000,
      tarifaRstPct: 1.2,
      tarifaIcaPorMil: 7,
      topeDeclararRentaUvt: 1_400,
      topeNoResponsableIvaUvt: 3_500,
      rstPrimerRangoUvt: 6_000,
      sancionMinimaUvt: 10,
    });
    expect(r.ingresosAnuales).toBe(60_000_000);
    expect(r.ingresosUvt).toBe(1_200);
    expect(r.rstAnual).toBe(720_000);
    expect(r.icaAnual).toBe(420_000);
    expect(r.sancionMinima).toBe(500_000);
    expect(r.debeDeclararRenta).toBe(false);
    expect(r.puedeSerNoResponsableIva).toBe(true);
  });
});

describe('evaluarDiagnostico', () => {
  it('invierte el puntaje de las preguntas de riesgo', () => {
    const preguntas = [
      { id: 'a', texto: '', dimension: 'caja' as const },
      { id: 'b', texto: '', dimension: 'credito' as const, invertida: true },
    ];
    const r = evaluarDiagnostico(preguntas, { a: 'si', b: 'si' });
    expect(r.dimensiones.find((d) => d.dimension === 'caja')?.porcentaje).toBe(100);
    expect(r.dimensiones.find((d) => d.dimension === 'credito')?.porcentaje).toBe(0);
    expect(r.total).toBe(50);
    expect(r.nivel).toBe('en-camino');
  });
});
