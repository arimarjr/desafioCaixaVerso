import { Component, TemplateRef, ViewChild } from '@angular/core';
import { DscStepperComponent, DscStepperModel } from 'sidsc-components/dsc-stepper';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DscInputComponent } from 'sidsc-components/dsc-input';
@Component({
  selector: 'app-etapas-stepper',
  imports: [DscStepperComponent,
    DscInputComponent,
    FormsModule,
    ReactiveFormsModule],
  templateUrl: './etapas-stepper.component.html',
  styleUrl: './etapas-stepper.component.scss'
})
export class EtapasStepperComponent {

  @ViewChild('firstContentTemplate', { static: true })
  private _firstContentTemplate!: TemplateRef<any>;

  @ViewChild('secondContentTemplate', { static: true })
  private _secondContentTemplate!: TemplateRef<any>;

  @ViewChild('thirdContentTemplate', { static: true })
  private _thirdContentTemplate!: TemplateRef<any>;

  stepperHorizontal!: DscStepperModel;

  stepperVertical!: DscStepperModel;

  firstFormGroup!: FormGroup;

  secondFormGroup!: FormGroup;

  thirdFormGroup!: FormGroup;

  selectedIndex: number = 0;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this._initFirstFormControl();
    this._initSecondFormControl();
    this._initStepperHorizontal();
    this._initStepperVertical();
    this._initLastStep();
  }

  private _initStepperHorizontal(): void {
    this.stepperHorizontal = {
      selectedIndex: 0,
      steps: [
        {
          label: 'Cadastro',
          formGroup: this.firstFormGroup,
          contentTemplate: this._firstContentTemplate
        },
        {
          label: 'Avaliação de Crédito',
          formGroup: this.secondFormGroup,
          contentTemplate: this._secondContentTemplate
        },
        {
          label: 'Abertura de Conta',
          formGroup: this.thirdFormGroup,
          contentTemplate: this._thirdContentTemplate
        },
      ]
    };
  }

  private _initStepperVertical(): void {
    this.stepperVertical = {
      selectedIndex: 0,
      orientation: 'vertical',
      steps: [
        {
          label: 'Cadastro',
          formGroup: this.firstFormGroup,
          contentTemplate: this._firstContentTemplate
        },
        {
          label: 'Avaliação de Crédito',
          formGroup: this.secondFormGroup,
          contentTemplate: this._secondContentTemplate
        },
        {
          label: 'Abertura de Conta',
          formGroup: this.thirdFormGroup,
          contentTemplate: this._thirdContentTemplate
        },
      ]
    };
  }

  private _initFirstFormControl(): void {
    this.firstFormGroup = this._formBuilder.group({
      nome: [null]
    });

    this.selectedIndex = 1;
  }

  private _initSecondFormControl(): void {
    this.secondFormGroup = this._formBuilder.group({
      endereco: [null]
    });

    this.selectedIndex = 2;
  }

  private _initLastStep(): void {
    this.thirdFormGroup = this._formBuilder.group({
      telefone: [null]
    });

    this.selectedIndex = 3;
  }
}
