/**
 * 200 empresas COMPLETAS — COM restrição cadastral.
 * CNPJs no intervalo 30.000.001/0001-** (prefixo 30 = cadastrada, com restrição).
 * Score de crédito: 150–449 → situação sempre REPROVADO_AUTOMATICO.
 * Ao digitar qualquer CNPJ com prefixo "30.", o alerta de restrição aparece automaticamente.
 */

import { EmpresaCompletaDto, avaliarSituacaoCredito } from '../models/empresa.model';
import {
  criarRng, formatarCNPJ, formatarData, gerarTelefone,
  SOBRENOMES, ATIVIDADES_EMP, SUFIXOS_FANTASIA, TIPOS_EMP,
  CNAES, NATUREZA_JURIDICA, CIDADES, LOGRADOUROS, MOTIVOS_RESTRICAO_EMPRESA,
} from './_gerador.util';

function gerarEmpresasComRestricao(): EmpresaCompletaDto[] {
  const g = criarRng(202605183);

  return Array.from({ length: 200 }, (_, i) => {
    const s1           = g.pick(SOBRENOMES);
    const s2           = g.pick(SOBRENOMES);
    const ativ         = g.pick(ATIVIDADES_EMP);
    const sufixo       = g.pick(SUFIXOS_FANTASIA);
    const tipo         = g.pick(TIPOS_EMP);
    const [cidade, uf]  = g.pick(CIDADES);
    const score        = g.int(150, 449);
    const nomeF        = `${s1}${sufixo}`;

    return {
      razaoSocial:       `${s1} & ${s2} ${ativ} ${tipo}`,
      nomeFantasia:      nomeF,
      cnpj:              formatarCNPJ(30, i + 1),
      cnaePrincipal:     g.pick(CNAES),
      naturezaJuridica:  g.pick(NATUREZA_JURIDICA),
      dataAbertura:      formatarData(g.int(1990, 2020), g.int(1, 12), g.int(1, 28)),
      capitalSocial:     g.int(10, 500) * 1000,
      faturamentoMensal: g.int(5, 200) * 1000,
      endereco:          `${g.pick(LOGRADOUROS)}, ${g.int(1, 9999)}`,
      cidade,
      uf,
      email:             `contato@${nomeF.toLowerCase()}.com.br`,
      telefone:          gerarTelefone(g.int.bind(g)),
      scoreCredito:      score,
      possuiRestricao:   true,
      motivoRestricao:   g.pick(MOTIVOS_RESTRICAO_EMPRESA),
      situacaoCredito:   avaliarSituacaoCredito(score, true),
    };
  });
}

export const EMPRESAS_COM_RESTRICAO: readonly EmpresaCompletaDto[] = gerarEmpresasComRestricao();
