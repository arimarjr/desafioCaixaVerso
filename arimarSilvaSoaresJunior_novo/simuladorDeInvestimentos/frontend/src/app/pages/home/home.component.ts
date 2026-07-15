import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

interface Opcao {
  label: string;
  value: number; // peso
}

interface Pergunta {
  pergunta: string;
  tipo?: 'numero';
  opcoes?: Opcao[];
  resposta?: number | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  currentStep = 0;

  // para o input numérico
  valorFormatado = '';
  valorInicial: number | null = null;

  perguntas: Pergunta[] = [
    /* -------------------- SITUAÇÃO FINANCEIRA -------------------- */
    {
      pergunta: 'Qual é sua renda mensal?',
      opcoes: [
        { label: 'Até R$ 2.500', value: 0 },
        { label: 'R$ 2.500 a 6.000', value: 1 },
        { label: 'R$ 6.000 a 15.000', value: 2 },
        { label: 'Acima de R$ 15.000', value: 3 },
      ],
    },

    {
      pergunta: 'Qual é seu patrimônio financeiro?',
      opcoes: [
        { label: 'Até R$ 10.000', value: 0 },
        { label: 'R$ 10.000 a 50.000', value: 1 },
        { label: 'R$ 50.000 a 200.000', value: 2 },
        { label: 'Acima de R$ 200.000', value: 3 },
      ],
    },

    /* -------------------- VALOR A INVESTIR (NUMÉRICO) -------------------- */
    {
      pergunta: 'Qual valor você deseja aplicar?',
      tipo: 'numero',
      resposta: null,
    },

    /* -------------------- OBJETIVOS / HORIZONTE -------------------- */
    {
      pergunta: 'Por quanto tempo pretende deixar o valor investido?',
      opcoes: [
        { label: 'Até 1 ano', value: 0 },
        { label: '1 a 3 anos', value: 2 },
        { label: '3 a 5 anos', value: 3 },
        { label: 'Acima de 5 anos', value: 4 },
      ],
    },

    {
      pergunta: 'Qual sua necessidade de liquidez?',
      opcoes: [
        { label: 'Posso precisar a qualquer momento', value: 0 },
        { label: 'Posso esperar alguns meses', value: 1 },
        { label: 'Não tenho necessidade de liquidez', value: 4 },
      ],
    },

    /* -------------------- CONHECIMENTO -------------------- */
    {
      pergunta: 'Qual seu nível de conhecimento em investimentos?',
      opcoes: [
        { label: 'Nenhum', value: 0 },
        { label: 'Básico', value: 2 },
        { label: 'Avançado', value: 4 },
      ],
    },

    {
      pergunta: 'Qual sua experiência com investimentos?',
      opcoes: [
        { label: 'Só poupança, CDB ou LCI', value: 0 },
        { label: 'Fundos / RF / alguns produtos', value: 2 },
        { label: 'Ações, ETFs, multimercado', value: 4 },
      ],
    },

    /* -------------------- TOLERÂNCIA AO RISCO -------------------- */
    {
      pergunta: 'Se seu investimento caísse 10%, o que faria?',
      opcoes: [
        { label: 'Sacaria tudo imediatamente', value: 0 },
        { label: 'Manteria esperando recuperar', value: 2 },
        { label: 'Compraria mais (oportunidade)', value: 4 },
      ],
    },

    {
      pergunta: 'Qual retorno você considera aceitável?',
      opcoes: [
        { label: 'Ganhar pouco sem risco', value: 0 },
        { label: 'Ganhar mais assumindo algum risco', value: 2 },
        { label: 'Busco retornos altos aceitando volatilidade', value: 4 },
      ],
    },

    {
      pergunta: 'O que você prioriza ao investir?',
      opcoes: [
        { label: 'Segurança', value: 0 },
        { label: 'Equilíbrio entre risco e retorno', value: 2 },
        { label: 'Retorno máximo mesmo com risco', value: 4 },
      ],
    },
  ];

  constructor(private router: Router) {}

  /* ======== seleção por botões ======== */
  selecionarOpcao(opcao: Opcao) {
    // registra peso da opção
    this.perguntas[this.currentStep].resposta = opcao.value;
    this.proximaPergunta();
  }

  /* ======== input numérico ======== */
  onValorChange(event: any) {
    // formata como reais (ex.: 1.234,56)
    let somenteDigitos = String(event.target.value).replace(/\D/g, '');
    if (!somenteDigitos) {
      this.valorFormatado = '';
      this.valorInicial = null;
      this.perguntas[this.currentStep].resposta = null;
      return;
    }

    // tratar centavos
    if (somenteDigitos.length === 1) somenteDigitos = '0' + somenteDigitos; // "5" -> "05"
    const numero = parseInt(somenteDigitos, 10);
    const reais = (numero / 100).toFixed(2); // string com ponto decimal

    // formatar para pt-BR: separador de milhares e vírgula decimal
    const [inteiro, decimais] = reais.split('.');
    const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    this.valorFormatado = `${inteiroFormatado},${decimais}`;

    // manter valor numérico como number (ex: 1234.56)
    this.valorInicial = parseFloat(reais);
    // opcional: gravar na pergunta atual (resposta numérica) — armazenamos peso especial abaixo
    this.perguntas[this.currentStep].resposta = this.valorInicial;
  }

  validarValorAtual(): boolean {
    const pergunta = this.perguntas[this.currentStep];
    if (pergunta.tipo === 'numero') {
      if (!this.valorInicial || this.valorInicial <= 0) {
        alert('Informe um valor inicial válido (maior que zero).');
        return false;
      }
    }
    return true;
  }

  /* ======== avançar ======== */
  proximaPergunta() {
    // validação para campo numero
    if (!this.validarValorAtual()) return;

    this.currentStep++;

    if (this.currentStep >= this.perguntas.length) {
      // Quando finalizar, somamos os pontos **ignorando** o valor numérico como ponto direto.
      // Observação: o valor investido pode ser usado depois para aconselhamento — não somamos direto na pontuação de perfil.
      const pontos = this.perguntas.reduce((acc, p) => {
        // a pergunta tipo 'numero' não soma pontos na escala de perfil — ela alimenta apenas 'valorInicial'
        if (p.tipo === 'numero') return acc;
        return acc + (p.resposta ?? 0);
      }, 0);

      let perfil = 'Conservador';
      if (pontos >= 25) perfil = 'Agressivo';
      else if (pontos >= 15) perfil = 'Moderado';

      // navega para dashboard (ou outra rota), incluindo valorInicial e respostas
      this.router.navigate(['/dashboard'], {
        state: {
          perfil,
          pontos,
          valorInicial: this.valorInicial,
          respostas: this.perguntas.map(p => ({
            pergunta: p.pergunta,
            resposta: p.resposta
          }))
        }
      });
    }
  }

  /* ======== voltar (opcional) ======== */
  voltarPergunta() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
}
