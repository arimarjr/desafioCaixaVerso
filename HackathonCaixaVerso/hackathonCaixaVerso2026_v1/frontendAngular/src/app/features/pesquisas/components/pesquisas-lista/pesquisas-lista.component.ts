import {
  ChangeDetectionStrategy, Component, computed, inject, Input, OnChanges, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { gerarPesquisasEmpresa, gerarPesquisasSocio, Pesquisa } from '../../models/pesquisa.model';
import { PesquisasService } from '../../services/pesquisas.service';

@Component({
  selector: 'app-pesquisas-lista',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './pesquisas-lista.component.html',
  styleUrl: './pesquisas-lista.component.scss',
})
export class PesquisasListaComponent implements OnChanges {
  @Input() cnpj = '';
  @Input() nomesECpfsSocios: { nome: string; cpf: string }[] = [];

  private readonly _service  = inject(PesquisasService);
  private readonly _snackBar = inject(MatSnackBar);

  readonly pesquisas = signal<Pesquisa[]>([]);

  readonly totalSelecionadas = computed(() =>
    this.pesquisas().filter(p => p.selecionada).length
  );

  readonly todasMarcadas = computed(() =>
    this.pesquisas().length > 0 && this.pesquisas().every(p => p.selecionada)
  );

  readonly parcialmenteMarcadas = computed(() => {
    const sel = this.totalSelecionadas();
    return sel > 0 && sel < this.pesquisas().length;
  });

  readonly grupos = computed(() => {
    const nomes = [...new Set(this.pesquisas().map(p => p.grupo))];
    return nomes.map(nome => ({
      nome,
      pesquisas: this.pesquisas().filter(p => p.grupo === nome),
    }));
  });

  get identificadorEmpresa(): string {
    const digits = this.cnpj.replace(/[^\d]/g, '');
    return digits || 'EMPRESA-SEM-CNPJ';
  }

  ngOnChanges(): void {
    const lista: Pesquisa[] = [
      ...gerarPesquisasEmpresa(),
      ...this.nomesECpfsSocios.flatMap(s => gerarPesquisasSocio(s.nome, s.cpf)),
    ];
    this.pesquisas.set(lista);
  }

  alternarTodas(marcado: boolean): void {
    this.pesquisas.set(this.pesquisas().map(p => ({ ...p, selecionada: marcado })));
  }

  alternarPesquisa(id: string, marcado: boolean): void {
    this.pesquisas.set(this.pesquisas().map(p =>
      p.id === id ? { ...p, selecionada: marcado } : p
    ));
  }

  efetuarPesquisas(): void {
    const selecionadas = this.pesquisas().filter(p => p.selecionada);
    if (selecionadas.length === 0) {
      this._snackBar.open('Selecione ao menos uma pesquisa para abrir.', 'Fechar', { duration: 4000 });
      return;
    }
    selecionadas.forEach(p => window.open(p.url, '_blank', 'noopener,noreferrer'));
    this._snackBar.open(
      `${selecionadas.length} pesquisa(s) aberta(s). Após baixar os PDFs, envie cada documento na linha correspondente.`,
      'Fechar',
      { duration: 6000 }
    );
  }

  uploadArquivo(event: Event, pesquisa: Pesquisa): void {
    const input  = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    if (arquivo.type !== 'application/pdf') {
      this._snackBar.open('Envie somente arquivo PDF.', 'Fechar', { duration: 4000 });
      input.value = '';
      return;
    }

    this._service.uploadDocumento({
      identificadorEmpresa: this.identificadorEmpresa,
      pesquisaId:           pesquisa.id,
      nomePesquisa:         pesquisa.nome,
      arquivo,
    }).subscribe({
      next: resposta => {
        this.pesquisas.set(this.pesquisas().map(p =>
          p.id === pesquisa.id
            ? { ...p, arquivoEnviado: true, nomeArquivoSalvo: resposta.nomeSalvo }
            : p
        ));
        this._snackBar.open('PDF enviado e salvo com sucesso.', 'Fechar', { duration: 4000 });
        input.value = '';
      },
      error: () => {
        this._snackBar.open('Erro ao enviar o PDF. Verifique o backend.', 'Fechar', { duration: 5000 });
        input.value = '';
      },
    });
  }
}

