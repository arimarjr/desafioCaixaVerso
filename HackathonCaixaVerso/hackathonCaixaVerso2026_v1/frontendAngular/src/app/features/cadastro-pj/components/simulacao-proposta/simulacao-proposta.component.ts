import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';

interface OpcaoFinanciamento {
  prazo: number;
  valorLiquido: number;
  prestacao: number;
  valorBruto: number;
  tac: number;
  prestamista: number;
  iof: number;
  taxa: number;
  cetMensal: number;
  cetAnual: number;
  gravame: number;
  dataSimulacao: string;
  dataVencimento: string;
}

@Component({
  selector: 'app-simulacao-proposta',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  templateUrl: './simulacao-proposta.component.html',
  styleUrl: './simulacao-proposta.component.scss',
})
export class SimulacaoPropostaComponent {
  @Input() limiteDisponivel: number | null = null;

  constructor(readonly facade: CadastroPjFacade) {}

  get empresa() { return this.facade.empresa(); }

  private _pmt(taxa: number, n: number, pv: number): number {
    if (taxa === 0) return pv / n;
    return pv * taxa * Math.pow(1 + taxa, n) / (Math.pow(1 + taxa, n) - 1);
  }

  private _opcao(prazo: number, valorLiquido: number): OpcaoFinanciamento {
    const taxa      = 0.0119;
    const tac       = valorLiquido * 0.015;
    const iof       = valorLiquido * 0.0150;
    const prest     = valorLiquido * 0.000348 * prazo;
    const bruto     = valorLiquido + tac + prest + iof;
    const prestacao = this._pmt(taxa, prazo, bruto);
    const hoje      = new Date();
    const venc      = new Date(hoje);
    venc.setDate(venc.getDate() + 30);
    const mes       = String(venc.getMonth() + 1).padStart(2, '0');
    const ano       = venc.getFullYear();
    return {
      prazo,
      valorLiquido,
      prestacao,
      valorBruto:    bruto,
      tac,
      prestamista:   prest,
      iof,
      taxa:          taxa * 100,
      cetMensal:     1.45,
      cetAnual:      18.97,
      gravame:       bruto * 0.125,
      dataSimulacao: hoje.toLocaleDateString('pt-BR'),
      dataVencimento: `${mes}/${ano}`,
    };
  }

  get sim48(): OpcaoFinanciamento | null {
    return this.limiteDisponivel ? this._opcao(48, this.limiteDisponivel) : null;
  }

  get sim36(): OpcaoFinanciamento | null {
    return this.limiteDisponivel ? this._opcao(36, this.limiteDisponivel) : null;
  }

  imprimir(): void {
    document.body.classList.add('imprimindo-simulacao');
    window.addEventListener('afterprint', () => {
      document.body.classList.remove('imprimindo-simulacao');
    }, { once: true });
    window.print();
  }
}
