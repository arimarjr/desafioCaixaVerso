import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { OperacaoResumo } from '../../models/operacao-resumo.model';

@Component({
  selector: 'app-oportunidades-da-carteira',
  standalone: true,
  imports: [CommonModule, DscButtonComponent],
  templateUrl: './oportunidades-da-carteira.component.html',
  styleUrl: './oportunidades-da-carteira.component.scss'
})
export class OportunidadesDaCarteiraComponent {
  readonly operacoes = signal<OperacaoResumo[]>([
    { id: '1', cnpj: '12345678000195', razaoSocial: 'ABC Soluções Tecnologia Ltda', linhaCredito: 'Capital de Giro', etapa: 'Conformidade', status: 'aguardando-conformidade', dataAtualizacao: '18/05/2026' },
    { id: '2', cnpj: '98765432000100', razaoSocial: 'Construção XYZ EPP', linhaCredito: 'Financiamento de Equipamentos', etapa: 'Cadastro', status: 'em-andamento', dataAtualizacao: '17/05/2026' },
    { id: '3', cnpj: '11223344000155', razaoSocial: 'Tech Solutions ME', linhaCredito: 'PRONAMPE', etapa: 'Contrato e Assinatura', status: 'pronto-contrato', dataAtualizacao: '16/05/2026' },
    { id: '4', cnpj: '55667788000177', razaoSocial: 'Agro Produções Ltda', linhaCredito: 'FNO / FNE / FCO', etapa: 'Conformidade', status: 'com-pendencia', dataAtualizacao: '15/05/2026' },
    { id: '5', cnpj: '33445566000133', razaoSocial: 'Saúde & Bem Estar Clínica', linhaCredito: 'Capital de Giro', etapa: 'Simulação', status: 'em-andamento', dataAtualizacao: '14/05/2026' },
    { id: '6', cnpj: '77889900000144', razaoSocial: 'Distribuidora Sul Norte Ltda', linhaCredito: 'Crédito Imobiliário PJ', etapa: 'Análise de Crédito', status: 'aguardando-conformidade', dataAtualizacao: '13/05/2026' },
  ]);

  readonly filtroAtivo = signal<string>('todos');

  readonly contadores = {
    emAndamento: () => this.operacoes().filter(o => o.status === 'em-andamento').length,
    aguardandoConformidade: () => this.operacoes().filter(o => o.status === 'aguardando-conformidade').length,
    comPendencia: () => this.operacoes().filter(o => o.status === 'com-pendencia').length,
    prontoContrato: () => this.operacoes().filter(o => o.status === 'pronto-contrato').length,
  };

  get operacoesFiltradas(): OperacaoResumo[] {
    const f = this.filtroAtivo();
    if (f === 'todos') return this.operacoes();
    return this.operacoes().filter(o => o.status === f);
  }

  constructor(private readonly _router: Router) {}

  aplicarFiltro(filtro: string): void {
    this.filtroAtivo.set(filtro);
  }

  abrirOperacao(cnpj: string): void {
    this._router.navigate(['/cadastro-pj', cnpj]);
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'em-andamento': 'Em Andamento',
      'aguardando-conformidade': 'Aguardando Conformidade',
      'com-pendencia': 'Com Pendência',
      'pronto-contrato': 'Pronto p/ Contrato',
      'finalizado': 'Finalizado',
    };
    return map[status] ?? status;
  }
}

