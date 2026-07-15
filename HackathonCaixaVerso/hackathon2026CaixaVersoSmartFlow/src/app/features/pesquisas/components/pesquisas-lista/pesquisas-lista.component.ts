import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Pesquisa } from '../../models/pesquisa.model';
import { PesquisasService } from '../../services/pesquisas.service';

// ---------------------------------------------------------------------------
// Funções puras de geração de listas (fora do componente para reutilização)
// ---------------------------------------------------------------------------

function criarPesquisasEmpresa(grupo: string): Pesquisa[] {
  return [
    {
      id: 'cartao-cnpj', grupo, tipoPessoa: 'EMPRESA',
      nome: 'Cartão CNPJ',
      descricao: 'Comprovante de inscrição e situação cadastral no CNPJ.',
      url: 'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp',
      selecionada: true, obrigatoria: true, permiteUpload: true,
    },
    {
      id: 'qsa', grupo, tipoPessoa: 'EMPRESA',
      nome: 'QSA',
      descricao: 'Quadro de Sócios e Administradores.',
      url: 'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp',
      selecionada: true, obrigatoria: true, permiteUpload: true,
    },
    {
      id: 'chancela-digital-contrato-social', grupo, tipoPessoa: 'EMPRESA',
      nome: 'Chancela Digital do Contrato Social',
      descricao: 'Consulta de chancela digital na Junta Comercial.',
      url: 'https://www.jucerja.rj.gov.br/servicos/chanceladigital',
      selecionada: true, obrigatoria: false, permiteUpload: true,
    },
    {
      id: 'sipes-pj', grupo, tipoPessoa: 'EMPRESA',
      nome: 'Sipes PJ',
      descricao: 'Pesquisa de restrições da empresa no SIPES.',
      url: 'https://sipes.caixa',
      selecionada: true, obrigatoria: true, permiteUpload: true,
    },
    {
      id: 'cndt-pj', grupo, tipoPessoa: 'EMPRESA',
      nome: 'CNDT PJ',
      descricao: 'Certidão Negativa de Débitos Trabalhistas da pessoa jurídica.',
      url: 'https://cndt-certidao.tst.jus.br/inicio.faces',
      selecionada: true, obrigatoria: true, permiteUpload: true,
    },
    {
      id: 'cnd-pj', grupo, tipoPessoa: 'EMPRESA',
      nome: 'CND PJ',
      descricao: 'Certidão de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União.',
      url: 'https://servicos.receitafederal.gov.br/servico/certidoes/#/home',
      selecionada: true, obrigatoria: true, permiteUpload: true,
    },
    {
      id: 'crf-pj', grupo, tipoPessoa: 'EMPRESA',
      nome: 'CRF FGTS PJ',
      descricao: 'Certificado de Regularidade do FGTS.',
      url: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
      selecionada: true, obrigatoria: true, permiteUpload: true,
    },
    {
      id: 'jurir-pj', grupo, tipoPessoa: 'EMPRESA',
      nome: 'Jurir / Portal DIJUR',
      descricao: 'Consulta ao Portal Jurídico.',
      url: 'http://www.portal.dijur.caixa/',
      selecionada: true, obrigatoria: false, permiteUpload: true,
    },
    {
      id: 'trf2-pj', grupo, tipoPessoa: 'EMPRESA',
      nome: 'TRF 2ª Região PJ',
      descricao: 'Certidão do Tribunal Regional Federal da 2ª Região.',
      url: 'https://certidoes.trf2.jus.br/certidoes/#/principal/solicitar',
      selecionada: true, obrigatoria: false, permiteUpload: true,
    },
    {
      id: 'sintegra-rj', grupo, tipoPessoa: 'EMPRESA',
      nome: 'Sintegra/RJ',
      descricao: 'Consulta cadastral no SINCAD/Sintegra RJ.',
      url: 'https://sincad-web.fazenda.rj.gov.br/sincad-web/index.jsf',
      selecionada: true, obrigatoria: false, permiteUpload: true,
    },
  ];
}

function criarPesquisasSocio(prefixo: string, grupo: string): Pesquisa[] {
  return [
    {
      id: `${prefixo}-sipes`, grupo, tipoPessoa: 'SOCIO',
      nome: 'Sipes Sócio',
      descricao: 'Pesquisa de restrições do sócio no SIPES.',
      url: 'https://sipes.caixa',
      selecionada: true, obrigatoria: true, permiteUpload: true,
    },
    {
      id: `${prefixo}-regularidade-cpf`, grupo, tipoPessoa: 'SOCIO',
      nome: 'Regularidade CPF Receita',
      descricao: 'Consulta de situação cadastral do CPF.',
      url: 'https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp',
      selecionada: true, obrigatoria: true, permiteUpload: true,
    },
    {
      id: `${prefixo}-cndt-pf`, grupo, tipoPessoa: 'SOCIO',
      nome: 'CNDT PF',
      descricao: 'Certidão Negativa de Débitos Trabalhistas da pessoa física.',
      url: 'https://cndt-certidao.tst.jus.br/inicio.faces',
      selecionada: true, obrigatoria: true, permiteUpload: true,
    },
    {
      id: `${prefixo}-cnd-pf`, grupo, tipoPessoa: 'SOCIO',
      nome: 'CND PF',
      descricao: 'Certidão de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União.',
      url: 'https://servicos.receitafederal.gov.br/servico/certidoes/#/home',
      selecionada: true, obrigatoria: true, permiteUpload: true,
    },
    {
      id: `${prefixo}-crf-pf`, grupo, tipoPessoa: 'SOCIO',
      nome: 'CRF FGTS PF',
      descricao: 'Certificado de Regularidade do FGTS.',
      url: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
      selecionada: true, obrigatoria: false, permiteUpload: true,
    },
    {
      id: `${prefixo}-jurir-pf`, grupo, tipoPessoa: 'SOCIO',
      nome: 'Jurir / Portal DIJUR PF',
      descricao: 'Consulta ao Portal Jurídico para pessoa física.',
      url: 'http://www.portal.dijur.caixa/',
      selecionada: true, obrigatoria: false, permiteUpload: true,
    },
    {
      id: `${prefixo}-trf2-pf`, grupo, tipoPessoa: 'SOCIO',
      nome: 'TRF 2ª Região PF',
      descricao: 'Certidão do Tribunal Regional Federal da 2ª Região.',
      url: 'https://certidoes.trf2.jus.br/certidoes/#/principal/solicitar',
      selecionada: true, obrigatoria: false, permiteUpload: true,
    },
    {
      id: `${prefixo}-sicod`, grupo, tipoPessoa: 'SOCIO',
      nome: 'SICOD — Conferência de Identidade',
      descricao: 'Conferência documental pelo SICOD.',
      url: 'https://sicod.caixa/sicod/login',
      selecionada: true, obrigatoria: false, permiteUpload: true,
    },
    {
      id: `${prefixo}-senatran-cnh`, grupo, tipoPessoa: 'SOCIO',
      nome: 'SENATRAN — Validar CNH',
      descricao: 'Validação de CNH no portal SENATRAN.',
      url: 'https://portalservicos.senatran.serpro.gov.br/#/condutor/validar-cnh',
      selecionada: true, obrigatoria: false, permiteUpload: true,
    },
  ];
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

@Component({
  selector: 'app-pesquisas-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './pesquisas-lista.component.html',
  styleUrl: './pesquisas-lista.component.scss',
})
export class PesquisasListaComponent {
  private readonly pesquisasService = inject(PesquisasService);
  private readonly snackBar = inject(MatSnackBar);

  // Inputs herdados do contexto cadastro-pj (CentralPesquisasComponent)
  readonly cnpj = input('');
  readonly nomesECpfsSocios = input<{ nome: string; cpf: string }[]>([]);

  // Identificador editável — inicializado a partir do cnpj recebido
  readonly identificadorEmpresa = signal('EMPRESA-SEM-IDENTIFICADOR');

  // Lista mútavel de pesquisas com estado de seleção e upload
  readonly pesquisas = signal<Pesquisa[]>([]);

  constructor() {
    // Sincroniza a lista sempre que os inputs mudam
    effect(() => {
      const cnpjAtual = this.cnpj();
      if (cnpjAtual?.trim()) {
        this.identificadorEmpresa.set(cnpjAtual.trim());
      }
      this.pesquisas.set(this.gerarListaCompleta(cnpjAtual, this.nomesECpfsSocios()));
    });
  }

  // ---------------------------------------------------------------------------
  // Computed
  // ---------------------------------------------------------------------------

  readonly totalSelecionadas = computed(() =>
    this.pesquisas().filter((p) => p.selecionada).length,
  );

  readonly todasMarcadas = computed(
    () => this.pesquisas().length > 0 && this.pesquisas().every((p) => p.selecionada),
  );

  readonly parcialmenteMarcadas = computed(() => {
    const sel = this.totalSelecionadas();
    return sel > 0 && sel < this.pesquisas().length;
  });

  readonly grupos = computed(() => {
    const nomes = [...new Set(this.pesquisas().map((p) => p.grupo))];
    return nomes.map((nome) => ({
      nome,
      pesquisas: this.pesquisas().filter((p) => p.grupo === nome),
    }));
  });

  // ---------------------------------------------------------------------------
  // Métodos
  // ---------------------------------------------------------------------------

  atualizarIdentificadorEmpresa(valor: string): void {
    this.identificadorEmpresa.set(valor?.trim() || 'EMPRESA-SEM-IDENTIFICADOR');
  }

  alternarTodas(marcado: boolean): void {
    this.pesquisas.set(this.pesquisas().map((p) => ({ ...p, selecionada: marcado })));
  }

  alternarPesquisa(pesquisaId: string, marcado: boolean): void {
    this.pesquisas.set(
      this.pesquisas().map((p) => (p.id === pesquisaId ? { ...p, selecionada: marcado } : p)),
    );
  }

  efetuarPesquisas(): void {
    const selecionadas = this.pesquisas().filter((p) => p.selecionada);

    if (selecionadas.length === 0) {
      this.snackBar.open('Selecione ao menos uma pesquisa para abrir.', 'Fechar', {
        duration: 4000,
      });
      return;
    }

    // Abre cada link diretamente dentro do handler de clique para reduzir bloqueio do browser
    selecionadas.forEach((p) => window.open(p.url, '_blank', 'noopener,noreferrer'));

    this.snackBar.open(
      `${selecionadas.length} pesquisa(s) aberta(s) em novas abas. Baixe os PDFs e envie em cada linha.`,
      'Fechar',
      { duration: 6000 },
    );
  }

  uploadArquivo(event: Event, pesquisa: Pesquisa): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    if (!arquivo) return;

    if (arquivo.type !== 'application/pdf') {
      this.snackBar.open('Envie somente arquivo PDF.', 'Fechar', { duration: 4000 });
      input.value = '';
      return;
    }

    this.pesquisasService
      .uploadDocumento({
        identificadorEmpresa: this.identificadorEmpresa(),
        pesquisaId: pesquisa.id,
        nomePesquisa: pesquisa.nome,
        arquivo,
      })
      .subscribe({
        next: (resposta) => {
          this.pesquisas.set(
            this.pesquisas().map((item) =>
              item.id === pesquisa.id
                ? { ...item, arquivoEnviado: true, nomeArquivoSalvo: resposta.nomeSalvo }
                : item,
            ),
          );
          this.snackBar.open('PDF enviado e salvo com sucesso.', 'Fechar', { duration: 4000 });
          input.value = '';
        },
        error: () => {
          this.snackBar.open('Erro ao enviar o PDF. Verifique o backend.', 'Fechar', {
            duration: 5000,
          });
          input.value = '';
        },
      });
  }

  // ---------------------------------------------------------------------------
  // Privados
  // ---------------------------------------------------------------------------

  private gerarListaCompleta(
    cnpj: string,
    socios: { nome: string; cpf: string }[],
  ): Pesquisa[] {
    const grupoEmpresa = cnpj?.trim()
      ? `Pesquisas da Empresa (CNPJ: ${cnpj.trim()})`
      : 'Pesquisas da Empresa';

    const lista: Pesquisa[] = criarPesquisasEmpresa(grupoEmpresa);

    socios.forEach((socio, idx) => {
      const prefixo = `socio-${idx}`;
      const grupo = `Pesquisas do Sócio — ${socio.nome}`;
      lista.push(...criarPesquisasSocio(prefixo, grupo));
    });

    return lista;
  }
}

