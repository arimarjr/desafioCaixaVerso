import { Injectable } from '@angular/core';
import {
  EvolucaoSaldoDevedorItem,
  SimulacaoCapitalGiroInput,
  SimulacaoCapitalGiroResultado,
} from './capital-giro-simulacao.models';

@Injectable({ providedIn: 'root' })
export class CapitalGiroSimulacaoService {
  calcularSimulacao(input: SimulacaoCapitalGiroInput): SimulacaoCapitalGiroResultado {
    const { valorSolicitado, prazoMeses, taxaMensalPercentual } = input;
    const taxa = taxaMensalPercentual / 100;

    let parcela: number;
    if (taxa > 0) {
      const fator = Math.pow(1 + taxa, prazoMeses);
      parcela = valorSolicitado * (taxa * fator) / (fator - 1);
    } else {
      parcela = valorSolicitado / prazoMeses;
    }

    const valorParcela = this._arredondar(parcela);
    const valorTotal   = this._arredondar(valorParcela * prazoMeses);
    const totalJuros   = this._arredondar(valorTotal - valorSolicitado);

    // Taxas e encargos (valores demonstrativos conforme especificação)
    const cetMensal    = 1.15;
    const cetAnual     = 14.71;
    const valorIof     = 3332;
    const valorTac     = this._arredondar(valorSolicitado * 0.015);
    const valorLiberado = this._arredondar(valorSolicitado - valorIof - valorTac);

    const evolucaoSaldoDevedor = this._gerarEvolucao(
      valorSolicitado, prazoMeses, taxa, valorParcela,
    );

    return {
      valorParcela,
      valorTotal,
      totalJuros,
      valorSolicitado,
      cetMensal,
      cetAnual,
      valorIof,
      valorTac,
      valorLiberado,
      evolucaoSaldoDevedor,
    };
  }

  private _gerarEvolucao(
    valorSolicitado: number,
    prazoMeses: number,
    taxa: number,
    valorParcela: number,
  ): EvolucaoSaldoDevedorItem[] {
    const evolucao: EvolucaoSaldoDevedorItem[] = [];
    let saldoAtual = valorSolicitado;

    for (let i = 1; i <= prazoMeses; i++) {
      const saldoInicial  = this._arredondar(saldoAtual);
      const juros         = this._arredondar(saldoInicial * taxa);
      const amortizacao   = this._arredondar(valorParcela - juros);
      const saldoFinal    = this._arredondar(Math.max(0, saldoInicial - amortizacao));

      evolucao.push({ parcela: i, saldoInicial, juros, amortizacao, valorParcela, saldoFinal });
      saldoAtual = saldoFinal;
    }

    return evolucao;
  }

  private _arredondar(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
