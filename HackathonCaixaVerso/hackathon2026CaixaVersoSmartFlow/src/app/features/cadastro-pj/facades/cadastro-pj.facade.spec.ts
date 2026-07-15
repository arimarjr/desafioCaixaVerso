import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CadastroPjFacade } from './cadastro-pj.facade';
import { CadastroPjStore } from '../store/cadastro-pj.store';
import { CadastroPjDataAccess } from '../data-access/cadastro-pj.data-access';
import { EmpresaVm, FaturamentoAnualVm, SocioVm } from '../models/operacao-credito.vm';
import { EmpresaReceitaFederalDto } from '../models/empresa.dto';

const mockEmpresaDto: EmpresaReceitaFederalDto = {
  cnpj: '11222333000181',
  razao_social: 'Empresa Teste LTDA',
  nome_fantasia: 'Empresa Teste',
  cnae_fiscal: 6201500,
  cnae_fiscal_descricao: 'Desenvolvimento de software',
  natureza_juridica: 'Sociedade Limitada - LTDA',
  porte: 'EPP',
  data_inicio_atividade: '2015-03-10',
  situacao_cadastral: 'ATIVA',
  situacao_cadastral_data: '',
  logradouro: 'Av. Paulista',
  numero: '1000',
  complemento: '',
  bairro: 'Bela Vista',
  municipio: 'São Paulo',
  uf: 'SP',
  cep: '01310100',
  ddd_telefone_1: '11999999999',
  email: 'contato@empresa.com',
  capital_social: 100000,
  qsa: [
    {
      identificador_socio: '1',
      nome_socio_razao_social: 'Ana Lima',
      cnpj_cpf_do_socio: '12345678901',
      codigo_qualificacao_socio: 0,
      percentual_capital_social: 100,
      data_entrada_sociedade: '2015-03-10',
      cpf_representante_legal: '',
      nome_representante_legal: '',
      codigo_qualificacao_representante_legal: null,
    },
  ],
};

const mockEmpresaVm: EmpresaVm = {
  cnpj: '11222333000181',
  razaoSocial: 'Empresa Teste LTDA',
  nomeFantasia: 'Empresa Teste',
  cnaePrincipal: '6201500',
  cnaeDescricao: 'Desenvolvimento de software',
  porteCaixa: 'PEQUENA EMPRESA',
  naturezaJuridica: 'Sociedade Limitada - LTDA',
  regimeTributario: '',
  segmento: 'PEQUENA EMPRESA',
  dataConstituicao: '2015-03-10',
  tipoEmpresa: '',
  dataDemonstracao: '',
  gerenteResponsavel: '',
  perfil: '',
  capitalSocial: 100000,
  documentoConstitutivo: '',
  ultimaAlteracao: '',
  situacaoCadastral: 'ATIVA',
  restricaoCadastral: false,
  telefone: '11999999999',
  email: 'contato@empresa.com',
  cep: '01310100',
  logradouro: 'Av. Paulista',
  numero: '1000',
  complemento: '',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  uf: 'SP',
};

function criarSocio(id: string): SocioVm {
  return {
    id,
    cpf: '12345678901',
    nome: 'Sócio Teste',
    funcao: 'Sócio',
    dataIngresso: '2020-01-01',
    participacaoPercentual: 100,
    dadosPf: {
      cpf: '12345678901', nome: 'Sócio Teste', dataNascimento: '', nomeMae: '', nomePai: '',
      nomeSocial: '', nacionalidade: 'Brasileiro(a)', naturalidade: '', sexo: 'M',
      segmento: '', grauInstrucao: '', estadoCivil: '', cpfConjuge: '', nomeConjuge: '',
      nascimentoConjuge: '', tipoDocumento: 'RG', numeroDocumento: '', emissorDocumento: '',
      ufDocumento: '', dataEmissaoDocumento: '', dataValidadeDocumento: '',
      orgaoEmissorDocumento: '', telefone: '', email: '', cep: '', logradouro: '', numero: '',
      complemento: '', bairro: '', cidade: '', uf: '', rendas: [], patrimonios: [],
    },
  };
}

function criarFaturamento(): FaturamentoAnualVm {
  return {
    id: 'f1',
    anoReferencia: 2023,
    caracterizacao: 'APURADO',
    valor: 500000,
    dataAtualizacao: '2024-01-01',
    origemDados: 'DECLARADO',
    comprovada: 1,
  };
}

describe('CadastroPjFacade', () => {
  let facade: CadastroPjFacade;
  let store: CadastroPjStore;
  let dataAccessMock: Partial<CadastroPjDataAccess>;

  beforeEach(() => {
    dataAccessMock = {
      buscarEmpresaReceita: vi.fn().mockReturnValue(of(mockEmpresaDto)),
      buscarCep: vi.fn().mockReturnValue(of(null)),
      avaliarEmpresa: vi.fn().mockReturnValue(of({
        resultado: 'APROVADO',
        justificativa: 'Boa situação financeira',
        limiteAprovado: 100000,
        classificacaoRisco: 'A',
        scoreInterno: 850,
        dataAvaliacao: '2024-01-01',
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        CadastroPjFacade,
        CadastroPjStore,
        { provide: CadastroPjDataAccess, useValue: dataAccessMock },
      ],
    });

    facade = TestBed.inject(CadastroPjFacade);
    store = TestBed.inject(CadastroPjStore);
  });

  // ── buscarEmpresa ─────────────────────────────────────────────────────────

  it('deve chamar dataAccess.buscarEmpresaReceita com CNPJ', () => {
    facade.buscarEmpresa('11222333000181');
    expect(dataAccessMock.buscarEmpresaReceita).toHaveBeenCalledWith('11222333000181');
  });

  it('deve setar carregando=true antes da busca', () => {
    (dataAccessMock.buscarEmpresaReceita as any).mockReturnValue(
      new (require('rxjs').Subject)()
    );
    facade.buscarEmpresa('11222333000181');
    expect(store.carregando()).toBe(true);
  });

  it('deve setar carregando=false após busca com sucesso', () => {
    facade.buscarEmpresa('11222333000181');
    expect(store.carregando()).toBe(false);
  });

  it('deve atualizar a empresa no store após busca com sucesso', () => {
    facade.buscarEmpresa('11222333000181');
    expect(store.empresa()).not.toBeNull();
    expect(store.empresa()?.cnpj).toBe('11222333000181');
  });

  it('deve atualizar os sócios no store após busca com sucesso', () => {
    facade.buscarEmpresa('11222333000181');
    expect(store.socios()).toHaveLength(1);
    expect(store.socios()[0].nome).toBe('Ana Lima');
  });

  it('deve setar mensagem de erro quando busca falha', () => {
    (dataAccessMock.buscarEmpresaReceita as any).mockReturnValue(
      throwError(() => new Error('Not found'))
    );
    facade.buscarEmpresa('99999999000199');
    expect(store.possuiErro()).toBe(true);
    expect(store.erro()).toContain('Empresa não encontrada');
  });

  it('deve limpar erro antes da busca', () => {
    store.definirErro('Erro anterior');
    facade.buscarEmpresa('11222333000181');
    expect(store.erro()).toBeNull();
  });

  it('deve setar carregando=false quando busca falha', () => {
    (dataAccessMock.buscarEmpresaReceita as any).mockReturnValue(
      throwError(() => new Error('fail'))
    );
    facade.buscarEmpresa('99999999000199');
    expect(store.carregando()).toBe(false);
  });

  // ── salvarEmpresa ─────────────────────────────────────────────────────────

  it('salvarEmpresa deve atualizar a empresa no store', () => {
    facade.salvarEmpresa(mockEmpresaVm);
    expect(store.empresa()).toEqual(mockEmpresaVm);
  });

  // ── adicionarSocio ────────────────────────────────────────────────────────

  it('adicionarSocio deve inserir sócio na store', () => {
    const socio = criarSocio('');
    facade.adicionarSocio(socio);
    expect(store.socios()).toHaveLength(1);
  });

  it('adicionarSocio deve gerar id UUID quando id está vazio', () => {
    const socio = criarSocio('');
    facade.adicionarSocio(socio);
    expect(store.socios()[0].id).toBeTruthy();
    expect(store.socios()[0].id.length).toBeGreaterThan(0);
  });

  it('adicionarSocio deve preservar id quando já fornecido', () => {
    const socio = criarSocio('id-especifico');
    facade.adicionarSocio(socio);
    expect(store.socios()[0].id).toBe('id-especifico');
  });

  // ── atualizarSocio ────────────────────────────────────────────────────────

  it('atualizarSocio deve atualizar o sócio existente', () => {
    const socio = criarSocio('s1');
    store.adicionarSocio(socio);
    const atualizado = { ...socio, nome: 'Novo Nome' };
    facade.atualizarSocio(atualizado);
    expect(store.socios()[0].nome).toBe('Novo Nome');
  });

  // ── removerSocio ──────────────────────────────────────────────────────────

  it('removerSocio deve remover o sócio da store', () => {
    store.adicionarSocio(criarSocio('s1'));
    facade.removerSocio('s1');
    expect(store.socios()).toHaveLength(0);
  });

  // ── Faturamentos ──────────────────────────────────────────────────────────

  it('adicionarFaturamento deve inserir faturamento na store', () => {
    facade.adicionarFaturamento(criarFaturamento());
    expect(store.faturamentos()).toHaveLength(1);
  });

  it('adicionarFaturamento deve gerar id UUID quando vazio', () => {
    const fat = { ...criarFaturamento(), id: '' };
    facade.adicionarFaturamento(fat);
    expect(store.faturamentos()[0].id).toBeTruthy();
  });

  it('atualizarFaturamento deve atualizar o faturamento existente', () => {
    store.adicionarFaturamento(criarFaturamento());
    const atualizado = { ...criarFaturamento(), valor: 999999 };
    facade.atualizarFaturamento(atualizado);
    expect(store.faturamentos()[0].valor).toBe(999999);
  });

  it('removerFaturamento deve remover da store', () => {
    store.adicionarFaturamento(criarFaturamento());
    facade.removerFaturamento('f1');
    expect(store.faturamentos()).toHaveLength(0);
  });

  // ── avancarEtapa ──────────────────────────────────────────────────────────

  it('avancarEtapa deve incrementar a etapa atual', () => {
    expect(store.etapaAtual()).toBe(0);
    facade.avancarEtapa();
    expect(store.etapaAtual()).toBe(1);
  });

  it('avancarEtapa múltiplas vezes deve incrementar corretamente', () => {
    facade.avancarEtapa();
    facade.avancarEtapa();
    expect(store.etapaAtual()).toBe(2);
  });

  // ── avaliarEmpresa ────────────────────────────────────────────────────────

  it('avaliarEmpresa deve chamar dataAccess.avaliarEmpresa com CNPJ e dados', () => {
    const dados = {
      dataReferencia: '2024-01-01',
      documentoFaturamento: '1' as const,
      dataUltimaAtualizacaoContratual: '2024-01-01',
      alterouSociosMaior50: false,
      excluiuAdministradoresAnteriores: false,
      alterouObjetoSocial: false,
      alterouCnaePrincipal: false,
      alterouMunicipio: false,
      deixouSerSociedadeSimples: false,
      pvResponsavel: 'c123456',
    };

    facade.avaliarEmpresa('11222333000181', dados).subscribe();

    expect(dataAccessMock.avaliarEmpresa).toHaveBeenCalledWith('11222333000181', dados);
  });

  it('avaliarEmpresa deve retornar Observable com resultado', (done) => {
    const dados = {
      dataReferencia: '2024-01-01',
      documentoFaturamento: '1' as const,
      dataUltimaAtualizacaoContratual: '2024-01-01',
      alterouSociosMaior50: false, excluiuAdministradoresAnteriores: false,
      alterouObjetoSocial: false, alterouCnaePrincipal: false,
      alterouMunicipio: false, deixouSerSociedadeSimples: false,
      pvResponsavel: 'c123456',
    };

    facade.avaliarEmpresa('11222333000181', dados).subscribe((result) => {
      expect(result.resultado).toBe('APROVADO');
      expect(result.limiteAprovado).toBe(100000);
      done();
    });
  });

  // ── buscarCep ─────────────────────────────────────────────────────────────

  it('buscarCep deve chamar dataAccess com o CEP', () => {
    facade.buscarCep('01310100', vi.fn());
    expect(dataAccessMock.buscarCep).toHaveBeenCalledWith('01310100');
  });

  it('buscarCep deve chamar callback quando endereço encontrado', () => {
    const endereco = { logradouro: 'Av. Paulista', bairro: 'Bela Vista', localidade: 'São Paulo', uf: 'SP' };
    (dataAccessMock.buscarCep as any).mockReturnValue(of(endereco));

    const callback = vi.fn();
    facade.buscarCep('01310100', callback);

    expect(callback).toHaveBeenCalledWith('Av. Paulista', 'Bela Vista', 'São Paulo', 'SP');
  });

  it('buscarCep não deve chamar callback quando CEP não encontrado', () => {
    (dataAccessMock.buscarCep as any).mockReturnValue(of(null));

    const callback = vi.fn();
    facade.buscarCep('00000000', callback);

    expect(callback).not.toHaveBeenCalled();
  });

  // ── limpar ────────────────────────────────────────────────────────────────

  it('limpar deve resetar a store', () => {
    store.definirEmpresa(mockEmpresaVm);
    store.adicionarSocio(criarSocio('s1'));
    facade.limpar();
    expect(store.empresa()).toBeNull();
    expect(store.socios()).toHaveLength(0);
  });

  // ── Exposição dos sinais da store ─────────────────────────────────────────

  it('facade.empresa deve ser o mesmo signal da store', () => {
    store.definirEmpresa(mockEmpresaVm);
    expect(facade.empresa()).toEqual(mockEmpresaVm);
  });

  it('facade.carregando deve refletir o estado da store', () => {
    store.definirCarregando(true);
    expect(facade.carregando()).toBe(true);
  });

  it('facade.socios deve refletir a lista da store', () => {
    store.adicionarSocio(criarSocio('s1'));
    expect(facade.socios()).toHaveLength(1);
  });
});
