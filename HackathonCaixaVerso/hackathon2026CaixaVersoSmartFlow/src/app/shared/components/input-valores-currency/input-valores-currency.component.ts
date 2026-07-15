import { Component, OnInit } from '@angular/core';
import { DscInputCurrencyComponent } from 'sidsc-components/dsc-input-currency';

@Component({
  selector: 'app-input-valores-currency',
  imports: [DscInputCurrencyComponent ],
  templateUrl: './input-valores-currency.component.html',
  styleUrl: './input-valores-currency.component.scss'
})
export class InputValoresCurrencyComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {
    
  }
}
