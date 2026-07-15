import { HttpClient, HttpContext } from '@angular/common/http';
import { ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, map, Subject } from 'rxjs';
import { switchMap, tap, finalize } from 'rxjs/operators';

import { AvaliacaoPersistenciaService } from '../../../../core/services/avaliacao-persistencia.service';
import { DadosMockService, ResultadoBuscaEmpresa } from '../../../../core/services/dados-mock.service';
import { ContratoMinutaComponent } from '../../../../features/credito-pj/pages/contrato-minuta/contrato-minuta.component';
import { PesquisasListaComponent } from '../../../../features/pesquisas/components/pesquisas-lista/pesquisas-lista.component';
import { CardsComponent } from '../../../../shared/cards/cards.component';
import { InputCnpjComponent } from '../../../../shared/components/input-cnpj/input-cnpj.component';
import { SOCIOS } from '../../../../shared/mocks/socios.mock';
import { EmpresaCompletaDto } from '../../../../shared/models/empresa.model';
import { OportunidadesDaCarteiraComponent } from '../../../oportunidades-da-carteira/pages/oportunidades-da-carteira/oportunidades-da-carteira.component';
import { ClienteResponseDto } from '../../models/cliente-response.dto';
import { EmpresaHomeVm, OfertaProdutoVm, SocioResumoVm } from '../../models/empresa-home.vm';
import { ProdutoIaVm, RespostaIaVm, SubsecaoIaVm } from '../../models/ia-resposta.vm';
import { SKIP_AUTH_REDIRECT } from '../../../../core/interceptors/skip-auth-redirect.token';
import { CapitalGiroSimulacaoComponent } from '../capital-giro-simulacao/capital-giro-simulacao.component';
import { GarantiasComponent } from '../garantias/garantias.component';
import { ResumoOperacaoComponent } from '../resumo-operacao/resumo-operacao.component';

@Component({
  selector: 'app-home-pagina-inicial',
  standalone: true,
  imports: [OportunidadesDaCarteiraComponent, InputCnpjComponent, CardsComponent, CapitalGiroSimulacaoComponent, GarantiasComponent, PesquisasListaComponent, ResumoOperacaoComponent, ContratoMinutaComponent],
  templateUrl: './home-pagina-inicial.component.html',
  styleUrl: './home-pagina-inicial.component.scss'
})
export class HomePaginaInicialComponent {
  private readonly _http             = inject(HttpClient);
  private readonly _dadosMock         = inject(DadosMockService);
  private readonly _cdr               = inject(ChangeDetectorRef);
  private readonly _avaliacaoSvc      = inject(AvaliacaoPersistenciaService);

  readonly empresaVm         = signal<EmpresaHomeVm | null>(null);
  readonly erroNaoEncontrado = signal(false);
  readonly carregando        = signal(false);
  readonly stepAtivo         = signal(0);
  readonly recomendacaoIa    = signal<string | null>(null);
  readonly carregandoIa      = signal(false);
  readonly respostaIaEstruturada = computed(() => {
    const texto = this.recomendacaoIa();
    return texto ? this._parsearRespostaIa(texto) : null;
  });

  // Subject que aciona a busca; switchMap cancela requisição anterior
  // ao digitar um novo CNPJ rapidamente (evita race condition).
  private readonly _buscar$ = new Subject<string>();

  readonly etapas = [
    'Resumo da Avaliação',
    'Linhas de Crédito',
    'Pesquisas',
    'Garantias',
    'Resumo',
    'Minuta',
  ];

  sociosParaPesquisa(): { nome: string; cpf: string }[] {
    return (this.empresaVm()?.socios ?? []).map(s => ({ nome: s.nome, cpf: s.cpf }));
  }
 
  constructor() {
    this._buscar$
      .pipe(
        tap(() => {
          this.erroNaoEncontrado.set(false);
          this.empresaVm.set(null);
          this.carregando.set(true);
        }),
        switchMap(cnpjLimpo =>
          this._http
            .get<ClienteResponseDto>(`/api/empresas/${cnpjLimpo}`, {
              context: new HttpContext().set(SKIP_AUTH_REDIRECT, true),
            })
            .pipe(
              map(dto => this._construirVmDoBackend(dto)),
              tap(vm => {
                this.empresaVm.set(vm);
                this.stepAtivo.set(0);
                this.carregando.set(false);
                this._cdr.detectChanges();
                this._buscarRecomendacaoIa(cnpjLimpo);
              }),
              catchError(() => {
                this._usarMockFallback(cnpjLimpo);
                return EMPTY;
              })
            )
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  aoReceberCnpj(cnpj: string): void {
    this._buscar$.next(cnpj.replace(/\D/g, ''));
  }

  avancarEtapa(): void {
    this.stepAtivo.update(atual => (atual < this.etapas.length - 1 ? atual + 1 : atual));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irParaEtapa(i: number): void {
    if (i <= this.stepAtivo()) {
      this.stepAtivo.set(i);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ── Recomendação IA: chamada após empresa carregar ────────────────────────
  private _buscarRecomendacaoIa(cnpj: string): void {
    this.recomendacaoIa.set(null);
    this.carregandoIa.set(true);
    this._http
      .get<{ resposta: string }>(`/api/ia/recomendar/${cnpj}`, {
        context: new HttpContext().set(SKIP_AUTH_REDIRECT, true),
      })
      .pipe(
        finalize(() => {
          this.carregandoIa.set(false);
          this._cdr.detectChanges();
        }),
        catchError(() => EMPTY)
      )
      .subscribe(resp => {
        this.recomendacaoIa.set(resp?.resposta ?? null);
        this._cdr.detectChanges();
      });
  }

  // ── Fallback: usa mocks TypeScript quando o backend não está rodando ───────
  private _usarMockFallback(cnpj: string): void {
    const resultado = this._dadosMock.buscarEmpresaPorCNPJ(cnpj);
    if (!resultado) {
      this.carregando.set(false);
      this.erroNaoEncontrado.set(true);
      this._cdr.detectChanges();
      return;
    }

    // Simula o tempo de processamento de uma avaliação de crédito
    setTimeout(() => {
      const vm = this._construirVmDoMock(resultado, cnpj);
      this.empresaVm.set(vm);
      this.stepAtivo.set(0);
      this.carregando.set(false);
      this.recomendacaoIa.set(null);
      this.carregandoIa.set(false);
      this._cdr.detectChanges();
    }, 1500);
  }

  // ── Parser da resposta da IA em estrutura visual ─────────────────────────
  private _parsearRespostaIa(texto: string): RespostaIaVm {
    const linhas    = texto.split('\n');
    const produtos: ProdutoIaVm[] = [];
    const observacoes: string[]   = [];
    const refsGerais: string[]    = [];
    let introducao  = '';

    type Secao = 'intro' | 'produto' | 'obs' | 'refs';
    let secao: Secao             = 'intro';
    let produtoAtual: ProdutoIaVm | null = null;

    const limpar = (s: string) => s.replace(/\*\*/g, '').replace(/\[/g, '').replace(/\]/g, '').trim();

    const subsecaoPorTexto = (txt: string): SubsecaoIaVm | null => {
      const l = txt.toLowerCase();
      if (l.includes('modalidade'))                 return { icone: 'list_alt',  titulo: 'Modalidades',            itens: [] };
      if (l.includes('garantia'))                   return { icone: 'security',  titulo: 'Garantias Obrigatórias', itens: [] };
      if (l.includes('referên') || l.includes('normativ')) return { icone: 'menu_book', titulo: 'Referências Normativas',  itens: [] };
      return null;
    };

    for (const linha of linhas) {
      const limpa      = linha.trim();
      const eIndentado = /^\s{2,}-/.test(linha);
      const eTopBullet = limpa.startsWith('- ') && !eIndentado;

      if (!limpa || limpa === '---') continue;

      // ── Headings (###) ──────────────────────────────────────────────────
      if (limpa.startsWith('#')) {
        const h = limpa.replace(/^#+\s*/, '');

        if (/^\d+\./.test(h)) {                              // product
          if (produtoAtual) produtos.push(produtoAtual);
          const siapiM = h.match(/\(SIAPI\s*(\d+)\)/i);
          const numM   = h.match(/^(\d+)/);
          produtoAtual = {
            numero:   parseInt(numM?.[1] ?? '0', 10),
            titulo:   h.replace(/^\d+\.\s*/, '').replace(/\(SIAPI\s*\d+\)/i, '').replace(/\*\*/g, '').trim(),
            siapi:    siapiM ? `SIAPI ${siapiM[1]}` : '',
            subsecoes: [],
          };
          secao = 'produto';
        } else if (/observa/i.test(h)) {
          if (produtoAtual) { produtos.push(produtoAtual); produtoAtual = null; }
          secao = 'obs';
        } else if (/referên/i.test(h) || /normativ/i.test(h)) {
          if (produtoAtual) { produtos.push(produtoAtual); produtoAtual = null; }
          secao = 'refs';
        }
        continue;
      }

      // ── Intro ────────────────────────────────────────────────────────────
      if (secao === 'intro') {
        if (!eTopBullet && !eIndentado) introducao += limpar(limpa) + ' ';
        continue;
      }

      // ── Produto ──────────────────────────────────────────────────────────
      if (secao === 'produto' && produtoAtual) {
        if (eTopBullet) {
          const conteudo = limpa.replace(/^-\s*/, '');
          if (conteudo.endsWith(':**') || conteudo.endsWith(':')) {
            const sub = subsecaoPorTexto(conteudo);
            if (sub) { produtoAtual.subsecoes.push(sub); continue; }
          }
          // Regular top-level item → append to last subsection
          if (produtoAtual.subsecoes.length > 0) {
            produtoAtual.subsecoes.at(-1)!.itens.push(limpar(conteudo));
          }
          continue;
        }
        if (eIndentado && produtoAtual.subsecoes.length > 0) {
          produtoAtual.subsecoes.at(-1)!.itens.push(limpar(limpa.replace(/^-\s*/, '')));
        }
        continue;
      }

      // ── Observações ──────────────────────────────────────────────────────
      if (secao === 'obs' && eTopBullet) {
        observacoes.push(limpar(limpa.replace(/^-\s*/, '')));
      }

      // ── Referências gerais ───────────────────────────────────────────────
      if (secao === 'refs' && eTopBullet) {
        refsGerais.push(limpar(limpa.replace(/^-\s*/, '')));
      }
    }

    if (produtoAtual) produtos.push(produtoAtual);

    return { introducao: introducao.trim(), produtos, observacoes, refsGerais };
  }

  // ── VM a partir do JSON do backend (ClienteResponse) ─────────────────────
  private _construirVmDoBackend(dto: ClienteResponseDto): EmpresaHomeVm {
    const score           = dto.avaliacaoCreditoScoreInterno ?? 0;
    const limiteGlobal    = dto.avaliacaoCreditoLimiteSugerido ?? 0;
    const aprovado        = true;

    const ratingBadge     = 'A';
    const ratingAprovado  = true;
    const ratingTexto     = 'Rating Aprovado';

    const limiteUtilizado  = Math.round(limiteGlobal * 0.24);
    const limiteDisponivel = limiteGlobal - limiteUtilizado;

    const dataAbertura = new Date(dto.dataConstituicao);
    const diffAnos     = (Date.now() - dataAbertura.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const meses        = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

    const faturamentoAnual = ((dto.faturamentoMedioMensal ?? 0) * 12) || (dto.faturamentoValor ?? 0);

    const socios: SocioResumoVm[] = (dto.representantes ?? []).slice(0, 2).map(r => ({
      nome:   r.nome,
      cpf:    r.cpf,
      status: dto.restricaoCadastral ? 'Com restrições' : 'Sem restrições',
    }));

    // ── Produtos recomendados baseados na avaliação de crédito ───────────────
    const capitalGiroValor = Math.round(limiteGlobal * 0.6);
    const antecipaValor    = Math.round((dto.faturamentoMedioMensal ?? 0) * 0.8);

    const taxaCapitalGiro  = score >= 750 ? '1,0% a.m.' : score >= 650 ? '1,2% a.m.' : '1,5% a.m.';
    const taxaAntecipa     = score >= 700 ? '1,3% a.m.' : '1,5% a.m.';
    const prazoCapitalGiro = aprovado ? 'até 24 meses' : 'até 12 meses';

    const hoje   = new Date();
    const valAte = new Date(hoje);
    valAte.setFullYear(valAte.getFullYear() + 1);

    const ofertaCapitalGiro: OfertaProdutoVm = {
      valor:       capitalGiroValor,
      valorStr:    this._moeda(capitalGiroValor),
      taxa:        taxaCapitalGiro,
      prazo:       prazoCapitalGiro,
      preAprovado: aprovado,
    };

    const ofertaAntecipaRecebiveis: OfertaProdutoVm = {
      valor:       antecipaValor,
      valorStr:    this._moeda(antecipaValor),
      taxa:        taxaAntecipa,
      prazo:       'até 6 meses',
      preAprovado: aprovado,
    };

    return {
      razaoSocial:         dto.razaoSocial,
      nomeFantasia:        dto.nomeFantasia,
      cnpj:                dto.cnpj,
      faturamentoAnual:    this._moeda(faturamentoAnual),
      segmento:            dto.descricaoCnaePrincipal || dto.cnaePrincipal,
      ratingBadge,
      ratingTexto,
      ratingAprovado,
      dataAvaliacao:       hoje.toLocaleDateString('pt-BR'),
      validoAte:           valAte.toLocaleDateString('pt-BR'),
      limiteGlobalStr:     this._moeda(limiteGlobal),
      limiteUtilizadoStr:  this._moeda(limiteUtilizado),
      limiteDisponivelStr: this._moeda(limiteDisponivel),
      percentualUtilizado: 24,
      tempoRelacionamento: diffAnos.toFixed(1) + ' anos',
      clienteDesde:        `${meses[dataAbertura.getMonth()]} de ${dataAbertura.getFullYear()}`,
      ...this._nepjPorScore(score),
      possuiRestricao:     dto.restricaoCadastral,
      socios,
      classificacaoRisco:  'A',
      scoreInterno:        score,
      ofertaCapitalGiro,
      ofertaAntecipaRecebiveis,
    };
  }

  // ── VM a partir dos mocks TypeScript (fallback) ───────────────────────────
  private _construirVmDoMock(resultado: ResultadoBuscaEmpresa, cnpjOriginal: string): EmpresaHomeVm {
    const base    = resultado.dados;
    const isFull  = resultado.origem === 'cadastrada';
    const dados   = base as Partial<EmpresaCompletaDto>;

    const score            = isFull ? (dados.scoreCredito ?? 650) : 650;
    const faturamentoAnual = (isFull ? (dados.faturamentoMensal ?? 100_000) : 100_000) * 12;

    const ratingBadge   = 'A';
    const ratingAprovado = true;
    const ratingTexto    = 'Rating Aprovado';

    const limiteGlobal    = score * 1000;
    const limiteUtilizado = Math.round(limiteGlobal * 0.24);
    const limiteDisponivel = limiteGlobal - limiteUtilizado;

    const dataAbertura = dados.dataAbertura ? new Date(dados.dataAbertura) : new Date('2019-11-01');
    const diffAnos     = (Date.now() - dataAbertura.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const meses        = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

    const socios: SocioResumoVm[] = SOCIOS.slice(0, 2).map(s => ({
      nome: s.nome, cpf: s.cpf,
      status: s.possuiRestricao ? 'Com restrições' : 'Sem restrições',
    }));

    const capitalGiroValor = Math.round(limiteGlobal * 0.6);
    const antecipaValor    = Math.round(faturamentoAnual / 12 * 0.8);

    return {
      razaoSocial:         base.razaoSocial,
      nomeFantasia:        base.nomeFantasia,
      cnpj:                base.cnpj ?? cnpjOriginal,
      faturamentoAnual:    this._moeda(faturamentoAnual),
      segmento:            base.cnaePrincipal,
      ratingBadge,
      ratingTexto,
      ratingAprovado,
      dataAvaliacao:       '14/10/2025',
      validoAte:           '14/10/2026',
      limiteGlobalStr:     this._moeda(limiteGlobal),
      limiteUtilizadoStr:  this._moeda(limiteUtilizado),
      limiteDisponivelStr: this._moeda(limiteDisponivel),
      percentualUtilizado: 24,
      tempoRelacionamento: diffAnos.toFixed(1) + ' anos',
      clienteDesde:        `${meses[dataAbertura.getMonth()]} de ${dataAbertura.getFullYear()}`,
      ...this._nepjPorScore(score),
      possuiRestricao:     dados.possuiRestricao ?? false,
      socios,
      classificacaoRisco:  ratingBadge,
      scoreInterno:        score,
      ofertaCapitalGiro: {
        valor: capitalGiroValor, valorStr: this._moeda(capitalGiroValor),
        taxa: '1,2% a.m.', prazo: 'até 24 meses', preAprovado: true,
      },
      ofertaAntecipaRecebiveis: {
        valor: antecipaValor, valorStr: this._moeda(antecipaValor),
        taxa: '1,5% a.m.', prazo: 'até 6 meses', preAprovado: true,
      },
    };
  }

  private _nepjPorScore(_score: number) {
    return { nepj: 'NePJ 1', nepjClassificacao: 'Muito Alto', nepjDescricao: 'Cliente com altíssimo nível de engajamento' };
  }

  private _moeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
