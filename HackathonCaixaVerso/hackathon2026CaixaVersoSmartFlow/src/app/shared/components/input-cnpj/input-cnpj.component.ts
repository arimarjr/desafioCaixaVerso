import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DscInputComponent } from 'sidsc-components/dsc-input';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { cnpjValidator } from '../../validators/document.validator';

@Component({
  selector: 'app-input-cnpj',
  standalone: true,
  imports: [
    CommonModule,
    DscInputComponent,
    DscButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './input-cnpj.component.html',
  styleUrl: './input-cnpj.component.scss'
})
export class InputCnpjComponent implements OnInit {
  @Output() pesquisar = new EventEmitter<string>();

  formGroup!: FormGroup;

  // Evita dupla emissão quando click + ngSubmit disparam no mesmo instante
  private _emitindo = false;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this._initFormGroup();
  }

  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      cnpj: [null, [Validators.required, cnpjValidator()]],
    });
  }

  buscar(): void {
    if (this._emitindo) return;
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this._emitindo = true;
    setTimeout(() => (this._emitindo = false), 300);
    const cnpj = this.formGroup.get('cnpj')?.value ?? '';
    this.pesquisar.emit(cnpj.replace(/[^\d]/g, ''));
  }

  getErrorMessage(): string | undefined {
    const cnpjControl = this.formGroup.get('cnpj');
    if (!cnpjControl?.touched) return undefined;
    if (cnpjControl.hasError('required')) return 'Informe o CNPJ.';
    if (cnpjControl.hasError('cnpjInvalid')) return 'CNPJ inválido.';
    return undefined;
  }
}

