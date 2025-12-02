import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Chart, ChartDataset, registerables } from 'chart.js';
Chart.register(...registerables);

interface Produto {
  id: number;
  nome: string;
  tipo: string;
  descricao: string;
  rentabilidade: number;
  risco: string;
}

@Component({
  selector: 'dialog-investimento',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.nome }}</h2>
    <div mat-dialog-content>
      <p>{{ data.descricaoCompleta }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Fechar</button>
    </div>
  `
})
export class DialogInvestimentoComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogInvestimentoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatDialogModule],
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss']
})
export class DashboardsComponent implements OnInit, AfterViewInit {

  perfil = '';
  perfilDescricao = '';
  valorInicial = 10000;

  novoValor: string = '10.000,00';
  novosMeses: number = 12;

  meses: string[] = [];
  produtos: Produto[] = [];
  cores = ['#005CA9', '#0095DA', '#7ED957', '#F2A900', '#B00020'];

  chartLinha: Chart | undefined;
  chartBarra: Chart | undefined;

  resultadosFinais: { nome: string; valor: number }[] = [];

  constructor(private router: Router, private dialog: MatDialog) {
    this.produtos = [
      { id: 100, nome: 'Tesouro Direto Selic 2027', tipo: 'Tesouro Direto', descricao: 'Título público federal indicado para investidores conservadores que buscam segurança.', rentabilidade: 0.105, risco: 'Baixo' },
      { id: 101, nome: 'CDB Caixa Pós 2026', tipo: 'Renda Fixa', descricao: 'Rentabilidade atrelada ao CDI.', rentabilidade: 0.13, risco: 'Baixo' },
      { id: 102, nome: 'Fundo Agressivo RV', tipo: 'Fundos', descricao: 'Fundos de renda variável mais agressivos.', rentabilidade: 0.18, risco: 'Alto' },
      { id: 103, nome: 'LCI Caixa Imobiliário', tipo: 'LCI/LCA', descricao: 'Letra de Crédito Imobiliário isenta de IR.', rentabilidade: 0.15, risco: 'Baixo' },
      { id: 104, nome: 'Previdência Privada Caixa', tipo: 'Previdência', descricao: 'Investimento para complementar aposentadoria.', rentabilidade: 0.15, risco: 'Médio' }
    ];
  }

  ngOnInit(): void {
    const state: any = history.state;
    this.perfil = state.perfil || 'Moderado';
    this.valorInicial = state.valorInicial || 10000;
    this.definirPerfilDescricao();
  }

  ngAfterViewInit() {
    this.simularTodosProdutos(this.valorInicial, 12);
  }

  definirPerfilDescricao() {
    const descricoes: any = {
      'Conservador': 'Investe buscando preservar o capital e manter liquidez, com baixa tolerância a risco, priorizando segurança e estabilidade mesmo que os retornos sejam menores.',
      'Moderado': 'Busca equilibrar segurança e retorno, com tolerância média a risco, aceitando parte do capital em produtos mais arriscados para obter ganhos maiores no médio ou longo prazo.',
      'Agressivo': 'Foca em maiores retornos, assumindo alta volatilidade e risco, aceitando oscilações significativas no capital e priorizando ganhos potenciais no longo prazo, adequado para investidores experientes.'
    };
    this.perfilDescricao = descricoes[this.perfil] || 'Perfil não identificado.';
  }

  formatarMoeda(event: any) {
    let valor = event.target.value.replace(/[R$\.\s]/g, '').replace(',', '.');
    let numero = parseFloat(valor);
    if (!isNaN(numero)) {
      this.novoValor = numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      this.novoValor = '';
    }
  }

  simularTodosProdutos(valor: number, meses: number) {
    this.meses = Array.from({ length: meses }, (_, i) => `Mês ${i + 1}`);
    this.resultadosFinais = [];

    const datasetsLinha: ChartDataset<'line'>[] = [];
    const datasetsBarra: ChartDataset<'bar'>[] = [];

    this.produtos.forEach((p, i) => {
      const taxaMensal = Math.pow(1 + p.rentabilidade, 1 / 12) - 1;
      const valores = Array.from({ length: meses }, (_, m) =>
        +(valor * Math.pow(1 + taxaMensal, m + 1)).toFixed(2)
      );

      datasetsLinha.push({
        label: p.nome,
        data: valores,
        borderColor: this.cores[i],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.35
      });

      datasetsBarra.push({
        label: p.nome,
        data: valores,
        backgroundColor: this.cores[i]
      });

      this.resultadosFinais.push({ nome: p.nome, valor: valores[valores.length - 1] });
    });

    if (this.chartLinha) this.chartLinha.destroy();
    const ctxLinha = document.getElementById('graficoLinha') as HTMLCanvasElement;
    this.chartLinha = new Chart(ctxLinha, { type: 'line', data: { labels: this.meses, datasets: datasetsLinha }, options: { responsive: true, maintainAspectRatio: false } });

    if (this.chartBarra) this.chartBarra.destroy();
    const ctxBarra = document.getElementById('graficoBarra') as HTMLCanvasElement;
    this.chartBarra = new Chart(ctxBarra, { type: 'bar', data: { labels: this.meses, datasets: datasetsBarra }, options: { responsive: true, maintainAspectRatio: false } });
  }

  simularNovosValores() {
    const valor = Number(this.novoValor.replace(/[.\s]/g, '').replace(',', '.'));
    if (valor < 100 || this.novosMeses < 1) return;
    this.simularTodosProdutos(valor, this.novosMeses);
  }

  abrirPopup(produto: Produto) {
    this.dialog.open(DialogInvestimentoComponent, {
      width: '420px',
      data: { nome: produto.nome, descricaoCompleta: produto.descricao }
    });
  }

  solicitarContato() {
    this.router.navigate(['/formContatoGerente']);
  }
}
