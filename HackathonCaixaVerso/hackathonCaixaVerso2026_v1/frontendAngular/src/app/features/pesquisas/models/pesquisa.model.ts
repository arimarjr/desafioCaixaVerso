export type TipoPessoaPesquisa = 'EMPRESA' | 'SOCIO';

export interface Pesquisa {
  id: string;
  grupo: string;
  tipoPessoa: TipoPessoaPesquisa;
  nome: string;
  descricao: string;
  url: string;
  selecionada: boolean;
  obrigatoria: boolean;
  permiteUpload: boolean;
  arquivoEnviado?: boolean;
  nomeArquivoSalvo?: string;
}

// ---------------------------------------------------------------------------
// Pesquisas fixas da Empresa
// ---------------------------------------------------------------------------
const _DEF_EMPRESA: Omit<Pesquisa, 'selecionada' | 'arquivoEnviado' | 'nomeArquivoSalvo'>[] = [
  {
    id: 'cartao-cnpj',
    grupo: 'Pesquisas da Empresa',
    tipoPessoa: 'EMPRESA',
    nome: 'Cartão CNPJ',
    descricao: 'Comprovante de inscrição e situação cadastral no CNPJ.',
    url: 'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp',
    obrigatoria: true,
    permiteUpload: true,
  },
  {
    id: 'qsa',
    grupo: 'Pesquisas da Empresa',
    tipoPessoa: 'EMPRESA',
    nome: 'QSA',
    descricao: 'Quadro de Sócios e Administradores.',
    url: 'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp',
    obrigatoria: true,
    permiteUpload: true,
  },
  {
    id: 'chancela-digital',
    grupo: 'Pesquisas da Empresa',
    tipoPessoa: 'EMPRESA',
    nome: 'Chancela Digital do Contrato Social',
    descricao: 'Consulta de chancela digital na Junta Comercial.',
    url: 'https://www.jucerja.rj.gov.br/servicos/chanceladigital',
    obrigatoria: false,
    permiteUpload: true,
  },
  {
    id: 'sipes-pj',
    grupo: 'Pesquisas da Empresa',
    tipoPessoa: 'EMPRESA',
    nome: 'Sipes PJ',
    descricao: 'Pesquisa de restrições da empresa no SIPES.',
    url: 'https://sipes.caixa',
    obrigatoria: true,
    permiteUpload: true,
  },
  {
    id: 'cndt-pj',
    grupo: 'Pesquisas da Empresa',
    tipoPessoa: 'EMPRESA',
    nome: 'CNDT PJ',
    descricao: 'Certidão Negativa de Débitos Trabalhistas – PJ.',
    url: 'https://cndt-certidao.tst.jus.br/inicio.faces',
    obrigatoria: true,
    permiteUpload: true,
  },
  {
    id: 'cnd-pj',
    grupo: 'Pesquisas da Empresa',
    tipoPessoa: 'EMPRESA',
    nome: 'CND PJ',
    descricao: 'Certidão de Débitos Tributários Federais e Dívida Ativa da União.',
    url: 'https://servicos.receitafederal.gov.br/servico/certidoes/#/home',
    obrigatoria: true,
    permiteUpload: true,
  },
  {
    id: 'crf-pj',
    grupo: 'Pesquisas da Empresa',
    tipoPessoa: 'EMPRESA',
    nome: 'CRF FGTS PJ',
    descricao: 'Certificado de Regularidade do FGTS – PJ.',
    url: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
    obrigatoria: true,
    permiteUpload: true,
  },
  {
    id: 'jurir-pj',
    grupo: 'Pesquisas da Empresa',
    tipoPessoa: 'EMPRESA',
    nome: 'Jurir / Portal DIJUR PJ',
    descricao: 'Consulta ao Portal Jurídico da CAIXA.',
    url: 'http://www.portal.dijur.caixa/',
    obrigatoria: false,
    permiteUpload: true,
  },
  {
    id: 'trf2-pj',
    grupo: 'Pesquisas da Empresa',
    tipoPessoa: 'EMPRESA',
    nome: 'TRF 2ª Região PJ',
    descricao: 'Certidão do Tribunal Regional Federal da 2ª Região.',
    url: 'https://certidoes.trf2.jus.br/certidoes/#/principal/solicitar',
    obrigatoria: false,
    permiteUpload: true,
  },
  {
    id: 'sintegra-rj',
    grupo: 'Pesquisas da Empresa',
    tipoPessoa: 'EMPRESA',
    nome: 'Sintegra / RJ',
    descricao: 'Consulta cadastral no SINCAD / Sintegra RJ.',
    url: 'https://sincad-web.fazenda.rj.gov.br/sincad-web/index.jsf',
    obrigatoria: false,
    permiteUpload: true,
  },
];

export function gerarPesquisasEmpresa(): Pesquisa[] {
  return _DEF_EMPRESA.map(p => ({ ...p, selecionada: true }));
}

// ---------------------------------------------------------------------------
// Pesquisas dos Sócios (repetidas para cada sócio)
// ---------------------------------------------------------------------------
export function gerarPesquisasSocio(nome: string, cpf: string): Pesquisa[] {
  const sufixo  = cpf.replace(/[^\d]/g, '') || nome.replace(/\W+/g, '-');
  const grupo   = `Pesquisas – ${nome}`;
  const mk = (
    id: string,
    nomePesquisa: string,
    descricao: string,
    url: string,
    obrigatoria: boolean
  ): Pesquisa => ({
    id: `${id}-${sufixo}`,
    grupo,
    tipoPessoa: 'SOCIO',
    nome: nomePesquisa,
    descricao,
    url,
    selecionada: true,
    obrigatoria,
    permiteUpload: true,
  });

  return [
    mk('sipes-pf',      'Sipes PF',                       'Pesquisa de restrições do sócio no SIPES.',                                          'https://sipes.caixa',                                                                              true),
    mk('cpf-receita',   'Regularidade CPF Receita',        'Consulta de situação cadastral do CPF.',                                             'https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp',          true),
    mk('cndt-pf',       'CNDT PF',                         'Certidão Negativa de Débitos Trabalhistas – PF.',                                    'https://cndt-certidao.tst.jus.br/inicio.faces',                                                    true),
    mk('cnd-pf',        'CND PF',                          'Certidão de Débitos Tributários Federais e Dívida Ativa da União – PF.',              'https://servicos.receitafederal.gov.br/servico/certidoes/#/home',                                  true),
    mk('crf-pf',        'CRF FGTS PF',                     'Certificado de Regularidade do FGTS – PF.',                                          'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',                       false),
    mk('jurir-pf',      'Jurir / Portal DIJUR PF',         'Consulta ao Portal Jurídico da CAIXA – PF.',                                         'http://www.portal.dijur.caixa/',                                                                   false),
    mk('trf2-pf',       'TRF 2ª Região PF',                'Certidão do Tribunal Regional Federal da 2ª Região – PF.',                           'https://certidoes.trf2.jus.br/certidoes/#/principal/solicitar',                                   false),
    mk('sicod',         'SICOD – Conferência de Identidade','Conferência da identidade / RG pelo SICOD.',                                         'https://sicod.caixa/sicod/login',                                                                  false),
    mk('senatran-cnh',  'SENATRAN – Validar CNH',          'Validação de CNH no portal SENATRAN.',                                               'https://portalservicos.senatran.serpro.gov.br/#/condutor/validar-cnh',                             false),
  ];
}
