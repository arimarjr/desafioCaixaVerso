import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DscInputComponent } from 'sidsc-components/dsc-input';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DscInputCurrencyComponent } from 'sidsc-components/dsc-input-currency';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMaskDirective } from 'ngx-mask';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';
import { FaturamentoAnualVm } from '../../models/operacao-credito.vm';
import { ORIGENS_FATURAMENTO } from '../../constants/cadastro-pj.constants';

@Component({
  selector: 'app-faturamento-patrimonio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DscInputComponent,
    DscButtonComponent,
    DscInputCurrencyComponent,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './faturamento-patrimonio.component.html',
  styleUrl: './faturamento-patrimonio.component.scss',
})
export class FaturamentoPatrimonioComponent implements OnInit {
  form!: FormGroup;

  readonly anoAtual = new Date().getFullYear();
  readonly origens = ORIGENS_FATURAMENTO;

  get faturamentosArray(): FormArray { return this.form.get('faturamentos') as FormArray; }
  get patrimoniosArray(): FormArray { return this.form.get('patrimonios') as FormArray; }

  constructor(
    private readonly _fb: FormBuilder,
    readonly facade: CadastroPjFacade,
  ) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      faturamentos: this._fb.array([]),
      patrimonios:  this._fb.array([]),
    });

    this.facade.faturamentos().forEach(f => this.faturamentosArray.push(this._novoFaturamento(f)));
  }

  private _novoFaturamento(dados?: Partial<FaturamentoAnualVm>): FormGroup {
    return this._fb.group({
      id:              [dados?.id ?? crypto.randomUUID()],
      anoReferencia:   [dados?.anoReferencia ?? this.anoAtual],
      caracterizacao:  [dados?.caracterizacao ?? 'Faturamento Fiscal'],
      valor:           [dados?.valor ?? 0],
      dataAtualizacao: [dados?.dataAtualizacao ?? ''],
      origemDados:     [dados?.origemDados ?? 'CAIXA'],
      comprovada:      [dados?.comprovada ?? 0],
    });
  }

  private _novoPatrimonio(): FormGroup {
    return this._fb.group({
      id:           [crypto.randomUUID()],
      descricao:    [''],
      valor:        [0],
      atualizacao:  [''],
    });
  }

  adicionarFaturamento(): void { this.faturamentosArray.push(this._novoFaturamento()); }
  removerFaturamento(i: number): void {
    const id = this.faturamentosArray.at(i).get('id')?.value;
    this.faturamentosArray.removeAt(i);
    if (id) this.facade.removerFaturamento(id);
  }

  adicionarPatrimonio(): void { this.patrimoniosArray.push(this._novoPatrimonio()); }
  removerPatrimonio(i: number): void { this.patrimoniosArray.removeAt(i); }

  salvar(): void {
    const v = this.form.getRawValue();
    v.faturamentos.forEach((f: FaturamentoAnualVm) => {
      const existe = this.facade.faturamentos().find(x => x.id === f.id);
      if (existe) this.facade.atualizarFaturamento(f);
      else this.facade.adicionarFaturamento(f);
    });
  }
}
