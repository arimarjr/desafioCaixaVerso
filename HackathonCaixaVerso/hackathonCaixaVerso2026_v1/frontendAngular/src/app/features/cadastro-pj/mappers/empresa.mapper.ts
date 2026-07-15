import { EmpresaMockDto, FaturamentoAnualMockDto, EmpresaReceitaFederalDto } from '../models/empresa.dto';
import { EmpresaVm, FaturamentoAnualVm, SocioVm } from '../models/operacao-credito.vm';

export function mapearEmpresaVm(dto: EmpresaReceitaFederalDto | EmpresaMockDto): EmpresaVm {
  // Se for EmpresaMockDto (tem cadastroEmpresa), mapeia direto
  if ('cadastroEmpresa' in dto) {
    const c = dto.cadastroEmpresa;
    return {
      cnpj:                c.cnpj,
      razaoSocial:         c.razaoSocial,
      nomeFantasia:        c.nomeFantasia ?? '',
      cnaePrincipal:       c.cnaePrincipal,
      cnaeDescricao:       c.descricaoCnaePrincipal,
      porteCaixa:          c.porteCaixa,
      naturezaJuridica:    c.naturezaJuridica,
      regimeTributario:    c.regimeTributario,
      segmento:            c.porteCaixa,
      dataConstituicao:    c.dataConstituicao,
      tipoEmpresa:         c.tipoEmpresa,
      dataDemonstracao:    c.dataDemonstracaoContabil ?? '',
      gerenteResponsavel:  '',
      perfil:              '',
      capitalSocial:       c.capitalSocial ?? 0,
      documentoConstitutivo: c.documentoConstitutivo ?? '',
      ultimaAlteracao:     c.dataUltimaAlteracao ?? '',
      situacaoCadastral:   c.restricaoCadastral ? 'INAPTA' : 'ATIVA',
      restricaoCadastral:  c.restricaoCadastral,
      telefone:            c.contatos?.telefoneComercial ?? '',
      email:               c.contatos?.emailPrincipal ?? '',
      cep:                 c.endereco?.cep?.replace(/[^\d]/g, '') ?? '',
      logradouro:          c.endereco?.logradouro ?? '',
      numero:              c.endereco?.numero ?? '',
      complemento:         c.endereco?.complemento ?? '',
      bairro:              c.endereco?.bairro ?? '',
      cidade:              c.endereco?.municipio ?? '',
      uf:                  c.endereco?.uf ?? '',
    };
  }

  // EmpresaReceitaFederalDto
  return {
    cnpj: dto.cnpj,
    razaoSocial: dto.razao_social,
    nomeFantasia: dto.nome_fantasia ?? '',
    cnaePrincipal: String(dto.cnae_fiscal),
    cnaeDescricao: dto.cnae_fiscal_descricao,
    porteCaixa: mapearPorte(dto.porte),
    naturezaJuridica: dto.natureza_juridica,
    regimeTributario: '',
    segmento: mapearSegmento(dto.porte),
    dataConstituicao: dto.data_inicio_atividade,
    tipoEmpresa: '',
    dataDemonstracao: '',
    gerenteResponsavel: '',
    perfil: '',
    capitalSocial: dto.capital_social ?? 0,
    documentoConstitutivo: '',
    ultimaAlteracao: '',
    situacaoCadastral: dto.situacao_cadastral,
    restricaoCadastral: dto.situacao_cadastral === 'INAPTA',
    telefone: dto.ddd_telefone_1 ?? '',
    email: dto.email ?? '',
    cep: dto.cep?.replace(/[^\d]/g, '') ?? '',
    logradouro: dto.logradouro ?? '',
    numero: dto.numero ?? '',
    complemento: dto.complemento ?? '',
    bairro: dto.bairro ?? '',
    cidade: dto.municipio ?? '',
    uf: dto.uf ?? '',
  };
}

export function mapearSocioVmDeQsa(qsa: EmpresaReceitaFederalDto['qsa'][0]): SocioVm {
  return {
    id: crypto.randomUUID(),
    cpf: qsa.cnpj_cpf_do_socio ?? '',
    nome: qsa.nome_socio_razao_social,
    funcao: 'Sócio',
    dataIngresso: qsa.data_entrada_sociedade ?? '',
    participacaoPercentual: qsa.percentual_capital_social ?? 0,
    dadosPf: {
      cpf: qsa.cnpj_cpf_do_socio ?? '',
      nome: qsa.nome_socio_razao_social,
      dataNascimento: '', nomeMae: '', nomePai: '', nomeSocial: '',
      nacionalidade: 'Brasileiro(a)', naturalidade: '',
      sexo: '', segmento: '', grauInstrucao: '', estadoCivil: '',
      cpfConjuge: '', nomeConjuge: '', nascimentoConjuge: '',
      tipoDocumento: 'RG', numeroDocumento: '', emissorDocumento: '',
      ufDocumento: '', dataEmissaoDocumento: '', dataValidadeDocumento: '',
      orgaoEmissorDocumento: '', telefone: '', email: '',
      cep: '', logradouro: '', numero: '', complemento: '',
      bairro: '', cidade: '', uf: '',
      rendas: [], patrimonios: [],
    },
  };
}

function mapearPorte(porte: string): string {
  const map: Record<string, string> = {
    'ME': 'MICRO EMPRESA',
    'EPP': 'PEQUENA EMPRESA',
    'MEDIO': 'MÉDIA EMPRESA',
    'DEMAIS': 'GRANDE EMPRESA',
  };
  return map[porte] ?? porte ?? '';
}

function mapearSegmento(porte: string): string {
  const map: Record<string, string> = {
    'ME': 'MICRO EMPRESA',
    'EPP': 'PEQUENA EMPRESA',
    'MEDIO': 'MÉDIA EMPRESA',
    'DEMAIS': 'GRANDE EMPRESA',
  };
  return map[porte] ?? 'PEQUENA EMPRESA';
}

export function mapearFaturamentoAnualVm(f: FaturamentoAnualMockDto): FaturamentoAnualVm {
  return {
    id:              crypto.randomUUID(),
    anoReferencia:   f.anoReferencia,
    caracterizacao:  f.caracterizacao,
    valor:           f.valor,
    dataAtualizacao: f.dataAtualizacao,
    origemDados:     f.origemDados,
    comprovada:      f.comprovada ?? 0,
  };
}
