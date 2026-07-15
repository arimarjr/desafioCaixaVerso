/**
 * 200 empresas NÃO cadastradas na CAIXA — dados básicos da Receita Federal.
 * CNPJs no intervalo 10.000.001/0001-** (prefixo 10 = Receita, não cadastrada).
 *
 * Fluxo de uso: ao digitar o CNPJ no cadastro, se o prefixo começar com "10.",
 * o sistema exibe esses dados pré-preenchidos e solicita complemento cadastral.
 */

import { EmpresaReceitaDto } from '../models/empresa.model';
import {
  criarRng, formatarCNPJ,
  SOBRENOMES, ATIVIDADES_EMP, SUFIXOS_FANTASIA, TIPOS_EMP, CNAES, NATUREZA_JURIDICA,
} from './_gerador.util';

function gerarEmpresasReceita(): EmpresaReceitaDto[] {
  const g = criarRng(202605181);

  return Array.from({ length: 200 }, (_, i) => {
    const s1       = g.pick(SOBRENOMES);
    const s2       = g.pick(SOBRENOMES);
    const ativ     = g.pick(ATIVIDADES_EMP);
    const sufixo   = g.pick(SUFIXOS_FANTASIA);
    const tipo     = g.pick(TIPOS_EMP);

    return {
      razaoSocial:      `${s1} & ${s2} ${ativ} ${tipo}`,
      nomeFantasia:     `${s1}${sufixo}`,
      cnpj:             formatarCNPJ(10, i + 1),
      cnaePrincipal:    g.pick(CNAES),
      naturezaJuridica: g.pick(NATUREZA_JURIDICA),
    };
  });
}

export const EMPRESAS_RECEITA: readonly EmpresaReceitaDto[] = gerarEmpresasReceita();
