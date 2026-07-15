import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DscInputComponent } from 'sidsc-components/dsc-input';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DscInputCurrencyComponent } from 'sidsc-components/dsc-input-currency';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMaskDirective } from 'ngx-mask';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';
import { LINHAS_CREDITO } from '../../models/operacao-credito.vm';

@Component({
  selector: 'app-simulacao-proposta',
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
  templateUrl: './simulacao-proposta.component.html',
  styleUrl: './simulacao-proposta.component.scss',
})
export class SimulacaoPropostaComponent implements OnInit {
  form!: FormGroup;
  readonly linhasCredito = LINHAS_CREDITO;
  readonly propostaGerada = signal(false);

  readonly valorParcelaCalculado = computed(() => {
    const v = this.form?.get('valorSolicitado')?.value ?? 0;
    const p = this.form?.get('prazo')?.value ?? 1;
    const t = (this.form?.get('taxaJuros')?.value ?? 0) / 100;
    if (!v || !p || p <= 0) return 0;
    if (t === 0) return v / p;
    return (v * t * Math.pow(1 + t, p)) / (Math.pow(1 + t, p) - 1);
  });

  constructor(
    private readonly _fb: FormBuilder,
    readonly facade: CadastroPjFacade,
  ) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      linhaCredito:     ['', Validators.required],
      valorSolicitado:  [0, [Validators.required, Validators.min(1)]],
      prazo:            [12, [Validators.required, Validators.min(1)]],
      taxaJuros:        [1.5, Validators.required],
      garantias:        [''],
      observacoes:      [''],
      validadeSimulacao:[30],
    });
  }

  gerarProposta(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.propostaGerada.set(true);
  }

  novaProposta(): void {
    this.propostaGerada.set(false);
  }

  imprimirPdf(): void {
    window.print();
  }

  get empresa() { return this.facade.empresa(); }

  get dataValidade(): string {
    const d = new Date();
    d.setDate(d.getDate() + (this.form.get('validadeSimulacao')?.value ?? 30));
    return d.toLocaleDateString('pt-BR');
  }
}
