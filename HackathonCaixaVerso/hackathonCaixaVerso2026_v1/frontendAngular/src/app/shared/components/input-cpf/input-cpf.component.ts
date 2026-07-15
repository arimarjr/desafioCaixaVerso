import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DscInputComponent } from 'sidsc-components/dsc-input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { cpfValidator } from '../../validators/document.validator';

@Component({
  selector: 'app-input-cpf',
  standalone: true,
  imports: [CommonModule, DscInputComponent, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './input-cpf.component.html',
  styleUrl: './input-cpf.component.scss'
})
export class InputCpfComponent implements OnInit {
  formGroup!: FormGroup;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this._initFormGroup();
  }

  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      cpf: [null, [Validators.required, cpfValidator()]],
    });
  }

  getErrorMessage(): string | undefined {
    const cpfControl = this.formGroup.get('cpf');
    if (!cpfControl?.touched) return undefined;
    if (cpfControl.hasError('required')) return 'Informe o CPF.';
    if (cpfControl.hasError('cpfInvalid')) return 'CPF inválido.';
    return undefined;
  }
