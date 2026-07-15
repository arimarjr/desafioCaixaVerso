import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { NgxMaskDirective } from 'ngx-mask';
import { DscInputComponent } from 'sidsc-components/dsc-input';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DscAlertComponent } from 'sidsc-components/dsc-alert';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';
import { EmpresaVm, LINHAS_CREDITO, NATUREZAS_JURIDICAS, PORTES_CAIXA, REGIMES_TRIBUTARIOS, SEGMENTOS_PJ, TIPOS_EMPRESA } from '../../models/operacao-credito.vm';

@Component({
  selector: 'app-cadastro-empresa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DscInputComponent,
    DscButtonComponent,
    DscAlertComponent,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './cadastro-empresa.component.html',
  styleUrl: './cadastro-empresa.component.scss',
})
export class CadastroEmpresaComponent implements OnInit, OnDestroy {
  @Input() cnpj = '';
  @Output() dadosSalvos = new EventEmitter<EmpresaVm>();

  form!: FormGroup;

  readonly portesOptions = PORTES_CAIXA;
  readonly naturezasOptions = NATUREZAS_JURIDICAS;
  readonly regimesOptions = REGIMES_TRIBUTARIOS;
  readonly segmentosOptions = SEGMENTOS_PJ;
  readonly tiposEmpresaOptions = TIPOS_EMPRESA;
  readonly linhasCreditoOptions = LINHAS_CREDITO;

  readonly carregandoCep = signal(false);
  readonly empresaPreenchidaAutomaticamente = signal(false);
  readonly cnpjNaoEncontrado = signal(false);
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _fb: FormBuilder,
    readonly facade: CadastroPjFacade,
  ) {}

  ngOnInit(): void {
    this._initForm();
    const empresa = this.facade.empresa();
    if (empresa) {
      this._preencherForm(empresa);
      this._desabilitarCampos();
      this.empresaPreenchidaAutomaticamente.set(true);
    } else if (this.cnpj) {
      // Se veio CNPJ via rota mas empresa ainda não foi carregada, aguarda
      this.facade.carregando;
    }
    this._watchCep();
    this._watchEmpresaStore();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _watchEmpresaStore(): void {
    // Reage quando o store carrega a empresa (busca assíncrona ao iniciar com CNPJ na rota)
    effect(() => {
      const empresa = this.facade.empresa();
      const erro = this.facade.erro();
      if (empresa && !this.empresaPreenchidaAutomaticamente()) {
        this._preencherForm(empresa);
        this._desabilitarCampos();
        this.empresaPreenchidaAutomaticamente.set(true);
        this.cnpjNaoEncontrado.set(false);
      }
      if (erro) {
        this.cnpjNaoEncontrado.set(true);
        this.empresaPreenchidaAutomaticamente.set(false);
      }
    });
  }

  private _desabilitarCampos(): void {
    const camposReadonly = [
      'razaoSocial', 'nomeFantasia', 'cnaePrincipal', 'cnaeDescricao',
      'porteCaixa', 'naturezaJuridica', 'dataConstituicao', 'capitalSocial',
      'situacaoCadastral', 'logradouro', 'bairro', 'municipio', 'uf', 'cep',
    ];
    camposReadonly.forEach(c => this.form.get(c)?.disable());
  }

  private _watchCep(): void {
    this.form.get('cep')!.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((v: string) => (v ?? '').replace(/\D/g, '').length === 8),
      takeUntil(this._destroy$),
    ).subscribe(() => this.buscarCep());
  }

  private _initForm(): void {
    this.form = this._fb.group({
      cnpj:                   [{ value: this.cnpj, disabled: true }],
      razaoSocial:            ['', Validators.required],
      nomeFantasia:           [''],
      cnaePrincipal:          [''],
      cnaeDescricao:          [''],
      porteCaixa:             ['', Validators.required],
      naturezaJuridica:       ['', Validators.required],
      regimeTributario:       ['SIMPLES_NACIONAL', Validators.required],
      segmento:               ['', Validators.required],
      dataConstituicao:       [''],
      tipoEmpresa:            ['Comercial'],
      dataDemonstracao:       [''],
      gerenteResponsavel:     [''],
      perfil:                 [''],
      capitalSocial:          [0],
      documentoConstitutivo:  [''],
      ultimaAlteracao:        [''],
      situacaoCadastral:      [''],
      // Endereço
      cep:          [''],
      logradouro:   [''],
      numero:       [''],
      complemento:  [''],
      bairro:       [''],
      cidade:       [''],
      uf:           [''],
      // Contato
      telefone:     [''],
      email:        ['', Validators.email],
    });
  }

  private _preencherForm(empresa: EmpresaVm): void {
    this.form.patchValue({
      razaoSocial:      empresa.razaoSocial,
      nomeFantasia:     empresa.nomeFantasia,
      cnaePrincipal:    empresa.cnaePrincipal,
      cnaeDescricao:    empresa.cnaeDescricao,
      porteCaixa:       empresa.porteCaixa,
      naturezaJuridica: empresa.naturezaJuridica,
      regimeTributario: empresa.regimeTributario,
      segmento:         empresa.segmento,
      dataConstituicao: empresa.dataConstituicao,
      capitalSocial:    empresa.capitalSocial,
      situacaoCadastral: empresa.situacaoCadastral,
      cep:        empresa.cep,
      logradouro: empresa.logradouro,
      numero:     empresa.numero,
      complemento: empresa.complemento,
      bairro:     empresa.bairro,
      cidade:     empresa.cidade,
      uf:         empresa.uf,
      telefone:   empresa.telefone,
      email:      empresa.email,
    });
  }

  buscarCep(): void {
    const cep = this.form.get('cep')?.value;
    if (!cep || cep.replace(/\D/g, '').length < 8) return;
    this.carregandoCep.set(true);
    this.facade.buscarCep(cep, (logradouro, bairro, cidade, uf) => {
      this.form.patchValue({ logradouro, bairro, cidade, uf });
      this.carregandoCep.set(false);
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue() as EmpresaVm;
    this.facade.salvarEmpresa(raw);
    this.dadosSalvos.emit(raw);
  }

  erro(campo: string): string | undefined {
    const ctrl = this.form.get(campo);
    if (!ctrl?.touched || !ctrl?.errors) return undefined;
    if (ctrl.errors['required']) return 'Campo obrigatório.';
    if (ctrl.errors['email']) return 'E-mail inválido.';
    return undefined;
  }
}
