// src/services/simulacao.service.js
export async function simularInvestimento({ valor, prazoMeses, tipo }) {
  const taxasAnuais = {
    CDB: 0.12,
    Fundo: 0.18,
    Tesouro: 0.10
  };
  const taxaAnual = taxasAnuais[tipo] ?? 0.12;
  const taxaMensal = Math.pow(1 + taxaAnual, 1/12) - 1;
  const valorFinal = +(valor * Math.pow(1 + taxaMensal, prazoMeses)).toFixed(2);

  return {
    valorFinal,
    rentabilidade: taxaAnual,
    detalhes: `Simulação baseada em ${tipo} com taxa anual estimada de ${ (taxaAnual*100).toFixed(2) }%.`
  };
}
