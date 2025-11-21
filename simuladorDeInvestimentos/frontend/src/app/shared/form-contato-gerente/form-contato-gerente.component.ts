import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-contato-gerente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './form-contato-gerente.component.html',
  styleUrls: ['./form-contato-gerente.component.scss']
})
export class FormContatoGerenteComponent {
  nome: string = '';
  email: string = '';
  telefone: string = '';
  patrimonio: number | null = null;
  patrimonioFormatado: string = '';
  perguntasCliente: string = '';
  aceitaContato: boolean = false;

  respostas: any[] = [];
  valorInicial: number | null = null;

  // Controla popup
  popupAberto: boolean = false;

  constructor(private router: Router) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.respostas = state['respostas'] || [];
      this.valorInicial = state['valorInicial'] || null;
    }
  }

  onPatrimonioInput(event: Event) {
    let value = (event.target as HTMLInputElement).value;
    let numericValue = value.replace(/\D/g, '');
    if (numericValue.length === 0) {
      this.patrimonio = null;
      this.patrimonioFormatado = '';
      return;
    }
    let cents = numericValue.slice(-2);
    let reais = numericValue.slice(0, -2) || '0';
    const numberValue = Number(reais + '.' + cents);
    this.patrimonio = numberValue;
    this.patrimonioFormatado = numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  enviarFormulario() {
    if (!this.aceitaContato) {
      alert('Você deve aceitar receber comunicações e concordar com a Política de Privacidade.');
      return;
    }

    const dados = {
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      patrimonio: this.patrimonio,
      perguntasCliente: this.perguntasCliente,
      aceitaContato: this.aceitaContato,
      valorInicial: this.valorInicial,
      respostas: this.respostas
    };

    fetch("http://localhost:3000/contato-gerente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro no envio do formulário");
        const msg = await res.json();
        console.log("Resposta do backend:", msg);

        // Abre popup estilo Caixa verde
        this.popupAberto = true;
      })
      .catch((err) => {
        console.error("Erro ao enviar formulário:", err);
        alert("Ocorreu um erro ao enviar o formulário. Tente novamente.");
      });
  }

  fecharPopup() {
    this.popupAberto = false;
    this.router.navigate(['/home']);
  }
}
