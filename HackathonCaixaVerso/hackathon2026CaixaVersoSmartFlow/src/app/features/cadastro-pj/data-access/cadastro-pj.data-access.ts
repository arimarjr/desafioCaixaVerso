import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  AvaliarEmpresaRequestDto,
  EmpresaMockDto,
  EmpresaReceitaFederalDto,
  EnderecoCepDto,
  ResultadoAvaliacaoDto,
} from '../models/empresa.dto';
import { DadosAdministrativosVm, ResultadoAvaliacaoVm } from '../models/operacao-credito.vm';

@Injectable()
export class CadastroPjDataAccess {
  private readonly _cepUrl = 'https://viacep.com.br/ws';

  private readonly _http = inject(HttpClient);

  buscarEmpresaReceita(cnpj: string): Observable<EmpresaReceitaFederalDto> {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    return this._http
      .get<EmpresaMockDto>(`/api/empresas/${cnpjLimpo}`)
      .pipe(map(mock => this._mapearMockParaDto(mock)));
  }

  avaliarEmpresa(
    cnpj: string,
    dados: DadosAdministrativosVm
  ): Observable<ResultadoAvaliacaoVm> {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    const body: AvaliarEmpresaRequestDto = {
      cnpj: cnpjLimpo,
      dadosAdministrativos: {
        documentoFaturamento:              dados.documentoFaturamento,
        dataUltimaAtualizacaoContratual:   dados.dataUltimaAtualizacaoContratual,
        alterouSociosMaior50:              dados.alterouSociosMaior50,
        excluiuAdministradoresAnteriores:  dados.excluiuAdministradoresAnteriores,
        alterouObjetoSocial:               dados.alterouObjetoSocial,
        alterouCnaePrincipal:              dados.alterouCnaePrincipal,
        alterouMunicipio:                  dados.alterouMunicipio,
        deixouSerSociedadeSimples:         dados.deixouSerSociedadeSimples,
        pvResponsavel:                     dados.pvResponsavel,
      },
    };
    return this._http
      .post<ResultadoAvaliacaoDto>('/api/avaliacoes/avaliar', body)
      .pipe(
        map(dto => ({
          resultado:         dto.resultado,
          justificativa:     dto.justificativa,
          limiteAprovado:    dto.limiteAprovado,
          classificacaoRisco: dto.classificacaoRisco,
          scoreInterno:      dto.scoreInterno,
          dataAvaliacao:     dto.dataAvaliacao,
        }))
      );
  }

  private _mapearMockParaDto(mock: EmpresaMockDto): EmpresaReceitaFederalDto {
    const c = mock.cadastroEmpresa;
    const cnaeNum = parseInt(c.cnaePrincipal.replace(/\D/g, ''), 10) || 0;

    return {
      cnpj:                    c.cnpj,
      razao_social:            c.razaoSocial,
      nome_fantasia:           c.nomeFantasia,
      cnae_fiscal:             cnaeNum,
      cnae_fiscal_descricao:   c.descricaoCnaePrincipal,
      natureza_juridica:       c.naturezaJuridica,
      porte:                   c.porteCaixa,
      data_inicio_atividade:   c.dataConstituicao,
      situacao_cadastral:      c.restricaoCadastral ? 'INAPTA' : 'ATIVA',
      situacao_cadastral_data: '',
      logradouro:              c.endereco?.logradouro ?? '',
      numero:                  c.endereco?.numero ?? 'S/N',
      complemento:             c.endereco?.complemento ?? '',
      bairro:                  c.endereco?.bairro ?? '',
      municipio:               c.endereco?.municipio ?? '',
      uf:                      c.endereco?.uf ?? '',
      cep:                     c.endereco?.cep ?? '',
      ddd_telefone_1:          c.contatos?.telefoneComercial ?? '',
      email:                   c.contatos?.emailPrincipal ?? '',
      capital_social:          c.capitalSocial,
      qsa: mock.representantesLegais.socios.map(s => ({
        identificador_socio:                   s.id,
        nome_socio_razao_social:               s.nomeSocio,
        cnpj_cpf_do_socio:                     s.cpf,
        codigo_qualificacao_socio:             0,
        percentual_capital_social:             s.percentualParticipacaoSocietaria,
        data_entrada_sociedade:                s.dataIngresso,
        cpf_representante_legal:               '',
        nome_representante_legal:              '',
        codigo_qualificacao_representante_legal: null,
      })),
    };
  }

  buscarCep(cep: string): Observable<EnderecoCepDto | null> {
    const cepLimpo = cep.replace(/[^\d]/g, '');
    if (cepLimpo.length !== 8) return of(null);
    return this._http.get<EnderecoCepDto>(`${this._cepUrl}/${cepLimpo}/json/`).pipe(
      map(r => (r.erro ? null : r)),
      catchError(() => of(null))
    );
  }
}
