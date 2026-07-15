import { computed, Injectable, signal } from '@angular/core';
import { EmpresaVm, FaturamentoAnualVm, OperacaoCreditoPjVm, SocioVm } from '../models/operacao-credito.vm';

@Injectable()
export class CadastroPjStore {
  private readonly _operacao = signal<OperacaoCreditoPjVm | null>(null);
  private readonly _empresa = signal<EmpresaVm | null>(null);
  private readonly _socios = signal<SocioVm[]>([]);
  private readonly _faturamentos = signal<FaturamentoAnualVm[]>([]);
  private readonly _etapaAtual = signal<number>(0);
  private readonly _carregando = signal<boolean>(false);
  private readonly _carregandoCep = signal<boolean>(false);
  private readonly _erro = signal<string | null>(null);
  private readonly _cnpjPesquisado = signal<string>('');

  readonly operacao = this._operacao.asReadonly();
  readonly empresa = this._empresa.asReadonly();
  readonly socios = this._socios.asReadonly();
  readonly faturamentos = this._faturamentos.asReadonly();
  readonly etapaAtual = this._etapaAtual.asReadonly();
  readonly carregando = this._carregando.asReadonly();
  readonly carregandoCep = this._carregandoCep.asReadonly();
  readonly erro = this._erro.asReadonly();
  readonly cnpjPesquisado = this._cnpjPesquisado.asReadonly();

  readonly possuiErro = computed(() => this._erro() !== null);
  readonly empresaCarregada = computed(() => this._empresa() !== null);
  readonly totalParticipacao = computed(() =>
    this._socios().reduce((acc, s) => acc + s.participacaoPercentual, 0)
  );

  definirCarregando(v: boolean): void { this._carregando.set(v); }
  definirCarregandoCep(v: boolean): void { this._carregandoCep.set(v); }
  definirErro(msg: string | null): void { this._erro.set(msg); }
  definirEmpresa(empresa: EmpresaVm): void { this._empresa.set(empresa); }
  definirCnpjPesquisado(cnpj: string): void { this._cnpjPesquisado.set(cnpj); }
  definirEtapa(indice: number): void { this._etapaAtual.set(indice); }

  adicionarSocio(socio: SocioVm): void {
    this._socios.update(lista => [...lista, socio]);
  }

  atualizarSocio(socio: SocioVm): void {
    this._socios.update(lista => lista.map(s => s.id === socio.id ? socio : s));
  }

  removerSocio(id: string): void {
    this._socios.update(lista => lista.filter(s => s.id !== id));
  }

  definirSocios(socios: SocioVm[]): void {
    this._socios.set(socios);
  }

  adicionarFaturamento(fat: FaturamentoAnualVm): void {
    this._faturamentos.update(lista => [...lista, fat]);
  }

  atualizarFaturamento(fat: FaturamentoAnualVm): void {
    this._faturamentos.update(lista => lista.map(f => f.id === fat.id ? fat : f));
  }

  removerFaturamento(id: string): void {
    this._faturamentos.update(lista => lista.filter(f => f.id !== id));
  }

  limpar(): void {
    this._empresa.set(null);
    this._socios.set([]);
    this._faturamentos.set([]);
    this._etapaAtual.set(0);
    this._erro.set(null);
    this._carregando.set(false);
  }
}
