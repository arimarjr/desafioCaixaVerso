import { Injectable } from '@angular/core';
import { EmpresaCompletaDto, EmpresaReceitaDto } from '../../shared/models/empresa.model';
import { SocioDto } from '../../shared/models/socio.model';
import { EMPRESAS_RECEITA } from '../../shared/mocks/empresas-receita.mock';
import { EMPRESAS_SEM_RESTRICAO } from '../../shared/mocks/empresas-sem-restricao.mock';
import { EMPRESAS_COM_RESTRICAO } from '../../shared/mocks/empresas-com-restricao.mock';
import { SOCIOS } from '../../shared/mocks/socios.mock';

export type OrigemEmpresa = 'receita' | 'cadastrada';

export interface ResultadoBuscaEmpresa {
  origem: OrigemEmpresa;
  dados: EmpresaReceitaDto | EmpresaCompletaDto;
}

// ---------------------------------------------------------------------------
// Normalização de documentos para chaves de índice
// ---------------------------------------------------------------------------
function normCNPJ(cnpj: string): string { return cnpj.replace(/\D/g, ''); }
function normCPF(cpf: string): string   { return cpf.replace(/\D/g, '');  }

/**
 * Serviço de dados mock — simula chamadas à API de crédito.
 * Todos os índices são pré-computados (Map) para busca O(1).
 *
 * Em produção: substituir os métodos por chamadas HTTP ao backend
 * mantendo a mesma assinatura de retorno.
 */
@Injectable({ providedIn: 'root' })
export class DadosMockService {

  // --- Índices --- //
  private readonly idxReceita = new Map<string, EmpresaReceitaDto>(
    EMPRESAS_RECEITA.map(e => [normCNPJ(e.cnpj), e]),
  );

  private readonly idxCompleta = new Map<string, EmpresaCompletaDto>(
    [...EMPRESAS_SEM_RESTRICAO, ...EMPRESAS_COM_RESTRICAO].map(e => [normCNPJ(e.cnpj), e]),
  );

  private readonly idxSocio = new Map<string, SocioDto>(
    SOCIOS.map(s => [normCPF(s.cpf), s]),
  );

  // ---------------------------------------------------------------------------
  // Empresas
  // ---------------------------------------------------------------------------

  /**
   * Busca empresa por CNPJ em todas as bases.
   * Retorna `null` se não encontrada.
   * Prioridade: base cadastrada > base Receita.
   */
  buscarEmpresaPorCNPJ(cnpj: string): ResultadoBuscaEmpresa | null {
    const key = normCNPJ(cnpj);

    const completa = this.idxCompleta.get(key);
    if (completa) return { origem: 'cadastrada', dados: completa };

    const receita = this.idxReceita.get(key);
    if (receita)  return { origem: 'receita', dados: receita };

    return null;
  }

  /**
   * Retorna `true` se a empresa possui restrição cadastral ativa.
   * Usado para bloquear automaticamente a análise de crédito.
   */
  verificarRestricaoEmpresa(cnpj: string): boolean {
    const empresa = this.idxCompleta.get(normCNPJ(cnpj));
    return empresa?.possuiRestricao ?? false;
  }

  listarEmpresasSemRestricao(): readonly EmpresaCompletaDto[] {
    return EMPRESAS_SEM_RESTRICAO;
  }

  listarEmpresasComRestricao(): readonly EmpresaCompletaDto[] {
    return EMPRESAS_COM_RESTRICAO;
  }

  listarEmpresasReceita(): readonly EmpresaReceitaDto[] {
    return EMPRESAS_RECEITA;
  }

  // ---------------------------------------------------------------------------
  // Sócios / Pessoas Físicas
  // ---------------------------------------------------------------------------

  /**
   * Busca sócio por CPF.
   * Retorna `null` se não encontrado.
   */
  buscarSocioPorCPF(cpf: string): SocioDto | null {
    return this.idxSocio.get(normCPF(cpf)) ?? null;
  }

  /**
   * Retorna `true` se a pessoa possui restrição cadastral ativa.
   */
  verificarRestricaoSocio(cpf: string): boolean {
    return this.idxSocio.get(normCPF(cpf))?.possuiRestricao ?? false;
  }

  listarSocios(): readonly SocioDto[] {
    return SOCIOS;
  }

  listarSociosSemRestricao(): readonly SocioDto[] {
    return SOCIOS.filter(s => !s.possuiRestricao);
  }

  listarSociosComRestricao(): readonly SocioDto[] {
    return SOCIOS.filter(s => s.possuiRestricao);
  }
}
