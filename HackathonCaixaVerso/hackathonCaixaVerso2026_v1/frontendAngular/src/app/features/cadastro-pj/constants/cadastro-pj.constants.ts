// ---------------------------------------------------------------------------
// Opções de selects / listas fechadas da feature Cadastro PJ
// ---------------------------------------------------------------------------
import { EtapaStatus } from '../types/status-operacao.type';

export const PORTES_CAIXA = [
  'MICRO EMPRESA',
  'PEQUENA EMPRESA',
  'MÉDIA EMPRESA',
  'GRANDE EMPRESA',
  'CONGLOMERADO',
];

export const NATUREZAS_JURIDICAS = [
  'Empresário Individual',
  'Sociedade Limitada - LTDA',
  'Sociedade Anônima - S.A.',
  'Empresa Individual de Responsabilidade Limitada - EIRELI',
  'Microempreendedor Individual - MEI',
  'Cooperativa',
  'Associação',
  'Fundação',
  'Outros',
];

export const REGIMES_TRIBUTARIOS = [
  'SIMPLES NACIONAL',
  'LUCRO PRESUMIDO',
  'LUCRO REAL',
  'LUCRO ARBITRADO',
  'IMUNE / ISENTA',
];

export const SEGMENTOS_PJ = [
  'MICRO EMPRESA',
  'PEQUENA EMPRESA',
  'MÉDIA EMPRESA',
  'GRANDE EMPRESA',
  'PODER PÚBLICO',
  'TERCEIRO SETOR',
];

export const TIPOS_EMPRESA = [
  'Comercial',
  'Industrial',
  'Prestadora de Serviços',
  'Rural / Agronegócio',
  'Financeiro',
  'Tecnologia',
  'Saúde',
  'Educação',
  'Construção Civil',
  'Transporte e Logística',
  'Outros',
];

export const FUNCOES_SOCIO = [
  'Sócio',
  'Sócio-Administrador',
  'Administrador',
  'Procurador',
  'Diretor',
  'Presidente',
];

export const NACIONALIDADES = [
  'Brasileiro(a)',
  'Argentino(a)',
  'Boliviano(a)',
  'Chileno(a)',
  'Colombiano(a)',
  'Espanhol(a)',
  'Estadunidense',
  'Francês/Francesa',
  'Italiano(a)',
  'Japonês/Japonesa',
  'Paraguaio(a)',
  'Peruano(a)',
  'Português(a)',
  'Uruguaio(a)',
  'Venezuelano(a)',
  'Outro',
];

export const SEXOS: { value: string; label: string }[] = [
  { value: 'M',  label: 'Masculino' },
  { value: 'F',  label: 'Feminino' },
  { value: 'NB', label: 'Não Binário' },
  { value: 'ND', label: 'Não Declarado' },
];

export const GRAUS_INSTRUCAO = [
  'Sem instrução',
  'Fundamental Incompleto',
  'Fundamental Completo',
  'Médio Incompleto',
  'Médio Completo',
  'Superior Incompleto',
  'Superior Completo',
  'Pós-Graduação / MBA',
  'Mestrado',
  'Doutorado',
];

export const ESTADOS_CIVIS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Separado(a)',
  'Viúvo(a)',
  'União Estável',
];

export const TIPOS_DOCUMENTO: { value: string; label: string }[] = [
  { value: 'RG',         label: 'Identidade (RG)' },
  { value: 'CNH',        label: 'CNH' },
  { value: 'PASSAPORTE', label: 'Passaporte' },
  { value: 'RNE',        label: 'RNE - Registro Nacional de Estrangeiro' },
  { value: 'CTPS',       label: 'Carteira de Trabalho' },
  { value: 'OUTRO',      label: 'Outro' },
];

export const ORIGENS_RENDA = [
  'CLT / Empregado',
  'Empresário / Sócio',
  'Autônomo',
  'Aposentadoria',
  'Aluguel',
  'Pensão',
  'Investimento',
  'Rural',
  'Outro',
];

export const SEGMENTOS_PF = [
  'VAREJO',
  'PERSONALITE',
  'PRIVATE',
  'MICROEMPREENDEDOR',
  'FUNCIONÁRIO PÚBLICO',
];

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const LINHAS_CREDITO = [
  'Capital de Giro',
  'PRONAMPE',
  'Crédito Imobiliário PJ',
  'Financiamento de Equipamentos',
  'Desconto de Recebíveis',
  'Conta Garantida',
  'Antecipação de Recebíveis',
  'BNDES',
  'FNO / FNE / FCO',
  'Microcrédito',
];

export const ORIGENS_FATURAMENTO = [
  'CAIXA',
  'SERASA',
  'BACEN',
  'RECEITA FEDERAL',
  'DECLARATÓRIA',
  'OUTRA',
];

export const ETAPAS_OPERACAO: EtapaStatus[] = [
  { etapa: 'cadastro',              label: 'Cadastro',                status: 'pendente' },
  { etapa: 'avaliacao-credito',     label: 'Avaliação do Crédito',    status: 'pendente' },
  { etapa: 'pesquisas',             label: 'Pesquisas',               status: 'pendente' },
  { etapa: 'simulacao',             label: 'Simulação',               status: 'pendente' },
  { etapa: 'contrato-assinatura',   label: 'Contrato e Assinatura',   status: 'pendente' },
  { etapa: 'conformidade',          label: 'Conformidade',            status: 'pendente' },
  { etapa: 'finalizado',            label: 'Finalizado',              status: 'pendente' },
];

