import {
  AfterViewInit, Component, effect, inject, Injector, OnInit, signal, TemplateRef, ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DscStepperComponent, DscStepperModel } from 'sidsc-components/dsc-stepper';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DscAlertComponent } from 'sidsc-components/dsc-alert';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';
import { CadastroPjStore } from '../../store/cadastro-pj.store';
import { CadastroPjDataAccess } from '../../data-access/cadastro-pj.data-access';
import { CadastroEmpresaComponent } from '../../components/cadastro-empresa/cadastro-empresa.component';
import { ListaSociosComponent } from '../../components/lista-socios/lista-socios.component';
import { FaturamentoPatrimonioComponent } from '../../components/faturamento-patrimonio/faturamento-patrimonio.component';
import { CentralPesquisasComponent } from '../../components/central-pesquisas/central-pesquisas.component';
import { SimulacaoPropostaComponent } from '../../components/simulacao-proposta/simulacao-proposta.component';
import { AcompanhamentoConformidadeComponent } from '../../components/acompanhamento-conformidade/acompanhamento-conformidade.component';
import { DadosAdministrativosComponent } from '../../components/dados-administrativos/dados-administrativos.component';
import { PopupCadastroCompletoComponent } from '../../components/popup-cadastro-completo/popup-cadastro-completo.component';
import { PopupPesquisaExternaComponent } from '../../components/popup-pesquisa-externa/popup-pesquisa-externa.component';
import { PopupAvaliandoEmpresaComponent } from '../../components/popup-avaliando-empresa/popup-avaliando-empresa.component';
import { PopupResultadoAvaliacaoComponent } from '../../components/popup-resultado-avaliacao/popup-resultado-avaliacao.component';
import { ChecklistFinalComponent } from '../../components/checklist-final/checklist-final.component';
import { PopupResultadoData } from '../../models/popup-resultado.model';
import { DadosAdministrativosVm, ResultadoAvaliacaoVm } from '../../models/operacao-credito.vm';

@Component({
  selector: 'app-cadastro-pj-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DscStepperComponent,
    DscButtonComponent,
    DscAlertComponent,
    CadastroEmpresaComponent,
    ListaSociosComponent,
    FaturamentoPatrimonioComponent,
    CentralPesquisasComponent,
    SimulacaoPropostaComponent,
    AcompanhamentoConformidadeComponent,
    DadosAdministrativosComponent,
    ChecklistFinalComponent,
  ],
  providers: [
    CadastroPjStore,
    CadastroPjDataAccess,
    CadastroPjFacade,
  ],
  templateUrl: './cadastro-pj-page.component.html',
  styleUrl: './cadastro-pj-page.component.scss',
})
export class CadastroPjPageComponent implements OnInit, AfterViewInit {
  @ViewChild('tplCadastro',       { static: true }) private _tplCadastro!:       TemplateRef<any>;
  @ViewChild('tplAvaliacao',      { static: true }) private _tplAvaliacao!:      TemplateRef<any>;
  @ViewChild('tplPesquisas',      { static: true }) private _tplPesquisas!:      TemplateRef<any>;
  @ViewChild('tplSimulacao',      { static: true }) private _tplSimulacao!:      TemplateRef<any>;
  @ViewChild('tplContrato',       { static: true }) private _tplContrato!:       TemplateRef<any>;
  @ViewChild('tplConformidade',   { static: true }) private _tplConformidade!:   TemplateRef<any>;
  @ViewChild('tplFinalizado',     { static: true }) private _tplFinalizado!:     TemplateRef<any>;

  readonly facade = inject(CadastroPjFacade);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);
  private readonly _dialog = inject(MatDialog);
  private readonly _injector = inject(Injector);

  stepper!: DscStepperModel;

  readonly cnpj = signal('');
  readonly carregando = this.facade.carregando;
  readonly empresa = this.facade.empresa;
  readonly possuiErro = this.facade.possuiErro;
  readonly erro = this.facade.erro;

  readonly cpfsSocios = this.facade.socios;

  /** Controla se o formulário de Dados Administrativos deve ser exibido no Step 2 */
  readonly mostrarDadosAdministrativos = signal(false);
  readonly resultadoAvaliacao = signal<ResultadoAvaliacaoVm | null>(null);

  private _cadastroCompletoExibido = false;

  readonly fgCadastro     = this._fb.group({});
  readonly fgAvaliacao    = this._fb.group({});
  readonly fgPesquisas    = this._fb.group({});
  readonly fgSimulacao    = this._fb.group({});
  readonly fgContrato     = this._fb.group({});
  readonly fgConformidade = this._fb.group({});
  readonly fgFinalizado   = this._fb.group({});

  constructor() {
    // Exibe popup "Cadastro completo" uma única vez ao carregar a empresa
    effect(() => {
      const emp = this.facade.empresa();
      if (emp && !this._cadastroCompletoExibido) {
        this._cadastroCompletoExibido = true;
        this.mostrarDadosAdministrativos.set(false);
        this._dialog.open(PopupCadastroCompletoComponent, {
          disableClose: true,
          width: '420px',
          panelClass: 'popup-cadastro-completo-panel',
        });
      }
    });
  }

  ngOnInit(): void {
    const cnpjParam = this._route.snapshot.paramMap.get('cnpj') ?? '';
    this.cnpj.set(cnpjParam);
    if (cnpjParam) this.facade.buscarEmpresa(cnpjParam);
  }

  ngAfterViewInit(): void {
    this.stepper = {
      selectedIndex: 0,
      steps: [
        { label: 'Cadastro',              formGroup: this.fgCadastro,     contentTemplate: this._tplCadastro },
        { label: 'Avaliação do Crédito',  formGroup: this.fgAvaliacao,    contentTemplate: this._tplAvaliacao },
        { label: 'Simulação',             formGroup: this.fgSimulacao,    contentTemplate: this._tplSimulacao },
        { label: 'Pesquisas',             formGroup: this.fgPesquisas,    contentTemplate: this._tplPesquisas },
        { label: 'Contrato e Assinatura', formGroup: this.fgContrato,     contentTemplate: this._tplContrato },
        { label: 'Conformidade',          formGroup: this.fgConformidade, contentTemplate: this._tplConformidade },
        { label: 'Finalizado',            formGroup: this.fgFinalizado,   contentTemplate: this._tplFinalizado },
      ],
    };
  }

  voltarHome(): void {
    this._router.navigate(['/pagina-inicial']);
  }

  /** Step 1 → Step 2 */
  seguirParaAvaliacao(): void {
    this.mostrarDadosAdministrativos.set(true);
    this.stepper.selectedIndex = 1;
  }

  /** Botão "Efetuar Avaliação do Tomador" no Step 2 */
  abrirPesquisasParaAvaliacao(): void {
    const ref = this._dialog.open(PopupPesquisaExternaComponent, {
      disableClose: true,
      width: '520px',
    });
    ref.afterClosed().subscribe(() => {
      this.mostrarDadosAdministrativos.set(true);
    });
  }

  /** Chamado pelo formulário de Dados Administrativos ao submeter */
  iniciarFluxoAvaliacao(dados: DadosAdministrativosVm): void {
    const cnpj = this.empresa()?.cnpj ?? this.cnpj();

    // 1. Popup pesquisas externas
    const pesquisaRef = this._dialog.open(PopupPesquisaExternaComponent, {
      disableClose: true,
      width: '520px',
    });

    pesquisaRef.afterClosed().subscribe(() => {
      // 2. Popup "Avaliando a empresa." (2,5 s auto-close)
      const avaliandoRef = this._dialog.open(PopupAvaliandoEmpresaComponent, {
        disableClose: true,
        width: '420px',
      });

      avaliandoRef.afterClosed().subscribe(() => {
        // 3. Popup do resultado da avaliação
        const data: PopupResultadoData = { cnpj, dadosAdministrativos: dados };
        const resultadoRef = this._dialog.open(PopupResultadoAvaliacaoComponent, {
          disableClose: true,
          width: '520px',
          data,
          injector: this._injector,
        });

        resultadoRef.afterClosed().subscribe(res => {
          if (res?.continuarSimulacao) {
            if (res.resultado) this.resultadoAvaliacao.set(res.resultado);
            this.stepper.selectedIndex = (this.stepper.selectedIndex as number) + 1;
          }
        });
      });
    });
  }

  get cpfsSociosParaPesquisa(): { nome: string; cpf: string }[] {
    return this.cpfsSocios().map(s => ({ nome: s.nome, cpf: s.cpf }));
  }
}
