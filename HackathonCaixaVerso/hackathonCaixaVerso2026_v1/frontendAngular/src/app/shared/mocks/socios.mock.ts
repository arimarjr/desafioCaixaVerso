/**
 * 500 Pessoas Físicas fictícias — sócios de empresas PJ.
 *   • Índices 0–479  (480 registros): SEM restrição | CPF prefixo 100 | score 550–950
 *   • Índices 480–499 (20 registros): COM restrição  | CPF prefixo 200 | score 100–390
 *
 * CPFs claramente fictícios: terminam em "-00" (não passam no algoritmo de validação real).
 */

import { SocioDto } from '../models/socio.model';
import {
  criarRng, formatarCPF, formatarData, gerarTelefone,
  SOBRENOMES, NOMES_MASCULINOS, NOMES_FEMININOS, MOTIVOS_RESTRICAO_SOCIO,
} from './_gerador.util';

const TOTAL          = 500;
const COM_RESTRICAO  = 20;
const SEM_RESTRICAO  = TOTAL - COM_RESTRICAO; // 480

function gerarSocios(): SocioDto[] {
  const g = criarRng(202605184);

  return Array.from({ length: TOTAL }, (_, i) => {
    const possuiRestricao = i >= SEM_RESTRICAO;

    const masculino   = g.int(0, 1) === 0;
    const primNome    = masculino ? g.pick(NOMES_MASCULINOS) : g.pick(NOMES_FEMININOS);
    const sobrenome1  = g.pick(SOBRENOMES);
    const sobrenome2  = g.pick(SOBRENOMES);
    const nome        = `${primNome} ${sobrenome1} ${sobrenome2}`;

    // CPF: prefixo 100 para sem restrição, prefixo 200 para com restrição
    // seq reinicia em 1 para cada grupo
    const prefixo = possuiRestricao ? 200 : 100;
    const seq     = possuiRestricao ? (i - SEM_RESTRICAO + 1) : (i + 1);

    const score = possuiRestricao ? g.int(100, 390) : g.int(550, 950);

    const socio: SocioDto = {
      nome,
      cpf:             formatarCPF(prefixo, seq),
      dataNascimento:  formatarData(g.int(1950, 1998), g.int(1, 12), g.int(1, 28)),
      rendaMensal:     possuiRestricao ? g.int(1200, 5000) : g.int(2000, 50000),
      scoreCredito:    score,
      possuiRestricao,
      email:           `${primNome.toLowerCase()}.${sobrenome1.toLowerCase()}${seq}@email.com.br`,
      telefone:        gerarTelefone(g.int.bind(g)),
    };

    if (possuiRestricao) {
      socio.motivoRestricao = g.pick(MOTIVOS_RESTRICAO_SOCIO);
    }

    return socio;
  });
}

export const SOCIOS: readonly SocioDto[] = gerarSocios();
