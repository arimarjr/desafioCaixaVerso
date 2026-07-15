/**
 * _gerador.util.ts — Utilitário interno de geração de dados fictícios.
 * Uso restrito ao módulo core/dados-mock.
 * Algoritmo Park-Miller LCG — determinístico: mesma seed → mesmos dados sempre.
 */

// ---------------------------------------------------------------------------
// RNG determinístico
// ---------------------------------------------------------------------------
export function criarRng(seed: number) {
  let s = seed % 2_147_483_647;
  if (s <= 0) s += 2_147_483_646;

  const next = (): number => {
    s = (s * 16_807) % 2_147_483_647;
    return (s - 1) / 2_147_483_646;
  };

  return {
    int:  (lo: number, hi: number): number => lo + Math.floor(next() * (hi - lo + 1)),
    pick: <T>(arr: T[]): T => arr[Math.floor(next() * arr.length)],
  };
}

// ---------------------------------------------------------------------------
// Formatadores
// ---------------------------------------------------------------------------

/**
 * CNPJ fictício: XX.XXX.XXX/0001-YY
 * prefixo=10 → Receita | prefixo=20 → sem restrição | prefixo=30 → com restrição
 */
export function formatarCNPJ(prefixo: number, seq: number): string {
  const base = prefixo * 1_000_000 + seq;
  const s = String(base).padStart(8, '0');
  const dv = String((seq % 98) + 1).padStart(2, '0');
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/0001-${dv}`;
}

/**
 * CPF fictício: XXX.XXX.XXX-00
 * prefixo=100 → sem restrição | prefixo=200 → com restrição
 */
export function formatarCPF(prefixo: number, seq: number): string {
  const base = prefixo * 1_000_000 + seq;
  const s = String(base).padStart(9, '0');
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-00`;
}

export function formatarData(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export function gerarTelefone(int: (lo: number, hi: number) => number): string {
  const ddd = int(11, 99);
  const p1  = int(90000, 99999);
  const p2  = int(1000, 9999);
  return `(${ddd}) ${p1}-${p2}`;
}

// ---------------------------------------------------------------------------
// Vocabulários — nomes corporativos
// ---------------------------------------------------------------------------

export const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
  'Dias', 'Moreira', 'Nunes', 'Cardoso', 'Machado', 'Mendes', 'Freitas',
  'Castro', 'Nascimento', 'Araujo', 'Cruz', 'Moura', 'Cavalcanti', 'Azevedo',
  'Monteiro', 'Campos', 'Teixeira', 'Cunha', 'Medeiros',
];

export const ATIVIDADES_EMP = [
  'Construções', 'Comércio', 'Serviços', 'Tecnologia', 'Soluções',
  'Engenharia', 'Consultoria', 'Investimentos', 'Transportes', 'Alimentos',
  'Logística', 'Energia', 'Saúde', 'Educação', 'Distribuidora',
  'Importadora', 'Exportadora', 'Imobiliária', 'Empreendimentos', 'Assessoria',
];

export const SUFIXOS_FANTASIA = [
  'Sol', 'Tech', 'Net', 'Plus', 'Max', 'Top', 'Digital', 'Smart', 'Pro',
  'Hub', 'Fast', 'Easy', 'Prime', 'Master', 'Mega', 'Power', 'Link',
  'Web', 'Ativa', 'Mais', 'Sul', 'Norte', 'Leste', 'Oeste', 'Group',
];

export const TIPOS_EMP = ['LTDA', 'S.A.', 'ME', 'EPP', 'EIRELI'];

export const NATUREZA_JURIDICA = [
  'Sociedade Empresária Limitada',
  'Sociedade Anônima',
  'Microempresa',
  'Empresa de Pequeno Porte - EPP',
  'Empresário Individual',
  'Empresa Individual de Responsabilidade Limitada - EIRELI',
];

export const CNAES = [
  '6201-5/01 - Desenvolvimento de Programas de Computador',
  '6202-3/00 - Desenvolvimento e Licenciamento de Software',
  '4120-4/00 - Construção de Edifícios',
  '4711-3/02 - Comércio Varejista de Mercadorias em Geral',
  '5611-2/01 - Restaurantes e Similares',
  '7490-1/04 - Atividades de Intermediação e Agenciamento',
  '4520-0/01 - Serviços de Manutenção e Reparação Mecânica',
  '8630-5/04 - Atividades de Saúde Humana',
  '4751-2/01 - Comércio Varejista Especializado em Informática',
  '1091-1/01 - Fabricação de Produtos de Padaria e Confeitaria',
  '4930-2/01 - Transporte Rodoviário de Carga',
  '6911-7/01 - Atividades Jurídicas e de Advocacia',
  '7320-3/00 - Pesquisas de Mercado e de Opinião Pública',
  '4645-1/01 - Comércio Atacadista de Instrumentos Médicos',
  '8520-1/00 - Educação Fundamental',
  '8610-1/01 - Atividades de Internação Hospitalar',
  '6810-2/01 - Compra e Venda de Imóveis Próprios',
  '7410-2/02 - Design de Interiores',
  '3600-6/01 - Distribuição de Água por Redes Urbanas',
  '4940-0/00 - Transporte de Cargas em Geral',
];

export const CIDADES: [string, string][] = [
  ['São Paulo',      'SP'], ['Rio de Janeiro',  'RJ'], ['Belo Horizonte', 'MG'],
  ['Porto Alegre',   'RS'], ['Curitiba',        'PR'], ['Recife',         'PE'],
  ['Salvador',       'BA'], ['Fortaleza',       'CE'], ['Manaus',         'AM'],
  ['Goiânia',        'GO'], ['Belém',           'PA'], ['Florianópolis',  'SC'],
  ['Maceió',         'AL'], ['Natal',           'RN'], ['Teresina',       'PI'],
  ['Campo Grande',   'MS'], ['João Pessoa',     'PB'], ['Aracaju',        'SE'],
  ['Cuiabá',         'MT'], ['Vitória',         'ES'],
];

export const LOGRADOUROS = [
  'Rua das Flores', 'Av. Paulista', 'Rua XV de Novembro', 'Av. Getúlio Vargas',
  'Rua Sete de Setembro', 'Av. Brasil', 'Rua da Independência', 'Rua Marechal Deodoro',
  'Av. República', 'Rua Dom Pedro II', 'Av. Presidente Vargas', 'Rua do Comércio',
  'Av. das Américas', 'Rua São João', 'Av. Ipiranga', 'Rua Direita',
  'Av. Rio Branco', 'Rua Voluntários da Pátria', 'Av. Brigadeiro Faria Lima',
  'Rua Barão de Itapetininga',
];

// ---------------------------------------------------------------------------
// Vocabulários — restrições
// ---------------------------------------------------------------------------

export const MOTIVOS_RESTRICAO_EMPRESA = [
  'Protestos em aberto no SERCASA',
  'Dívida ativa com a União acima de R$ 50.000',
  'Certidão Negativa de Débitos Tributários vencida',
  'Restrição registrada no SISBACEN',
  'Ação judicial de execução fiscal em andamento',
  'Certidão de Regularidade do FGTS vencida',
  'Débitos previdenciários em aberto',
  'Processo de recuperação judicial em andamento',
  'CNPJ com situação INAPTA na Receita Federal',
  'Restrição ativa no SPC/SERASA Empresarial',
  'Apontamentos negativos no BACEN JUD',
  'Cheques sem fundo registrados nos últimos 24 meses',
];

export const MOTIVOS_RESTRICAO_SOCIO = [
  'Restrição no SPC/SERASA',
  'Nome negativado em instituição financeira',
  'Ação de execução judicial em andamento',
  'Protestos em cartório registrados nos últimos 5 anos',
  'Dívida ativa com a Receita Federal',
  'Inadimplência comprovada nos últimos 12 meses',
  'Restrição no Cadastro de Emitentes de Cheques sem Fundo (CCF)',
  'Impedimento por participação em empresa com restrição ativa',
];

// ---------------------------------------------------------------------------
// Vocabulários — nomes de pessoas
// ---------------------------------------------------------------------------

export const NOMES_MASCULINOS = [
  'Carlos', 'João', 'Pedro', 'Luiz', 'Paulo', 'Marcos', 'Gabriel', 'Rafael',
  'Bruno', 'Felipe', 'Eduardo', 'Fernando', 'Ricardo', 'Alexandre', 'Rodrigo',
  'André', 'Gustavo', 'Leonardo', 'Daniel', 'Marcelo', 'Thiago', 'Diego',
  'Lucas', 'Vinicius', 'Caio', 'Matheus', 'Guilherme', 'Henrique', 'Renato', 'Sérgio',
];

export const NOMES_FEMININOS = [
  'Maria', 'Ana', 'Beatriz', 'Camila', 'Claudia', 'Daniela', 'Elaine', 'Fernanda',
  'Gabriela', 'Helena', 'Isabela', 'Juliana', 'Karen', 'Laura', 'Mariana',
  'Natalia', 'Patricia', 'Renata', 'Sandra', 'Tatiana', 'Vanessa', 'Viviane',
  'Amanda', 'Carolina', 'Luana', 'Leticia', 'Priscila', 'Adriana', 'Cristina', 'Simone',
];
