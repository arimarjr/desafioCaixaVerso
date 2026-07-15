import { CapitalGiroSimulacaoService } from './capital-giro-simulacao.service';
import { SimulacaoCapitalGiroInput } from './capital-giro-simulacao.models';

describe('CapitalGiroSimulacaoService', () => {
  let service: CapitalGiroSimulacaoService;

  beforeEach(() => {
    service = new CapitalGiroSimulacaoService();
  });

  // ── calcularSimulacao — taxa positiva ─────────────────────────────────────

  it('deve calcular parcela com taxa mensal positiva', () => {
    const input: SimulacaoCapitalGiroInput = {
      valorSolicitado: 10000,
      prazoMeses: 12,
      taxaMensalPercentual: 2,
    };

    const resultado = service.calcularSimulacao(input);
    expect(resultado.valorParcela).toBeGreaterThan(0);
  });

  it('deve calcular corretamente: 10000 / 12 meses / 2% ao mês', () => {
    const input: SimulacaoCapitalGiroInput = {
      valorSolicitado: 10000,
      prazoMeses: 12,
      taxaMensalPercentual: 2,
    };

    const resultado = service.calcularSimulacao(input);
    // Parcela Price com 2% ao mês em 12 meses para R$10.000 ≈ R$945,60
    expect(resultado.valorParcela).toBeCloseTo(945.60, 0);
  });

  it('valorTotal deve ser valorParcela * prazoMeses', () => {
    const input: SimulacaoCapitalGiroInput = {
      valorSolicitado: 10000,
      prazoMeses: 12,
      taxaMensalPercentual: 2,
    };

    const resultado = service.calcularSimulacao(input);
    expect(resultado.valorTotal).toBeCloseTo(resultado.valorParcela * 12, 0);
  });

  it('totalJuros deve ser valorTotal - valorSolicitado', () => {
    const input: SimulacaoCapitalGiroInput = {
      valorSolicitado: 10000,
      prazoMeses: 12,
      taxaMensalPercentual: 2,
    };

    const resultado = service.calcularSimulacao(input);
    expect(resultado.totalJuros).toBeCloseTo(resultado.valorTotal - 10000, 0);
  });

  it('deve preservar o valorSolicitado no resultado', () => {
    const input: SimulacaoCapitalGiroInput = {
      valorSolicitado: 50000,
      prazoMeses: 24,
      taxaMensalPercentual: 1.5,
    };

    const resultado = service.calcularSimulacao(input);
    expect(resultado.valorSolicitado).toBe(50000);
  });

  // ── calcularSimulacao — taxa zero ─────────────────────────────────────────

  it('deve calcular parcela sem juros (taxa zero)', () => {
    const input: SimulacaoCapitalGiroInput = {
      valorSolicitado: 12000,
      prazoMeses: 12,
      taxaMensalPercentual: 0,
    };

    const resultado = service.calcularSimulacao(input);
    expect(resultado.valorParcela).toBeCloseTo(1000, 0);
  });

  it('totalJuros deve ser 0 quando taxa é zero', () => {
    const input: SimulacaoCapitalGiroInput = {
      valorSolicitado: 12000,
      prazoMeses: 12,
      taxaMensalPercentual: 0,
    };

    const resultado = service.calcularSimulacao(input);
    expect(resultado.totalJuros).toBeCloseTo(0, 0);
  });

  // ── prazo de 1 mês ────────────────────────────────────────────────────────

  it('deve calcular corretamente para prazo de 1 mês', () => {
    const input: SimulacaoCapitalGiroInput = {
      valorSolicitado: 10000,
      prazoMeses: 1,
      taxaMensalPercentual: 2,
    };

    const resultado = service.calcularSimulacao(input);
    expect(resultado.valorParcela).toBeCloseTo(10200, 0);
    expect(resultado.prazoMeses ?? input.prazoMeses).toBe(1);
  });

  // ── Encargos fixos ────────────────────────────────────────────────────────

  it('cetMensal deve ser 1.15', () => {
    const resultado = service.calcularSimulacao({ valorSolicitado: 10000, prazoMeses: 12, taxaMensalPercentual: 2 });
    expect(resultado.cetMensal).toBe(1.15);
  });

  it('cetAnual deve ser 14.71', () => {
    const resultado = service.calcularSimulacao({ valorSolicitado: 10000, prazoMeses: 12, taxaMensalPercentual: 2 });
    expect(resultado.cetAnual).toBe(14.71);
  });

  it('valorIof deve ser 3332', () => {
    const resultado = service.calcularSimulacao({ valorSolicitado: 10000, prazoMeses: 12, taxaMensalPercentual: 2 });
    expect(resultado.valorIof).toBe(3332);
  });

  it('valorTac deve ser 1.5% do valor solicitado', () => {
    const resultado = service.calcularSimulacao({ valorSolicitado: 10000, prazoMeses: 12, taxaMensalPercentual: 2 });
    expect(resultado.valorTac).toBeCloseTo(150, 0);
  });

  it('valorLiberado deve ser valorSolicitado - IOF - TAC', () => {
    const resultado = service.calcularSimulacao({ valorSolicitado: 10000, prazoMeses: 12, taxaMensalPercentual: 2 });
    const esperado = 10000 - 3332 - 150;
    expect(resultado.valorLiberado).toBeCloseTo(esperado, 0);
  });

  // ── Evolução do saldo devedor ─────────────────────────────────────────────

  it('evolucaoSaldoDevedor deve ter o mesmo número de parcelas que prazoMeses', () => {
    const input: SimulacaoCapitalGiroInput = { valorSolicitado: 10000, prazoMeses: 12, taxaMensalPercentual: 2 };
    const resultado = service.calcularSimulacao(input);
    expect(resultado.evolucaoSaldoDevedor).toHaveLength(12);
  });

  it('primeira parcela da evolução deve ser a parcela 1', () => {
    const input: SimulacaoCapitalGiroInput = { valorSolicitado: 10000, prazoMeses: 6, taxaMensalPercentual: 2 };
    const resultado = service.calcularSimulacao(input);
    expect(resultado.evolucaoSaldoDevedor[0].parcela).toBe(1);
  });

  it('última parcela da evolução deve ter saldo final próximo de zero', () => {
    const input: SimulacaoCapitalGiroInput = { valorSolicitado: 10000, prazoMeses: 12, taxaMensalPercentual: 2 };
    const resultado = service.calcularSimulacao(input);
    const ultimaParcela = resultado.evolucaoSaldoDevedor[11];
    expect(ultimaParcela.saldoFinal).toBeGreaterThanOrEqual(0);
    expect(ultimaParcela.saldoFinal).toBeLessThan(50); // pequeno resíduo de arredondamento
  });

  it('saldoInicial da primeira parcela deve ser igual ao valorSolicitado', () => {
    const input: SimulacaoCapitalGiroInput = { valorSolicitado: 10000, prazoMeses: 12, taxaMensalPercentual: 2 };
    const resultado = service.calcularSimulacao(input);
    expect(resultado.evolucaoSaldoDevedor[0].saldoInicial).toBe(10000);
  });

  it('cada item da evolução deve ter: parcela, saldoInicial, juros, amortizacao, valorParcela, saldoFinal', () => {
    const input: SimulacaoCapitalGiroInput = { valorSolicitado: 10000, prazoMeses: 3, taxaMensalPercentual: 2 };
    const resultado = service.calcularSimulacao(input);
    resultado.evolucaoSaldoDevedor.forEach(item => {
      expect(item).toHaveProperty('parcela');
      expect(item).toHaveProperty('saldoInicial');
      expect(item).toHaveProperty('juros');
      expect(item).toHaveProperty('amortizacao');
      expect(item).toHaveProperty('valorParcela');
      expect(item).toHaveProperty('saldoFinal');
    });
  });

  // ── Arredondamento ────────────────────────────────────────────────────────

  it('resultado deve ser arredondado a 2 casas decimais', () => {
    const input: SimulacaoCapitalGiroInput = { valorSolicitado: 10000, prazoMeses: 7, taxaMensalPercentual: 1.23 };
    const resultado = service.calcularSimulacao(input);
    const parcela = resultado.valorParcela;
    expect(parcela).toBe(Math.round(parcela * 100) / 100);
  });
});
