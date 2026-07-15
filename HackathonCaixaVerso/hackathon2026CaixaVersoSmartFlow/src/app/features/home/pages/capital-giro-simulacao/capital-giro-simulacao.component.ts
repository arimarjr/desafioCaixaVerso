import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CapitalGiroSimulacaoFacade } from './capital-giro-simulacao.facade';
import { SimulacaoCapitalGiroInput } from './capital-giro-simulacao.models';

@Component({
  selector: 'app-capital-giro-simulacao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CapitalGiroSimulacaoFacade, CurrencyPipe],
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './capital-giro-simulacao.component.html',
  styleUrl: './capital-giro-simulacao.component.scss',
})
export class CapitalGiroSimulacaoComponent implements OnInit, AfterViewInit {
  private readonly _fb     = inject(FormBuilder);
  private readonly _facade = inject(CapitalGiroSimulacaoFacade);

  @ViewChild('inputValor') inputValor!: ElementRef<HTMLInputElement>;

  form!: FormGroup;

  readonly capitalGiroSelecionado = this._facade.capitalGiroSelecionado;
  readonly simulacaoCalculada     = this._facade.simulacaoCalculada;
  readonly resultado               = this._facade.resultado;

  ngOnInit(): void {
    this.form = this._fb.group({
      valorSolicitado: [100000, [Validators.required, Validators.min(50000), Validators.max(5000000)]],
      prazoMeses:      [12,     [Validators.required, Validators.min(6), Validators.max(36)]],
      taxaMensal:      [1,      [Validators.required, Validators.min(0)]],
    });
  }

  ngAfterViewInit(): void {
    this._exibirValorFormatado(100000);
  }

  aoDigitarValor(event: Event): void {
    const el     = event.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '');
    const valor  = digits ? parseInt(digits, 10) / 100 : 0;
    this.form.get('valorSolicitado')!.setValue(valor);
    el.value = this._formatarBRL(valor);
  }

  aoSairValor(): void {
    this.form.get('valorSolicitado')!.markAsTouched();
  }

  onSelecionarCapitalGiro(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this._facade.selecionarCapitalGiro(checked);
    if (!checked) {
      this.form.reset({ valorSolicitado: 100000, prazoMeses: 12, taxaMensal: 1 });
    } else {
      // Garante que o display seja formatado ao reexibir o campo
      setTimeout(() => this._exibirValorFormatado(100000), 0);
    }
  }

  onCalcular(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { valorSolicitado, prazoMeses, taxaMensal } = this.form.value;
    const input: SimulacaoCapitalGiroInput = {
      valorSolicitado:      Number(valorSolicitado),
      prazoMeses:           Number(prazoMeses),
      taxaMensalPercentual: Number(taxaMensal),
    };
    this._facade.calcular(input);
  }

  onImprimir(): void {
    window.print();
  }

  @Output() voltar = new EventEmitter<void>();

  onVoltar(): void {
    this.voltar.emit();
  }

  onSalvar(): void {
    console.log('Salvar');
  }

  onAvancar(): void {
    console.log('Avançar');
  }

  private _formatarBRL(valor: number): string {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private _exibirValorFormatado(valor: number): void {
    if (this.inputValor?.nativeElement) {
      this.inputValor.nativeElement.value = this._formatarBRL(valor);
    }
  }

  get valorSolicitado() { return this.form.get('valorSolicitado')!; }
  get prazoMeses()      { return this.form.get('prazoMeses')!; }
  get taxaMensal()      { return this.form.get('taxaMensal')!; }
}
