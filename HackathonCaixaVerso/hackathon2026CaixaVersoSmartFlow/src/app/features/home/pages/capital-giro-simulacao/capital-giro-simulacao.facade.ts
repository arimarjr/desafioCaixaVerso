import { Injectable, signal } from '@angular/core';
import {
  SimulacaoCapitalGiroInput,
  SimulacaoCapitalGiroResultado,
} from './capital-giro-simulacao.models';
import { CapitalGiroSimulacaoService } from './capital-giro-simulacao.service';

@Injectable()
export class CapitalGiroSimulacaoFacade {
  private readonly _service = new CapitalGiroSimulacaoService();

  readonly capitalGiroSelecionado = signal(false);
  readonly simulacaoCalculada     = signal(false);
  readonly resultado               = signal<SimulacaoCapitalGiroResultado | null>(null);

  selecionarCapitalGiro(selecionado: boolean): void {
    this.capitalGiroSelecionado.set(selecionado);
    if (!selecionado) {
      this.simulacaoCalculada.set(false);
      this.resultado.set(null);
    }
  }

  calcular(input: SimulacaoCapitalGiroInput): void {
    const resultado = this._service.calcularSimulacao(input);
    this.resultado.set(resultado);
    this.simulacaoCalculada.set(true);
  }

  limparResultado(): void {
    this.resultado.set(null);
    this.simulacaoCalculada.set(false);
  }

  resetarFluxo(): void {
    this.capitalGiroSelecionado.set(false);
    this.simulacaoCalculada.set(false);
    this.resultado.set(null);
  }
}
