import { TestBed } from '@angular/core/testing';
import { DadosMockService } from './dados-mock.service';

describe('DadosMockService', () => {
  let service: DadosMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DadosMockService);
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  // ── buscarEmpresaPorCNPJ ───────────────────────────────────────────────────

  it('deve retornar empresa da base receita por CNPJ sem máscara', () => {
    const empresas = service.listarEmpresasReceita();
    expect(empresas.length).toBeGreaterThan(0);
    const cnpj = empresas[0].cnpj.replace(/\D/g, '');
    const resultado = service.buscarEmpresaPorCNPJ(cnpj);
    expect(resultado).not.toBeNull();
    expect(resultado!.origem).toBe('receita');
  });

  it('deve retornar empresa da base cadastrada com prioridade sobre receita', () => {
    const empresas = service.listarEmpresasSemRestricao();
    if (empresas.length > 0) {
      const cnpj = empresas[0].cnpj.replace(/\D/g, '');
      const resultado = service.buscarEmpresaPorCNPJ(cnpj);
      expect(resultado).not.toBeNull();
      expect(resultado!.origem).toBe('cadastrada');
    }
  });

  it('deve retornar null para CNPJ inexistente', () => {
    expect(service.buscarEmpresaPorCNPJ('00000000000000')).toBeNull();
  });

  it('deve normalizar CNPJ com máscara', () => {
    const empresas = service.listarEmpresasReceita();
    const cnpjLimpo = empresas[0].cnpj.replace(/\D/g, '');
    const cnpjMascarado = cnpjLimpo.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    );
    const resultado = service.buscarEmpresaPorCNPJ(cnpjMascarado);
    expect(resultado).not.toBeNull();
  });

  // ── verificarRestricaoEmpresa ─────────────────────────────────────────────

  it('deve retornar false para empresa sem restrição', () => {
    const empresas = service.listarEmpresasSemRestricao();
    if (empresas.length > 0) {
      expect(service.verificarRestricaoEmpresa(empresas[0].cnpj)).toBe(false);
    }
  });

  it('deve retornar true para empresa com restrição', () => {
    const empresas = service.listarEmpresasComRestricao();
    if (empresas.length > 0) {
      expect(service.verificarRestricaoEmpresa(empresas[0].cnpj)).toBe(true);
    }
  });

  it('deve retornar false para CNPJ não cadastrado', () => {
    expect(service.verificarRestricaoEmpresa('00000000000000')).toBe(false);
  });

  // ── listagens ─────────────────────────────────────────────────────────────

  it('listarEmpresasSemRestricao deve retornar array', () => {
    expect(Array.isArray(service.listarEmpresasSemRestricao())).toBe(true);
  });

  it('listarEmpresasComRestricao deve retornar array', () => {
    expect(Array.isArray(service.listarEmpresasComRestricao())).toBe(true);
  });

  it('listarEmpresasReceita deve retornar array não vazio', () => {
    expect(service.listarEmpresasReceita().length).toBeGreaterThan(0);
  });

  // ── sócios ────────────────────────────────────────────────────────────────

  it('listarSocios deve retornar array', () => {
    expect(Array.isArray(service.listarSocios())).toBe(true);
  });

  it('buscarSocioPorCPF deve retornar sócio existente', () => {
    const socios = service.listarSocios();
    if (socios.length > 0) {
      const cpf = socios[0].cpf.replace(/\D/g, '');
      expect(service.buscarSocioPorCPF(cpf)).not.toBeNull();
    }
  });

  it('buscarSocioPorCPF deve retornar null para CPF inexistente', () => {
    expect(service.buscarSocioPorCPF('00000000000')).toBeNull();
  });

  it('verificarRestricaoSocio deve retornar false para CPF inexistente', () => {
    expect(service.verificarRestricaoSocio('00000000000')).toBe(false);
  });

  it('verificarRestricaoSocio deve retornar valor correto para sócio existente', () => {
    const socios = service.listarSocios();
    if (socios.length > 0) {
      const cpf = socios[0].cpf.replace(/\D/g, '');
      const resultado = service.verificarRestricaoSocio(cpf);
      expect(typeof resultado).toBe('boolean');
    }
  });

  it('listarSociosSemRestricao deve retornar somente socios sem restricao', () => {
    const semRestricao = service.listarSociosSemRestricao();
    semRestricao.forEach((s) => expect(s.possuiRestricao).toBe(false));
  });

  it('listarSociosComRestricao deve retornar somente socios com restricao', () => {
    const comRestricao = service.listarSociosComRestricao();
    comRestricao.forEach((s) => expect(s.possuiRestricao).toBe(true));
  });
});
