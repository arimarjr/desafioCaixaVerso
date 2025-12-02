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
    { titulo: 'Fundos de Investimento', resumo: 'Na CAIXA você encontra um portifólio completo de Fundos de Investimento.', tipo: 'fundos' },
    { titulo: 'Fundos Imobiliários', resumo: 'Receba um aluguel sem ter que comprar um imóvel.', tipo: 'imobiliarios' },
    { titulo: 'Previdência', resumo: 'Invista na sua Previdência Privada, planeje sua aposentadoria ou projeto futuro.', tipo: 'previdencia' },
    { titulo: 'Compromissadas', resumo: 'Venda de títulos com compromisso de recompra. Aplicação de curto prazo com baixo risco.', tipo: 'compromissadas' }
  ];

  abrirPopup(tipo: string) {
    this.popupAberto = true;
    // Foco automático no botão fechar do popup
    setTimeout(() => this.fecharBtn?.nativeElement.focus(), 0);

    switch(tipo) {
      case 'tesouro':
        this.popupTitulo = 'Tesouro Direto';
        this.popupDescricao = '1. Tesouro Selic (LFT): Rentabilidade: acompanha a taxa Selic (juros básicos do Brasil). Indicado para: quem quer liquidez diária e menor risco de perda. Ex.: Tesouro Selic 2027.<br><br> 2. Tesouro Prefixado (LTN e NTN-F): Rentabilidade: definida no momento da compra. Indicado para: quem acredita que a taxa de juros vai cair ou quer saber exatamente quanto vai receber no vencimento. Ex.: Tesouro Prefixado 2029.<br><br> 3. Tesouro IPCA+ (NTN-B Principal e NTN-B): Rentabilidade: definida no momento da compra + variação da inflação (IPCA). Indicado para: quem quer proteger o poder de compra do dinheiro ao longo do tempo. Ex.: Tesouro IPCA+ 2035.';
        break;
      case 'lci':
        this.popupTitulo = 'LCI - Letra de Crédito Imobiliário';
        this.popupDescricao = `A LCI é um investimento de renda fixa emitido pela CAIXA, lastreado na carteira de empréstimos imobiliários com garantia hipoteca ou alienação fiduciária mantidos pela instituição.<br><br>
Aplicando em LCI na CAIXA, você conta com a segurança da mais tradicional instituição bancária no mercado imobiliário e ainda contribui para o fomento do setor de crédito imobiliário no país.<br><br> Isenta Imposto de Renda para pessoas físicas e oferece rentabilidade atrativa atrelada ao CDI e com diferentes prazos e valores mínimos de aplicação.`;
        break;
      case 'lca':
        this.popupTitulo = 'LCA - Letra de Crédito do Agronegócio';
        this.popupDescricao = ' A LCA é um investimento de renda fixa emitido pela CAIXA, lastreado na carteira de crédito destinada ao agronegócio, composta por financiamentos e operações vinculadas ao setor, mantidos pela instituição.<br><br> Aplicando em LCA na CAIXA, você conta com a segurança de uma das maiores instituições financeiras do país e ainda contribui diretamente para o desenvolvimento e fortalecimento do agronegócio brasileiro.<br><br> Isenta Imposto de Renda para pessoas físicas e oferece rentabilidade atrativa atrelada ao CDI e com diferentes prazos e valores mínimos de aplicação.';
        break;
      case 'cdb':
        this.popupTitulo = 'CDB';
        this.popupDescricao = `• CDB Pré-Fixado: Saiba quanto será seu rendimento na data do vencimento antes mesmo de aplicar. <br><br>
• CDB Pós-Fixado: Seguro, rentável e super flexível. Você decide por quanto tempo quer deixar seus recursos investidos.<br><br>
• CDB IPCA+: Inflação subiu? Seu investimento também! Com o CDB CAIXA IPCA+, você não fica para trás.<br><br> Imposto de Renda conforme tabela regressiva.`;
        break;
      case 'fundos':
        this.popupTitulo = 'Fundos de Investimento';
        this.popupDescricao = `Na CAIXA você encontra um portifólio completo de Fundos de Investimento.<br> <br>São diversas opções entre Fundos de Renda Fixa e Fundos de Renda Variáel para você diversificar seus investimentos em ativos locais e internacionais, com diferentes perfis de risco e rentabilidade.<br><br>
Veja todas as opções: https://www.fundos.caixa.gov.br/sipii/pages/public/listar-fundos-internet.jsf`;
        break;
      case 'imobiliarios':
        this.popupTitulo = 'Fundos Imobiliários';
        this.popupDescricao = `Invista em Fundos Imobiliários e participe do mercado imobiliário de forma simples, acessível e sem burocracia. Com FIIs, você recebe rendimentos mensais isentos de IR, conta com gestão profissional e ainda tem liquidez na bolsa. Uma maneira prática de diversificar e buscar renda constante com imóveis — sem precisar comprar um.`;
        break;
      case 'previdencia':
        this.popupTitulo = 'Previdência';
        this.popupDescricao = `É uma forma de investimento em que você contribui com uma quantia em dinheiro por um determinado período e esse valor fica rendendo. <br><br>
Os pagamentos podem ser mensais ou de uma só vez e ainda pode fazer contribuições adicionais sempre que tiver uma grana sobrando. <br><br>
Quanto mais você investir e por mais tempo, mais seu dinheiro cresce.<br><br>
<a href="https://www.caixa.gov.br/voce/previdencia/Paginas/default.aspx" target="_blank">Saiba mais sobre Previdência na CAIXA</a>`;
        break;
      case 'compromissadas':
        this.popupTitulo = 'Compromissadas';
        this.popupDescricao = `Venda de títulos com compromisso de recompra. <br><br>As partes (compradora e vendedora) assumem o compromisso de realizar a operação contrária na data do vencimento ou a qualquer tempo, caso seja negociada esta condição.<br><br>
O compromisso de recompra independe da performance dos ativos lastreados.<br><br>
Investimento destinado a aplicações de curto prazo com baixo risco.<br><br>
Isenção de IOF dependendo do lastro utilizado na operação.`;
        break;
    }
  }

  fecharPopup() {
    this.popupAberto = false;
  }
}
