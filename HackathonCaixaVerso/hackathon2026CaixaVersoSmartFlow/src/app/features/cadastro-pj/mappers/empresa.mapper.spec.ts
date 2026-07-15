import { mapearEmpresaVm, mapearSocioVmDeQsa } from './empresa.mapper';
import { EmpresaReceitaFederalDto } from '../models/empresa.dto';

function criarDtoBase(): EmpresaReceitaFederalDto {
  return {
    cnpj: '11222333000181',
    razao_social: 'Empresa Teste LTDA',
    nome_fantasia: 'Empresa Teste',
    cnae_fiscal: 6201500,
    cnae_fiscal_descricao: 'Desenvolvimento de software sob encomenda',
    natureza_juridica: 'Sociedade Limitada - LTDA',
    porte: 'EPP',
    data_inicio_atividade: '2015-03-10',
    situacao_cadastral: 'ATIVA',
    situacao_cadastral_data: '2024-01-01',
    logradouro: 'Av. Paulista',
    numero: '1000',
    complemento: 'Sala 1',
    bairro: 'Bela Vista',
    municipio: 'São Paulo',
    uf: 'SP',
    cep: '01310-100',
    ddd_telefone_1: '1133333333',
    email: 'contato@empresa.com',
    capital_social: 100000,
    qsa: [
      {
        identificador_socio: 'qsa-1',
        nome_socio_razao_social: 'Maria Silva',
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
}

describe('mapearEmpresaVm', () => {
  it('deve mapear CNPJ corretamente', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.cnpj).toBe('11222333000181');
  });

  it('deve mapear razão social', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.razaoSocial).toBe('Empresa Teste LTDA');
  });

  it('deve mapear nome fantasia', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.nomeFantasia).toBe('Empresa Teste');
  });

  it('deve usar string vazia quando nome fantasia é null', () => {
    const dto = { ...criarDtoBase(), nome_fantasia: null as any };
    const vm = mapearEmpresaVm(dto);
    expect(vm.nomeFantasia).toBe('');
  });

  it('deve converter cnae_fiscal para string', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.cnaePrincipal).toBe('6201500');
  });

  it('deve mapear descrição do CNAE', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.cnaeDescricao).toBe('Desenvolvimento de software sob encomenda');
  });

  it('deve mapear porte ME para MICRO EMPRESA', () => {
    const dto = { ...criarDtoBase(), porte: 'ME' };
    const vm = mapearEmpresaVm(dto);
    expect(vm.porteCaixa).toBe('MICRO EMPRESA');
  });

  it('deve mapear porte EPP para PEQUENA EMPRESA', () => {
    const dto = { ...criarDtoBase(), porte: 'EPP' };
    const vm = mapearEmpresaVm(dto);
    expect(vm.porteCaixa).toBe('PEQUENA EMPRESA');
  });

  it('deve mapear porte MEDIO para MÉDIA EMPRESA', () => {
    const dto = { ...criarDtoBase(), porte: 'MEDIO' };
    const vm = mapearEmpresaVm(dto);
    expect(vm.porteCaixa).toBe('MÉDIA EMPRESA');
  });

  it('deve mapear porte DEMAIS para GRANDE EMPRESA', () => {
    const dto = { ...criarDtoBase(), porte: 'DEMAIS' };
    const vm = mapearEmpresaVm(dto);
    expect(vm.porteCaixa).toBe('GRANDE EMPRESA');
  });

  it('deve preservar porte desconhecido como está', () => {
    const dto = { ...criarDtoBase(), porte: 'OUTRO' };
    const vm = mapearEmpresaVm(dto);
    expect(vm.porteCaixa).toBe('OUTRO');
  });

  it('deve mapear segmento igual ao porte mapeado', () => {
    const dto = { ...criarDtoBase(), porte: 'ME' };
    const vm = mapearEmpresaVm(dto);
    expect(vm.segmento).toBe('MICRO EMPRESA');
  });

  it('deve usar PEQUENA EMPRESA como segmento padrão para porte desconhecido', () => {
    const dto = { ...criarDtoBase(), porte: 'DESCONHECIDO' };
    const vm = mapearEmpresaVm(dto);
    expect(vm.segmento).toBe('PEQUENA EMPRESA');
  });

  it('deve mapear situação cadastral ATIVA', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.situacaoCadastral).toBe('ATIVA');
    expect(vm.restricaoCadastral).toBe(false);
  });

  it('deve mapear situação cadastral INAPTA como restrição', () => {
    const dto = { ...criarDtoBase(), situacao_cadastral: 'INAPTA' };
    const vm = mapearEmpresaVm(dto);
    expect(vm.situacaoCadastral).toBe('INAPTA');
    expect(vm.restricaoCadastral).toBe(true);
  });

  it('deve remover máscara do CEP', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.cep).toBe('01310100');
  });

  it('deve usar string vazia para cep nulo', () => {
    const dto = { ...criarDtoBase(), cep: null as any };
    const vm = mapearEmpresaVm(dto);
    expect(vm.cep).toBe('');
  });

  it('deve mapear logradouro, número, bairro, cidade e UF', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.logradouro).toBe('Av. Paulista');
    expect(vm.numero).toBe('1000');
    expect(vm.bairro).toBe('Bela Vista');
    expect(vm.cidade).toBe('São Paulo');
    expect(vm.uf).toBe('SP');
  });

  it('deve mapear telefone e email', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.telefone).toBe('1133333333');
    expect(vm.email).toBe('contato@empresa.com');
  });

  it('deve mapear capital social', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.capitalSocial).toBe(100000);
  });

  it('deve usar 0 quando capital_social é null', () => {
    const dto = { ...criarDtoBase(), capital_social: null as any };
    const vm = mapearEmpresaVm(dto);
    expect(vm.capitalSocial).toBe(0);
  });

  it('deve mapear data de constituição', () => {
    const vm = mapearEmpresaVm(criarDtoBase());
    expect(vm.dataConstituicao).toBe('2015-03-10');
  });
});

describe('mapearSocioVmDeQsa', () => {
  it('deve mapear nome do sócio', () => {
    const vm = mapearSocioVmDeQsa(criarDtoBase().qsa[0]);
    expect(vm.nome).toBe('Maria Silva');
  });

  it('deve mapear CPF do sócio', () => {
    const vm = mapearSocioVmDeQsa(criarDtoBase().qsa[0]);
    expect(vm.cpf).toBe('12345678901');
  });

  it('deve mapear percentual de participação', () => {
    const vm = mapearSocioVmDeQsa(criarDtoBase().qsa[0]);
    expect(vm.participacaoPercentual).toBe(100);
  });

  it('deve mapear data de ingresso', () => {
    const vm = mapearSocioVmDeQsa(criarDtoBase().qsa[0]);
    expect(vm.dataIngresso).toBe('2015-03-10');
  });

  it('deve definir função como Sócio por padrão', () => {
    const vm = mapearSocioVmDeQsa(criarDtoBase().qsa[0]);
    expect(vm.funcao).toBe('Sócio');
  });

  it('deve gerar UUID como id do sócio', () => {
    const vm = mapearSocioVmDeQsa(criarDtoBase().qsa[0]);
    expect(vm.id).toBeTruthy();
    expect(typeof vm.id).toBe('string');
  });

  it('deve usar string vazia quando cpf_do_socio é null', () => {
    const qsa = { ...criarDtoBase().qsa[0], cnpj_cpf_do_socio: null as any };
    const vm = mapearSocioVmDeQsa(qsa);
    expect(vm.cpf).toBe('');
  });

  it('deve usar 0 quando percentual_capital_social é null', () => {
    const qsa = { ...criarDtoBase().qsa[0], percentual_capital_social: null as any };
    const vm = mapearSocioVmDeQsa(qsa);
    expect(vm.participacaoPercentual).toBe(0);
  });

  it('deve preencher dadosPf.nome igual ao nome do sócio', () => {
    const vm = mapearSocioVmDeQsa(criarDtoBase().qsa[0]);
    expect(vm.dadosPf.nome).toBe('Maria Silva');
  });

  it('deve iniciar dadosPf com listas de rendas e patrimônios vazias', () => {
    const vm = mapearSocioVmDeQsa(criarDtoBase().qsa[0]);
    expect(vm.dadosPf.rendas).toEqual([]);
    expect(vm.dadosPf.patrimonios).toEqual([]);
  });

  it('deve definir nacionalidade padrão como Brasileiro(a)', () => {
    const vm = mapearSocioVmDeQsa(criarDtoBase().qsa[0]);
    expect(vm.dadosPf.nacionalidade).toBe('Brasileiro(a)');
  });
});
