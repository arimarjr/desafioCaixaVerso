import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Chart, ChartDataset, registerables } from 'chart.js';
import { Router } from '@angular/router';

Chart.register(...registerables);

interface Produto {
  id: number;
  nome: string;
  tipo: string;
  descricao: string;
  rentabilidade: number;
  risco: string;
}

/* ------------------- */
/* POPUP PRODUTO       */
/* ------------------- */
@Component({
  selector: 'dialog-investimento',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.nome }}</h2>
    <div mat-dialog-content><p>{{ data.descricaoCompleta }}</p></div>
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

/* ------------------- */
/* COMPONENTE PRINCIPAL*/
/* ------------------- */
@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss']
})
export class DashboardsComponent implements OnInit, AfterViewInit {

  perfil = '';
  perfilDescricao = '';
  valorInicial = 10000;

  novoValor: string = '0,00';
  novosMeses: number = 0;

  meses: string[] = [];
  resultadosFinais: { nome: string; valor: number }[] = [];

  produtos: Produto[] = [
    { id: 100, nome: 'Tesouro Direto Selic 2027', tipo: 'Tesouro Direto', descricao: 'Título público federal indicado para investidores conservadores que buscam segurança.', rentabilidade: 0.105, risco: 'Baixo' },

    { id: 101, nome: 'CDB Caixa Pós 2026', tipo: 'Renda Fixa', descricao: 'Um investimento de renda fixa com juros flutuantes, com rentabilidade atrelada ao CDI, muito próxima da Selic, a taxa básica de juros.', rentabilidade: 0.13, risco: 'Baixo' },

    { id: 102, nome: 'Fundo Agressivo RV', tipo: 'Fundos', descricao: 'A CAIXA oferece diversos fundos de renda variável, como fundos de ações que buscam acompanhar o desempenho do Ibovespa.', rentabilidade: 0.18, risco: 'Alto' },

    { id: 103, nome: 'LCI Caixa Imobiliário', tipo: 'LCI/LCA', descricao: 'Letra de Crédito Imobiliário. Isenta de Imposto de Renda. Garantida pelo Fundo Garantidor de Créditos (FGC)', rentabilidade: 0.15, risco: 'Baixo' },

    { id: 104, nome: 'Previdência Privada Caixa', tipo: 'Previdência', descricao: 'Previdência Privada é uma solução para quem deseja complementar a aposentadoria e realizar projetos futuros.', rentabilidade: 0.15, risco: 'Médio' }
  ];

  chartLinha!: Chart;
  chartBarra!: Chart;

  constructor(private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    const state: any = history.state;
    this.perfil = state.perfil || 'Moderado';
    this.valorInicial = state.valorInicial || 10000;
    this.definirPerfilDescricao();
  }

  ngAfterViewInit() {
    this.simularTodosProdutos(this.valorInicial, 12);
  }

  definirPerfilDescricao() {
    const d: any = {
      'Conservador': 'Investe buscando preservar o capital e manter liquidez, com baixa tolerância a risco, priorizando segurança e estabilidade mesmo que os retornos sejam menores.',
      'Moderado': 'Busca equilibrar segurança e retorno, com tolerância média a risco, aceitando parte do capital em produtos mais arriscados para obter ganhos maiores no médio ou longo prazo.',
      'Agressivo': 'Foca em maiores retornos, assumindo alta volatilidade e risco, aceitando oscilações significativas no capital e priorizando ganhos potenciais no longo prazo, adequado para investidores experientes.'
    };
    this.perfilDescricao = d[this.perfil];
  }

  /* ------------------------- */
  /*     MÁSCARA DE MOEDA      */
  /* ------------------------- */
  formatarMoeda(event: any) {
    let valor = event.target.value.replace(/\D/g, '');

    if (!valor) {
      this.novoValor = '';
      return;
    }

    valor = (parseInt(valor) / 100).toFixed(2);

    this.novoValor = Number(valor).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /* ------------------------- */
  /*     SIMULAÇÃO GRÁFICOS    */
  /* ------------------------- */
  simularTodosProdutos(valor: number, meses: number) {
    this.meses = Array.from({ length: meses }, (_, i) => `Mês ${i + 1}`);
    this.resultadosFinais = [];

    const datasetsLinha: ChartDataset[] = [];
    const datasetsBarra: ChartDataset[] = [];

    const cores = ['#005CA9', '#0095DA', '#7ED957', '#F2A900', '#B00020'];

    this.produtos.forEach((p, i) => {
      const taxaMensal = (1 + p.rentabilidade) ** (1 / 12) - 1;

      const valores = Array.from({ length: meses }, (_, m) =>
        +(valor * (1 + taxaMensal) ** (m + 1)).toFixed(2)
      );

      datasetsLinha.push({
        label: p.nome,
        data: valores,
        borderColor: cores[i],
        tension: 0.35,
        fill: false
      });

      datasetsBarra.push({
        label: p.nome,
        data: valores,
        backgroundColor: cores[i]
      });

      this.resultadosFinais.push({ nome: p.nome, valor: valores.at(-1)! });
    });

    if (this.chartLinha) this.chartLinha.destroy();
    this.chartLinha = new Chart(
      document.getElementById('graficoLinha') as HTMLCanvasElement,
      {
        type: 'line',
        data: { labels: this.meses, datasets: datasetsLinha },
        options: { responsive: true, maintainAspectRatio: false }
      }
    );

    if (this.chartBarra) this.chartBarra.destroy();
    this.chartBarra = new Chart(
      document.getElementById('graficoBarra') as HTMLCanvasElement,
      {
        type: 'bar',
        data: { labels: this.meses, datasets: datasetsBarra },
        options: { responsive: true, maintainAspectRatio: false }
      }
    );
  }

  /* ------------------------- */
  /*     BOTÃO SIMULAR         */
  /* ------------------------- */
  simularNovosValores() {
    const valor = parseFloat(
      this.novoValor
        .replace(/\./g, '')
        .replace(',', '.')
    );

    if (isNaN(valor) || valor < 50) return;

    this.simularTodosProdutos(valor, this.novosMeses);
  }

  abrirPopup(produto: Produto) {
    this.dialog.open(DialogInvestimentoComponent, {
      width: '420px',
      data: {
        nome: produto.nome,
        descricaoCompleta: produto.descricao
      }
    });
  }

  solicitarContato() {
    this.router.navigate(['/formContatoGerente']);
  }

}
