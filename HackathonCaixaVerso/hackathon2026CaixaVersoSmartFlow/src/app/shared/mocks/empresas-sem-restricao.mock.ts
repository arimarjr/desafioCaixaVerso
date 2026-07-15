/**
 * 200 empresas COMPLETAS — SEM restrição cadastral.
 * CNPJs no intervalo 20.000.001/0001-** (prefixo 20 = cadastrada, limpa).
 * Score de crédito: 600–950 → situação APROVADO_AUTOMATICO ou ANALISE_MANUAL.
 */

import { EmpresaCompletaDto, avaliarSituacaoCredito } from '../models/empresa.model';
import {
  criarRng, formatarCNPJ, formatarData, gerarTelefone,
  SOBRENOMES, ATIVIDADES_EMP, SUFIXOS_FANTASIA, TIPOS_EMP,
  CNAES, NATUREZA_JURIDICA, CIDADES, LOGRADOUROS,
} from './_gerador.util';

function gerarEmpresasSemRestricao(): EmpresaCompletaDto[] {
  const g = criarRng(202605182);

  return Array.from({ length: 200 }, (_, i) => {
    const s1          = g.pick(SOBRENOMES);
    const s2          = g.pick(SOBRENOMES);
    const ativ        = g.pick(ATIVIDADES_EMP);
    const sufixo      = g.pick(SUFIXOS_FANTASIA);
    const tipo        = g.pick(TIPOS_EMP);
    const [cidade, uf] = g.pick(CIDADES);
    const score       = g.int(600, 950);
    const nomeF       = `${s1}${sufixo}`;

    return {
      razaoSocial:       `${s1} & ${s2} ${ativ} ${tipo}`,
      nomeFantasia:      nomeF,
      cnpj:              formatarCNPJ(20, i + 1),
      cnaePrincipal:     g.pick(CNAES),
      naturezaJuridica:  g.pick(NATUREZA_JURIDICA),
      dataAbertura:      formatarData(g.int(1995, 2022), g.int(1, 12), g.int(1, 28)),
      capitalSocial:     g.int(50, 5000) * 1000,
      faturamentoMensal: g.int(15, 1000) * 1000,
      endereco:          `${g.pick(LOGRADOUROS)}, ${g.int(1, 9999)}`,
      cidade,
      uf,
      email:             `contato@${nomeF.toLowerCase()}.com.br`,
      telefone:          gerarTelefone(g.int.bind(g)),
      scoreCredito:      score,
      possuiRestricao:   false,
      situacaoCredito:   avaliarSituacaoCredito(score, false),
    };
  });
}

export const EMPRESAS_SEM_RESTRICAO: readonly EmpresaCompletaDto[] = gerarEmpresasSemRestricao();
