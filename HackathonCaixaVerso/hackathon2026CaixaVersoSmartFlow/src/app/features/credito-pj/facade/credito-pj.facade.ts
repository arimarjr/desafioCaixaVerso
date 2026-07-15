import { Injectable, signal, computed, inject } from '@angular/core';
import { ContratoApiService } from '../services/contrato-api.service';
import { GerarContratoResponse } from '../models/contrato.model';
import { FormatoDocumento } from '../types/contrato-status.type';

export interface GerarContratoDados {
  razaoSocial: string;
  cnpj: string;
  linhaCredito: string;
  valorSolicitado: number;
  prazoMeses: number;
  taxaMensal: number;
}

@Injectable({ providedIn: 'root' })
export class CreditoPjFacade {
  private readonly contratoApi = inject(ContratoApiService);

  private readonly _gerando = signal(false);
  private readonly _contrato = signal<GerarContratoResponse | null>(null);
  private readonly _erro = signal<string | null>(null);

  readonly contratoGerando = computed(() => this._gerando());
  readonly contratoGerado = computed(() => this._contrato());
  readonly erro = computed(() => this._erro());

  gerarContrato(dados: GerarContratoDados, formato: FormatoDocumento = 'PDF'): void {
    if (this._gerando()) return;
    this._gerando.set(true);
    this._erro.set(null);

    const simulacaoId = `SIM-${dados.cnpj.replace(/\D/g, '')}-${Date.now()}`;

    this.contratoApi.gerarContrato({ simulacaoId, formato, ...dados }).subscribe({
      next: (resposta) => {
        this._contrato.set(resposta);
        this._gerando.set(false);
      },
      error: () => {
        this._erro.set('Não foi possível gerar o contrato. Tente novamente.');
        this._gerando.set(false);
      },
    });
  }

  limparContrato(): void {
    this._contrato.set(null);
    this._erro.set(null);
  }
}
