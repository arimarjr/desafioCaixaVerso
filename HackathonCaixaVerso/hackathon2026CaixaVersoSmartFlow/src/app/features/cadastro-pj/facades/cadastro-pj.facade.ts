import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { CadastroPjDataAccess } from '../data-access/cadastro-pj.data-access';
import { mapearEmpresaVm, mapearSocioVmDeQsa } from '../mappers/empresa.mapper';
import { DadosAdministrativosVm, EmpresaVm, FaturamentoAnualVm, ResultadoAvaliacaoVm, SocioVm } from '../models/operacao-credito.vm';
import { CadastroPjStore } from '../store/cadastro-pj.store';

@Injectable()
export class CadastroPjFacade {
  private readonly _store = inject(CadastroPjStore);
  private readonly _dataAccess = inject(CadastroPjDataAccess);

  readonly empresa = this._store.empresa;
  readonly socios = this._store.socios;
  readonly faturamentos = this._store.faturamentos;
  readonly carregando = this._store.carregando;
  readonly carregandoCep = this._store.carregandoCep;
  readonly erro = this._store.erro;
  readonly possuiErro = this._store.possuiErro;
  readonly empresaCarregada = this._store.empresaCarregada;
  readonly totalParticipacao = this._store.totalParticipacao;
  readonly etapaAtual = this._store.etapaAtual;

  buscarEmpresa(cnpj: string): void {
    this._store.definirCarregando(true);
    this._store.definirErro(null);
    this._store.definirCnpjPesquisado(cnpj);

    this._dataAccess.buscarEmpresaReceita(cnpj).pipe(
      map(dto => ({ empresa: mapearEmpresaVm(dto), socios: dto.qsa?.map(mapearSocioVmDeQsa) ?? [] })),
      tap(({ empresa, socios }) => {
        this._store.definirEmpresa(empresa);
        this._store.definirSocios(socios);
      }),
      catchError(() => {
        this._store.definirErro('Empresa não encontrada na Receita Federal. Preencha os dados manualmente.');
        return EMPTY;
      }),
      finalize(() => this._store.definirCarregando(false))
    ).subscribe();
  }

  buscarCep(cep: string, callback: (logradouro: string, bairro: string, cidade: string, uf: string) => void): void {
    this._store.definirCarregandoCep(true);
    this._dataAccess.buscarCep(cep).pipe(
      finalize(() => this._store.definirCarregandoCep(false))
    ).subscribe(dto => {
      if (dto) callback(dto.logradouro, dto.bairro, dto.localidade, dto.uf);
    });
  }

  salvarEmpresa(empresa: EmpresaVm): void {
    this._store.definirEmpresa(empresa);
  }

  adicionarSocio(socio: SocioVm): void {
    this._store.adicionarSocio({ ...socio, id: socio.id || crypto.randomUUID() });
  }

  atualizarSocio(socio: SocioVm): void {
    this._store.atualizarSocio(socio);
  }

  removerSocio(id: string): void {
    this._store.removerSocio(id);
  }

  adicionarFaturamento(fat: FaturamentoAnualVm): void {
    this._store.adicionarFaturamento({ ...fat, id: fat.id || crypto.randomUUID() });
  }

  atualizarFaturamento(fat: FaturamentoAnualVm): void {
    this._store.atualizarFaturamento(fat);
  }

  removerFaturamento(id: string): void {
    this._store.removerFaturamento(id);
  }

  avancarEtapa(): void {
    this._store.definirEtapa(this._store.etapaAtual() + 1);
  }

  avaliarEmpresa(cnpj: string, dados: DadosAdministrativosVm): Observable<ResultadoAvaliacaoVm> {
    return this._dataAccess.avaliarEmpresa(cnpj, dados);
  }

  limpar(): void {
    this._store.limpar();
  }
}
