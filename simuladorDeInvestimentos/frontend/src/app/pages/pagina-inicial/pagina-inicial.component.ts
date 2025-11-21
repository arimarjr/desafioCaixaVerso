import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

interface CardInfo {
  titulo: string;
  resumo: string;
  tipo: string;
  link?: string;
}

@Component({
  selector: 'app-pagina-inicial',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './pagina-inicial.component.html',
  styleUrls: ['./pagina-inicial.component.scss']
})
export class PaginaInicialComponent {
  popupAberto = false;
  popupTitulo = '';
  popupDescricao = '';

  @ViewChild('fecharBtn') fecharBtn!: ElementRef<HTMLButtonElement>;

  cards: CardInfo[] = [
    { titulo: 'Tesouro Direto', resumo: 'Negocie títulos públicos federais de um jeito prático e seguro.', tipo: 'tesouro' },
    { titulo: 'LCI', resumo: 'Invista em títulos de créditos imobiliários com baixo risco, rentabilidade e isenção de Imposto de Renda.', tipo: 'lci' },
    { titulo: 'LCA', resumo: 'Invista em títulos de créditos do agronegócio, diversificando seus investimentos e com isenção de Imposto de Renda.', tipo: 'lca' },
    { titulo: 'CDB', resumo: 'Tenha maior controle e flexibilidade em suas aplicações.', tipo: 'cdb' },
    { titulo: 'Fundos de Investimento', resumo: 'Conheça diferentes opções para diversificar seus investimentos em ativos locais e internacionais.', tipo: 'fundos' },
    { titulo: 'Fundos Imobiliários', resumo: 'Receba um aluguel sem ter que comprar um imóvel.', tipo: 'imobiliarios' },
    { titulo: 'Previdência', resumo: 'Invista, planeje sua aposentadoria ou projeto futuro.', tipo: 'previdencia' },
    { titulo: 'Compromissadas', resumo: 'Venda de títulos com compromisso de recompra. Aplicação de curto prazo com baixo risco.', tipo: 'compromissadas' }
  ];

  abrirPopup(tipo: string) {
    this.popupAberto = true;
    // Foco automático no botão fechar do popup
    setTimeout(() => this.fecharBtn?.nativeElement.focus(), 0);

    switch(tipo) {
      case 'tesouro':
        this.popupTitulo = 'Tesouro Direto';
        this.popupDescricao = 'Negocie títulos públicos federais de um jeito prático e seguro.';
        break;
      case 'lci':
        this.popupTitulo = 'LCI - Letra de Crédito Imobiliário';
        this.popupDescricao = `A LCI é um investimento de renda fixa emitido pela CAIXA, lastreado na carteira de empréstimos imobiliários com garantia hipoteca ou alienação fiduciária mantidos pela instituição.
Aplicando em LCI na CAIXA, você conta com a segurança da mais tradicional instituição bancária no mercado imobiliário e ainda contribui para o fomento do setor de crédito imobiliário no país.`;
        break;
      case 'lca':
        this.popupTitulo = 'LCA - Letra de Crédito do Agronegócio';
        this.popupDescricao = 'Invista em títulos de crédito do agronegócio com rentabilidade, baixo risco e isenção de Imposto de Renda.';
        break;
      case 'cdb':
        this.popupTitulo = 'CDB';
        this.popupDescricao = `• CDB Pré-Fixado: Saiba quanto será seu rendimento na data do vencimento antes mesmo de aplicar.
• CDB Pós-Fixado: Seguro, rentável e super flexível. Você decide por quanto tempo quer deixar seus recursos investidos.
• CDB IPCA+: Inflação subiu? Seu investimento também! Com o CDB CAIXA IPCA+, você não fica para trás.`;
        break;
      case 'fundos':
        this.popupTitulo = 'Fundos de Investimento';
        this.popupDescricao = `Reunimos as principais informações sobre os fundos de investimento da CAIXA. Compare e escolha o fundo ideal para seus objetivos.
Veja todas as opções: https://www.fundos.caixa.gov.br/sipii/pages/public/listar-fundos-internet.jsf`;
        break;
      case 'imobiliarios':
        this.popupTitulo = 'Fundos Imobiliários';
        this.popupDescricao = `Invista em fundos imobiliários com o banco que também é referência em habitação.
• Fundo de Investimento Imobiliário CAIXA Carteira Imobiliária: Aplicação Inicial R$1.000,00, Público-alvo: Pessoas físicas e jurídicas, Taxa anual 0,70%, Risco: Alto
• CAIXA Rio Bravo Fundo de Fundos de Investimento Imobiliário FII...
...e demais fundos conforme especificado.`;
        break;
      case 'previdencia':
        this.popupTitulo = 'Previdência';
        this.popupDescricao = `É uma forma de investimento em que você contribui com uma quantia em dinheiro por um determinado período e esse valor fica rendendo. 
Os pagamentos podem ser mensais ou de uma só vez e ainda pode fazer contribuições adicionais sempre que tiver uma grana sobrando. 
Quanto mais você investir e por mais tempo, mais seu dinheiro cresce.<br><br>
<a href="https://www.caixa.gov.br/voce/previdencia/Paginas/default.aspx" target="_blank">Saiba mais sobre Previdência na CAIXA</a>`;
        break;
      case 'compromissadas':
        this.popupTitulo = 'Compromissadas';
        this.popupDescricao = `Venda de títulos com compromisso de recompra. As partes (compradora e vendedora) assumem o compromisso de realizar a operação contrária na data do vencimento ou a qualquer tempo, caso seja negociada esta condição.
O compromisso de recompra independe da performance dos ativos lastreados.
Investimento destinado a aplicações de curto prazo com baixo risco.
Isenção de IOF dependendo do lastro utilizado na operação.`;
        break;
    }
  }

  fecharPopup() {
    this.popupAberto = false;
  }
}
