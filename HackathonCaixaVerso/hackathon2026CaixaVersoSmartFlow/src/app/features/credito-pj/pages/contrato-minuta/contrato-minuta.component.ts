import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CreditoPjFacade } from '../../facade/credito-pj.facade';

type AssinaturaStatus = 'idle' | 'aguardando' | 'assinado';

@Component({
  selector: 'app-contrato-minuta',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './contrato-minuta.component.html',
  styleUrl: './contrato-minuta.component.scss',
})
export class ContratoMinutaComponent {
  private readonly facade = inject(CreditoPjFacade);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() vm: any = null;
  @Input() linhaCredito = '';
  @Input() valorSolicitado = 0;
  @Input() prazoMeses = 0;
  @Input() taxaMensal = 0;
  @Input() carenciaMeses = 0;

  @Output() voltar = new EventEmitter<void>();

  readonly dataAtual = new Date();

  // --- Façade state ---
  readonly contratoGerando = this.facade.contratoGerando;
  readonly contratoGerado  = this.facade.contratoGerado;
  readonly erro            = this.facade.erro;

  // --- Assinatura digital ---
  private readonly _assinaturaModalAberta = signal(false);
  private readonly _assinaturaStatus      = signal<AssinaturaStatus>('idle');

  readonly assinaturaModalAberta = computed(() => this._assinaturaModalAberta());
  readonly assinaturaStatus      = computed(() => this._assinaturaStatus());

  // --- Computadas ---
  get dataVencimento(): Date {
    const d = new Date();
    d.setMonth(d.getMonth() + this.prazoMeses);
    return d;
  }

  get valorParcela(): number {
    if (!this.prazoMeses || !this.taxaMensal) return 0;
    const taxa = this.taxaMensal / 100;
    const n    = this.prazoMeses;
    return (this.valorSolicitado * taxa * Math.pow(1 + taxa, n)) / (Math.pow(1 + taxa, n) - 1);
  }

  get valorTotal(): number {
    return this.valorParcela * this.prazoMeses;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get socios(): string {
    if (!this.vm?.socios?.length) return '—';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.vm.socios.map((s: any) => `${s.nome} (CPF: ${s.cpf})`).join('; ');
  }

  // --- Ações ---
  gerarContrato(): void {
    if (!this.vm) return;
    this.facade.gerarContrato({
      razaoSocial:    this.vm.razaoSocial,
      cnpj:           this.vm.cnpj,
      linhaCredito:   this.linhaCredito,
      valorSolicitado: this.valorSolicitado,
      prazoMeses:     this.prazoMeses,
      taxaMensal:     this.taxaMensal,
    });
  }

  imprimirContrato(): void {
    const ccbEl = document.getElementById('ccb-para-impressao');
    if (!ccbEl) { window.print(); return; }

    const conteudo = ccbEl.innerHTML;
    const estilos = Array.from(document.styleSheets)
      .map(sheet => {
        try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n'); }
        catch { return ''; }
      })
      .join('\n');

    const janela = window.open('', '_blank', 'width=900,height=700');
    if (!janela) { window.print(); return; }

    janela.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>CCB — GIROCAIXA Fácil</title>
  <style>${estilos}</style>
</head>
<body style="margin:0;padding:24px;font-family:sans-serif;">
${conteudo}
</body>
</html>`);
    janela.document.close();
    janela.focus();
    janela.onload = () => { janela.print(); janela.close(); };
  }

  iniciarAssinaturaDigital(): void {
    this._assinaturaModalAberta.set(true);
    this._assinaturaStatus.set('aguardando');
    setTimeout(() => this._assinaturaStatus.set('assinado'), 5000);
  }

  fecharAssinatura(): void {
    this._assinaturaModalAberta.set(false);
    this._assinaturaStatus.set('idle');
  }
}
