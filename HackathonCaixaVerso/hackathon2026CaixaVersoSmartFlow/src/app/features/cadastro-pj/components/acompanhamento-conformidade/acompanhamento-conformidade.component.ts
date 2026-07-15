import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DscAlertComponent } from 'sidsc-components/dsc-alert';
import { EventoConformidade } from '../../models/evento-conformidade.model';

@Component({
  selector: 'app-acompanhamento-conformidade',
  standalone: true,
  imports: [CommonModule, DscButtonComponent, DscAlertComponent],
  templateUrl: './acompanhamento-conformidade.component.html',
  styleUrl: './acompanhamento-conformidade.component.scss',
})
export class AcompanhamentoConformidadeComponent {
  // Estado simulado para demonstração do MVP
  readonly statusAtual = signal<'aguardando' | 'em-analise' | 'pendencia' | 'aprovado' | 'reprovado'>('aguardando');
  readonly posicaoFila = signal(3);
  readonly dataEnvio = signal('18/05/2026 09:45');
  readonly pendencias = signal<string[]>([]);

  readonly historico: EventoConformidade[] = [
    { data: '18/05/2026 09:45', descricao: 'Operação enviada para análise de conformidade.', usuario: 'Arimar Silva', tipo: 'info' },
    { data: '18/05/2026 10:12', descricao: 'Operação recebida pela fila de conformidade. Posição: 3.', usuario: 'Sistema', tipo: 'info' },
  ];

  simularEnvio(): void {
    this.statusAtual.set('em-analise');
    this.posicaoFila.set(1);
    this.historico.push({
      data: new Date().toLocaleString('pt-BR'),
      descricao: 'Operação em análise pelo analista de conformidade.',
      usuario: 'Sistema',
      tipo: 'info',
    });
  }

  simularPendencia(): void {
    this.statusAtual.set('pendencia');
    this.pendencias.set([
      'Contrato social desatualizado — Último prazo: 2021.',
      'Certidão de Regularidade do FGTS com prazo expirado.',
      'Documento de identidade do sócio João Souza com validade vencida.',
    ]);
    this.historico.push({
      data: new Date().toLocaleString('pt-BR'),
      descricao: 'Conformidade identificou pendências. Operação devolvida para regularização.',
      usuario: 'Ana Lima (Conformidade)',
      tipo: 'pendencia',
    });
  }

  simularAprovacao(): void {
    this.statusAtual.set('aprovado');
    this.pendencias.set([]);
    this.historico.push({
      data: new Date().toLocaleString('pt-BR'),
      descricao: 'Operação aprovada pela conformidade. Prosseguir para geração do contrato.',
      usuario: 'Ana Lima (Conformidade)',
      tipo: 'aprovado',
    });
  }

  get corStatus(): string {
    const map: Record<string, string> = {
      aguardando: 'info',
      'em-analise': 'warning',
      pendencia: 'danger',
      aprovado: 'success',
      reprovado: 'danger',
    };
    return map[this.statusAtual()] ?? 'info';
  }

  get textoStatus(): string {
    const map: Record<string, string> = {
      aguardando: 'Aguardando envio para conformidade',
      'em-analise': 'Em análise pela conformidade',
      pendencia: 'Pendências identificadas — regularização necessária',
      aprovado: 'Aprovado pela conformidade',
      reprovado: 'Reprovado pela conformidade',
    };
    return map[this.statusAtual()] ?? '';
  }
}
