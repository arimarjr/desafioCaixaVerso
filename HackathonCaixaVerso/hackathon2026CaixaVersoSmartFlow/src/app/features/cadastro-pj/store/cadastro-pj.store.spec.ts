import { TestBed } from '@angular/core/testing';
import { CadastroPjStore } from './cadastro-pj.store';
import { EmpresaVm, FaturamentoAnualVm, SocioVm } from '../models/operacao-credito.vm';

const mockEmpresa: EmpresaVm = {
  cnpj: '11222333000181',
  razaoSocial: 'Tech Inovação LTDA',
  nomeFantasia: 'Tech Inovação',
  cnaePrincipal: '6201500',
  cnaeDescricao: 'Desenvolvimento de programas de computador sob encomenda',
  porteCaixa: 'PEQUENA EMPRESA',
  naturezaJuridica: 'Sociedade Limitada - LTDA',
  regimeTributario: 'SIMPLES NACIONAL',
  segmento: 'PEQUENA EMPRESA',
  dataConstituicao: '2015-03-10',
  tipoEmpresa: 'Tecnologia',
  dataDemonstracao: '',
  gerenteResponsavel: '',
  perfil: '',
  capitalSocial: 100000,
  documentoConstitutivo: '',
  ultimaAlteracao: '',
  situacaoCadastral: 'ATIVA',
  restricaoCadastral: false,
  telefone: '11999999999',
  email: 'contato@tech.com',
  cep: '01310100',
  logradouro: 'Av. Paulista',
  numero: '1000',
  complemento: '',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  uf: 'SP',
};

function criarSocio(id: string, participacao: number): SocioVm {
  return {
    id,
    cpf: '12345678901',
    nome: `Sócio ${id}`,
    funcao: 'Sócio',
    dataIngresso: '2015-03-10',
    participacaoPercentual: participacao,
    dadosPf: {
      cpf: '12345678901', nome: `Sócio ${id}`, dataNascimento: '', nomeMae: '',
      nomePai: '', nomeSocial: '', nacionalidade: 'Brasileiro(a)', naturalidade: '',
      sexo: 'M', segmento: '', grauInstrucao: '', estadoCivil: '', cpfConjuge: '',
      nomeConjuge: '', nascimentoConjuge: '', tipoDocumento: 'RG', numeroDocumento: '',
      emissorDocumento: '', ufDocumento: '', dataEmissaoDocumento: '',
      dataValidadeDocumento: '', orgaoEmissorDocumento: '', telefone: '', email: '',
      cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
      rendas: [], patrimonios: [],
    },
  };
}

function criarFaturamento(id: string, valor: number): FaturamentoAnualVm {
  return {
    id,
    anoReferencia: 2023,
    caracterizacao: 'APURADO',
    valor,
    dataAtualizacao: '2024-01-01',
    origemDados: 'DECLARADO',
    comprovada: 1,
  };
}

describe('CadastroPjStore', () => {
  let store: CadastroPjStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CadastroPjStore] });
    store = TestBed.inject(CadastroPjStore);
  });

  // ── Estado inicial ────────────────────────────────────────────────────────

  it('deve ter empresa nula no início', () => {
    expect(store.empresa()).toBeNull();
  });

  it('deve ter lista de sócios vazia no início', () => {
    expect(store.socios()).toEqual([]);
  });

  it('deve ter lista de faturamentos vazia no início', () => {
    expect(store.faturamentos()).toEqual([]);
  });

  it('deve ter etapaAtual = 0 no início', () => {
    expect(store.etapaAtual()).toBe(0);
  });

  it('deve ter carregando = false no início', () => {
    expect(store.carregando()).toBe(false);
  });

  it('deve ter carregandoCep = false no início', () => {
    expect(store.carregandoCep()).toBe(false);
  });

  it('deve ter erro = null no início', () => {
    expect(store.erro()).toBeNull();
  });

  it('possuiErro deve ser false no início', () => {
    expect(store.possuiErro()).toBe(false);
  });

  it('empresaCarregada deve ser false no início', () => {
    expect(store.empresaCarregada()).toBe(false);
  });

  it('totalParticipacao deve ser 0 no início', () => {
    expect(store.totalParticipacao()).toBe(0);
  });

  // ── definirEmpresa ────────────────────────────────────────────────────────

  it('definirEmpresa deve salvar a empresa', () => {
    store.definirEmpresa(mockEmpresa);
    expect(store.empresa()).toEqual(mockEmpresa);
  });

  it('empresaCarregada deve ser true após definirEmpresa', () => {
    store.definirEmpresa(mockEmpresa);
    expect(store.empresaCarregada()).toBe(true);
  });

  // ── definirCarregando ─────────────────────────────────────────────────────

  it('definirCarregando deve alterar o estado de loading', () => {
    store.definirCarregando(true);
    expect(store.carregando()).toBe(true);

    store.definirCarregando(false);
    expect(store.carregando()).toBe(false);
  });

  // ── definirErro ───────────────────────────────────────────────────────────

  it('definirErro deve setar a mensagem e possuiErro deve ser true', () => {
    store.definirErro('Empresa não encontrada');
    expect(store.erro()).toBe('Empresa não encontrada');
    expect(store.possuiErro()).toBe(true);
  });

  it('definirErro com null deve limpar o erro', () => {
    store.definirErro('erro');
    store.definirErro(null);
    expect(store.possuiErro()).toBe(false);
  });

  // ── Sócios ────────────────────────────────────────────────────────────────

  it('adicionarSocio deve inserir sócio na lista', () => {
    const socio = criarSocio('s1', 100);
    store.adicionarSocio(socio);
    expect(store.socios()).toHaveLength(1);
    expect(store.socios()[0]).toEqual(socio);
  });

  it('adicionarSocio múltiplos deve manter todos', () => {
    store.adicionarSocio(criarSocio('s1', 60));
    store.adicionarSocio(criarSocio('s2', 40));
    expect(store.socios()).toHaveLength(2);
  });

  it('atualizarSocio deve substituir o sócio pelo id', () => {
    store.adicionarSocio(criarSocio('s1', 100));
    const atualizado = criarSocio('s1', 80);
    atualizado.nome = 'Nome Atualizado';
    store.atualizarSocio(atualizado);

    expect(store.socios()[0].nome).toBe('Nome Atualizado');
    expect(store.socios()[0].participacaoPercentual).toBe(80);
  });

  it('removerSocio deve remover pelo id', () => {
    store.adicionarSocio(criarSocio('s1', 60));
    store.adicionarSocio(criarSocio('s2', 40));
    store.removerSocio('s1');

    expect(store.socios()).toHaveLength(1);
    expect(store.socios()[0].id).toBe('s2');
  });

  it('definirSocios deve substituir toda a lista', () => {
    store.adicionarSocio(criarSocio('s1', 100));
    const novos = [criarSocio('s2', 50), criarSocio('s3', 50)];
    store.definirSocios(novos);

    expect(store.socios()).toHaveLength(2);
    expect(store.socios()[0].id).toBe('s2');
  });

  // ── totalParticipacao ─────────────────────────────────────────────────────

  it('totalParticipacao com um sócio 100% deve ser 100', () => {
    store.adicionarSocio(criarSocio('s1', 100));
    expect(store.totalParticipacao()).toBe(100);
  });

  it('totalParticipacao com dois sócios deve somar as participações', () => {
    store.adicionarSocio(criarSocio('s1', 60));
    store.adicionarSocio(criarSocio('s2', 40));
    expect(store.totalParticipacao()).toBe(100);
  });

  it('totalParticipacao deve recalcular após remover sócio', () => {
    store.adicionarSocio(criarSocio('s1', 60));
    store.adicionarSocio(criarSocio('s2', 40));
    store.removerSocio('s2');
    expect(store.totalParticipacao()).toBe(60);
  });

  it('totalParticipacao maior que 100 é identificado', () => {
    store.adicionarSocio(criarSocio('s1', 70));
    store.adicionarSocio(criarSocio('s2', 60));
    expect(store.totalParticipacao()).toBeGreaterThan(100);
  });

  it('totalParticipacao menor que 100 é identificado', () => {
    store.adicionarSocio(criarSocio('s1', 60));
    expect(store.totalParticipacao()).toBeLessThan(100);
  });

  // ── Faturamentos ──────────────────────────────────────────────────────────

  it('adicionarFaturamento deve inserir faturamento na lista', () => {
    store.adicionarFaturamento(criarFaturamento('f1', 500000));
    expect(store.faturamentos()).toHaveLength(1);
  });

  it('atualizarFaturamento deve substituir pelo id', () => {
    store.adicionarFaturamento(criarFaturamento('f1', 500000));
    const atualizado = criarFaturamento('f1', 750000);
    store.atualizarFaturamento(atualizado);

    expect(store.faturamentos()[0].valor).toBe(750000);
  });

  it('removerFaturamento deve remover pelo id', () => {
    store.adicionarFaturamento(criarFaturamento('f1', 500000));
    store.adicionarFaturamento(criarFaturamento('f2', 600000));
    store.removerFaturamento('f1');

    expect(store.faturamentos()).toHaveLength(1);
    expect(store.faturamentos()[0].id).toBe('f2');
  });

  // ── definirEtapa ──────────────────────────────────────────────────────────

  it('definirEtapa deve atualizar a etapa atual', () => {
    store.definirEtapa(3);
    expect(store.etapaAtual()).toBe(3);
  });

  // ── limpar ────────────────────────────────────────────────────────────────

  it('limpar deve resetar empresa para null', () => {
    store.definirEmpresa(mockEmpresa);
    store.limpar();
    expect(store.empresa()).toBeNull();
  });

  it('limpar deve resetar sócios para lista vazia', () => {
    store.adicionarSocio(criarSocio('s1', 100));
    store.limpar();
    expect(store.socios()).toEqual([]);
  });

  it('limpar deve resetar faturamentos para lista vazia', () => {
    store.adicionarFaturamento(criarFaturamento('f1', 100000));
    store.limpar();
    expect(store.faturamentos()).toEqual([]);
  });

  it('limpar deve resetar etapa para 0', () => {
    store.definirEtapa(4);
    store.limpar();
    expect(store.etapaAtual()).toBe(0);
  });

  it('limpar deve resetar erro para null', () => {
    store.definirErro('Erro qualquer');
    store.limpar();
    expect(store.erro()).toBeNull();
  });

  it('limpar deve resetar carregando para false', () => {
    store.definirCarregando(true);
    store.limpar();
    expect(store.carregando()).toBe(false);
  });

  // ── definirCnpjPesquisado ─────────────────────────────────────────────────

  it('definirCnpjPesquisado deve salvar o CNPJ', () => {
    store.definirCnpjPesquisado('11222333000181');
    expect(store.cnpjPesquisado()).toBe('11222333000181');
  });

  // ── definirCarregandoCep ──────────────────────────────────────────────────

  it('definirCarregandoCep deve alterar o estado de carregamento do CEP', () => {
    store.definirCarregandoCep(true);
    expect(store.carregandoCep()).toBe(true);
  });
});
