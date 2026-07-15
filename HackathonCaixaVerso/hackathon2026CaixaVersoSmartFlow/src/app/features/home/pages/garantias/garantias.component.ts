import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BandeiraCartao, GarantiaItem, TipoGarantiaOpcao } from '../../models/garantias.model';

const BANDEIRAS_INICIAIS: BandeiraCartao[] = [
  { id: 'visa',    nome: 'Visa',        selecionada: false, percentual: null },
  { id: 'master',  nome: 'Mastercard',  selecionada: false, percentual: null },
  { id: 'elo',     nome: 'ELO',         selecionada: false, percentual: null },
  { id: 'hiper',   nome: 'Hiper',       selecionada: false, percentual: null },
  { id: 'dinners', nome: 'Diners Club', selecionada: false, percentual: null },
  { id: 'amex',    nome: 'Amex',        selecionada: false, percentual: null },
];

@Component({
  selector: 'app-garantias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './garantias.component.html',
  styleUrl: './garantias.component.scss',
})
export class GarantiasComponent implements OnInit, AfterViewInit {
  @Input() valorContratado = 100000;
  @Input() linhaCredito    = 'Capital de Giro';

  @ViewChild('inputGarantia') inputGarantia!: ElementRef<HTMLInputElement>;

  private readonly _fb = inject(FormBuilder);

  form!: FormGroup;

  readonly garantiasAdicionadas = signal<GarantiaItem[]>([]);
  readonly bandeiras             = signal<BandeiraCartao[]>(BANDEIRAS_INICIAIS.map(b => ({ ...b })));
  readonly erroBandeiras         = signal<string | null>(null);

  readonly tiposGarantia: TipoGarantiaOpcao[] = [
    { valor: 'faturamento_cartao', label: 'Faturamento de cartão' },
  ];

  readonly totalPercentualBandeiras = computed(() =>
    this.bandeiras()
      .filter(b => b.selecionada)
      .reduce((sum, b) => sum + (b.percentual ?? 0), 0)
  );

  readonly totalEmGarantias = computed(() =>
    this.garantiasAdicionadas().reduce((sum, g) => sum + g.valor, 0)
  );

  readonly percentualCobertura = computed(() => {
    if (!this.valorContratado) return 0;
    return (this.totalEmGarantias() / this.valorContratado) * 100;
  });

  get valorMinimoGarantia(): number {
    return this.valorContratado * 0.125;
  }

  get valorMinimoGarantiaTexto(): string {
    return this._formatarBRL(this.valorMinimoGarantia);
  }

  get isFaturamentoCartao(): boolean {
    return this.form?.get('tipoGarantia')?.value === 'faturamento_cartao';
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      tipoGarantia:  ['', Validators.required],
      valorGarantia: [null, [Validators.required, this._valorMinimoValidator()]],
    });
  }

  ngAfterViewInit(): void {
    // Input starts empty; placeholder shows the formatted minimum value
  }

  aoDigitarValorGarantia(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const centavos = parseInt(raw || '0', 10);
    const valor = centavos / 100;
    this.form.get('valorGarantia')!.setValue(valor > 0 ? valor : null);
    input.value = raw.length ? this._formatarBRL(valor) : '';
  }

  aoSairValorGarantia(): void {
    this.form.get('valorGarantia')!.markAsTouched();
  }

  private _formatarBRL(valor: number): string {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  toggleBandeira(id: string): void {
    this.bandeiras.update(lista =>
      lista.map(b =>
        b.id === id ? { ...b, selecionada: !b.selecionada } : b
      )
    );
    this.erroBandeiras.set(null);
  }

  atualizarPercentual(id: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const valor = raw === '' ? null : +raw;
    this.bandeiras.update(lista =>
      lista.map(b => b.id === id ? { ...b, percentual: valor } : b)
    );
    this.erroBandeiras.set(null);
  }

  onAdicionar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (this.isFaturamentoCartao) {
      const selecionadas = this.bandeiras().filter(b => b.selecionada);
      if (selecionadas.length === 0) {
        this.erroBandeiras.set('Selecione ao menos uma bandeira.');
        return;
      }
      const total = this.totalPercentualBandeiras();
      if (Math.round(total) !== 100) {
        this.erroBandeiras.set(`O total dos percentuais deve ser 100%. Atual: ${total.toFixed(0)}%`);
        return;
      }
    }

    const { tipoGarantia, valorGarantia } = this.form.value;
    const opcao = this.tiposGarantia.find(t => t.valor === tipoGarantia)!;

    const bandeirasSelecionadas = this.bandeiras()
      .filter(b => b.selecionada)
      .map(b => ({ nome: b.nome, percentual: b.percentual ?? 0 }));

    const descricao = bandeirasSelecionadas.length > 0
      ? bandeirasSelecionadas.map(b => `${b.nome} (${b.percentual}%)`).join(', ')
      : '';

    this.garantiasAdicionadas.update(lista => [
      ...lista,
      {
        tipo:      tipoGarantia,
        tipoLabel: opcao.label,
        valor:     Number(valorGarantia),
        descricao,
        bandeiras: bandeirasSelecionadas,
      },
    ]);

    this.form.reset({ tipoGarantia: '', valorGarantia: null });
    this.bandeiras.set(BANDEIRAS_INICIAIS.map(b => ({ ...b })));
    this.erroBandeiras.set(null);
  }

  onRemoverGarantia(index: number): void {
    this.garantiasAdicionadas.update(lista => lista.filter((_, i) => i !== index));
  }

  @Output() voltar = new EventEmitter<void>();

  onVoltar(): void  { this.voltar.emit(); }
  onSalvar(): void  { console.log('Salvar');  }
  onAvancar(): void { console.log('Avançar'); }

  get tipoGarantia()  { return this.form.get('tipoGarantia')!; }
  get valorGarantia() { return this.form.get('valorGarantia')!; }

  private _valorMinimoValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === '') return null;
      const min = this.valorContratado * 0.125;
      return Number(control.value) < min ? { valorMinimo: { min } } : null;
    };
  }
}
