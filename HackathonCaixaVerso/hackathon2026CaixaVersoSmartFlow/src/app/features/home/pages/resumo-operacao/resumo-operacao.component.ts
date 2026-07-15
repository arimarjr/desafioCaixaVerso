import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { GarantiaResumo } from '../../models/garantia-resumo.model';

@Component({
  selector: 'app-resumo-operacao',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './resumo-operacao.component.html',
  styleUrl: './resumo-operacao.component.scss',
})
export class ResumoOperacaoComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() vm: any = null;
  @Input() linhaCredito = '';
  @Input() valorSolicitado = 0;
  @Input() prazoMeses = 0;
  @Input() taxaMensal = 0;
  @Input() carenciaMeses = 0;
  @Input() garantias: GarantiaResumo[] = [];

  @Output() voltar       = new EventEmitter<void>();
  @Output() gerarMinuta  = new EventEmitter<void>();

  readonly dataProposta = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  get valorParcela(): number {
    if (!this.prazoMeses || !this.taxaMensal) return 0;
    const taxa = this.taxaMensal / 100;
    const n    = this.prazoMeses;
    return (this.valorSolicitado * taxa * Math.pow(1 + taxa, n)) / (Math.pow(1 + taxa, n) - 1);
  }

  /** IOF: 0,38% (flat) + 0,0082% por dia × (prazo × 30 dias) */
  get iof(): number {
    return this.valorSolicitado * (0.0038 + 0.000082 * this.prazoMeses * 30);
  }

  /** TAC: 1,5% sobre o valor solicitado */
  get tac(): number {
    return this.valorSolicitado * 0.015;
  }

  get valorLiberado(): number {
    return this.valorSolicitado - this.iof - this.tac;
  }

  get valorTotalPago(): number {
    return this.valorParcela * this.prazoMeses;
  }

  get totalJuros(): number {
    return this.valorTotalPago - this.valorSolicitado;
  }

  get totalGarantias(): number {
    return this.garantias.reduce((sum, g) => sum + g.valor, 0);
  }
}
