import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { DscInputComponent } from 'sidsc-components/dsc-input';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DscInputCurrencyComponent } from 'sidsc-components/dsc-input-currency';
import { NgxMaskDirective } from 'ngx-mask';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';
import { DadosPfVm, SocioVm } from '../../models/operacao-credito.vm';
import {
  ESTADOS_CIVIS,
  FUNCOES_SOCIO,
  GRAUS_INSTRUCAO,
  NACIONALIDADES,
  ORIGENS_RENDA,
  SEGMENTOS_PF,
  SEXOS,
  TIPOS_DOCUMENTO,
  UFS,
} from '../../constants/cadastro-pj.constants';

@Component({
  selector: 'app-form-socio-pf',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DscInputComponent,
    DscButtonComponent,
    DscInputCurrencyComponent,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatIconModule,
  ],
  templateUrl: './form-socio-pf.component.html',
  styleUrl: './form-socio-pf.component.scss',
})
export class FormSocioPfComponent implements OnInit {
  form!: FormGroup;

  readonly funcoes = FUNCOES_SOCIO;
  readonly sexos = SEXOS;
  readonly nacionalidades = NACIONALIDADES;
  readonly grausInstrucao = GRAUS_INSTRUCAO;
  readonly estadosCivis = ESTADOS_CIVIS;
  readonly tiposDocumento = TIPOS_DOCUMENTO;
  readonly ufs = UFS;
  readonly segmentosPf = SEGMENTOS_PF;
  readonly origensRenda = ORIGENS_RENDA;

  readonly modoEdicao = signal(false);
  readonly carregandoCep = signal(false);

  get rendasArray(): FormArray { return this.form.get('rendas') as FormArray; }
  get patrimoniosArray(): FormArray { return this.form.get('patrimonios') as FormArray; }

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _dialogRef: MatDialogRef<FormSocioPfComponent>,
    private readonly _facade: CadastroPjFacade,
    @Inject(MAT_DIALOG_DATA) readonly data: SocioVm | null,
  ) {}

  ngOnInit(): void {
    this.modoEdicao.set(this.data !== null);
    this._initForm();
    if (this.data) this._preencher(this.data);
  }

  private _initForm(): void {
    this.form = this._fb.group({
      // Dados da participação
      funcao:               ['Sócio', Validators.required],
      dataIngresso:         [''],
      participacaoPercentual: [0, [Validators.required, Validators.min(0.0001), Validators.max(100)]],
      // Dados PF
      cpf:                  ['', Validators.required],
      nome:                 ['', Validators.required],
      dataNascimento:       [''],
      nomeMae:              [''],
      nomePai:              [''],
      nomeSocial:           [''],
      nacionalidade:        ['Brasileiro(a)'],
      naturalidade:         [''],
      sexo:                 [''],
      segmento:             [''],
      grauInstrucao:        [''],
      estadoCivil:          [''],
      cpfConjuge:           [''],
      nomeConjuge:          [''],
      nascimentoConjuge:    [''],
      // Documentos
      tipoDocumento:        ['RG'],
      numeroDocumento:      [''],
      emissorDocumento:     [''],
      ufDocumento:          [''],
      dataEmissaoDocumento: [''],
      dataValidadeDocumento:[''],
      orgaoEmissorDocumento:[''],
      // Contato e endereço
      telefone:             [''],
      email:                ['', Validators.email],
      cep:                  [''],
      logradouro:           [''],
      numero:               [''],
      complemento:          [''],
      bairro:               [''],
      cidade:               [''],
      uf:                   [''],
      // Arrays
      rendas:               this._fb.array([]),
      patrimonios:          this._fb.array([]),
    });
  }

  private _preencher(socio: SocioVm): void {
    this.form.patchValue({
      funcao: socio.funcao,
      dataIngresso: socio.dataIngresso,
      participacaoPercentual: socio.participacaoPercentual,
      ...socio.dadosPf,
    });
    socio.dadosPf.rendas.forEach(r => this.rendasArray.push(this._novaRenda(r)));
    socio.dadosPf.patrimonios.forEach(p => this.patrimoniosArray.push(this._novoPatrimonio(p)));
  }

  private _novaRenda(dados?: Partial<DadosPfVm['rendas'][0]>): FormGroup {
    return this._fb.group({
      id:           [dados?.id ?? crypto.randomUUID()],
      fontePagadora:[dados?.fontePagadora ?? ''],
      profissao:    [dados?.profissao ?? ''],
      documento:    [dados?.documento ?? ''],
      mesAno:       [dados?.mesAno ?? ''],
      rendaBruta:   [dados?.rendaBruta ?? 0],
      rendaLiquida: [dados?.rendaLiquida ?? 0],
      irpf:         [dados?.irpf ?? 0],
      origem:       [dados?.origem ?? ''],
    });
  }

  private _novoPatrimonio(dados?: Partial<DadosPfVm['patrimonios'][0]>): FormGroup {
    return this._fb.group({
      id:          [dados?.id ?? crypto.randomUUID()],
      descricao:   [dados?.descricao ?? ''],
      valor:       [dados?.valor ?? 0],
      atualizacao: [dados?.atualizacao ?? ''],
    });
  }

  adicionarRenda(): void { this.rendasArray.push(this._novaRenda()); }
  removerRenda(i: number): void { this.rendasArray.removeAt(i); }

  adicionarPatrimonio(): void { this.patrimoniosArray.push(this._novoPatrimonio()); }
  removerPatrimonio(i: number): void { this.patrimoniosArray.removeAt(i); }

  buscarCep(): void {
    const cep = this.form.get('cep')?.value;
    if (!cep) return;
    this.carregandoCep.set(true);
    this._facade.buscarCep(cep, (logradouro, bairro, cidade, uf) => {
      this.form.patchValue({ logradouro, bairro, cidade, uf });
      this.carregandoCep.set(false);
    });
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const socio: SocioVm = {
      id: this.data?.id ?? crypto.randomUUID(),
      cpf: v.cpf,
      nome: v.nome,
      funcao: v.funcao,
      dataIngresso: v.dataIngresso,
      participacaoPercentual: +v.participacaoPercentual,
      dadosPf: {
        cpf: v.cpf, nome: v.nome, dataNascimento: v.dataNascimento,
        nomeMae: v.nomeMae, nomePai: v.nomePai, nomeSocial: v.nomeSocial,
        nacionalidade: v.nacionalidade, naturalidade: v.naturalidade,
        sexo: v.sexo, segmento: v.segmento, grauInstrucao: v.grauInstrucao,
        estadoCivil: v.estadoCivil, cpfConjuge: v.cpfConjuge,
        nomeConjuge: v.nomeConjuge, nascimentoConjuge: v.nascimentoConjuge,
        tipoDocumento: v.tipoDocumento, numeroDocumento: v.numeroDocumento,
        emissorDocumento: v.emissorDocumento, ufDocumento: v.ufDocumento,
        dataEmissaoDocumento: v.dataEmissaoDocumento, dataValidadeDocumento: v.dataValidadeDocumento,
        orgaoEmissorDocumento: v.orgaoEmissorDocumento,
        telefone: v.telefone, email: v.email,
        cep: v.cep, logradouro: v.logradouro, numero: v.numero,
        complemento: v.complemento, bairro: v.bairro, cidade: v.cidade, uf: v.uf,
        rendas: v.rendas,
        patrimonios: v.patrimonios,
      },
    };
    this._dialogRef.close(socio);
  }

  cancelar(): void { this._dialogRef.close(); }

  erro(campo: string): string | undefined {
    const ctrl = this.form.get(campo);
    if (!ctrl?.touched || !ctrl?.errors) return undefined;
    if (ctrl.errors['required']) return 'Campo obrigatório.';
    if (ctrl.errors['email']) return 'E-mail inválido.';
    if (ctrl.errors['min']) return 'Valor mínimo inválido.';
    return undefined;
  }
}
