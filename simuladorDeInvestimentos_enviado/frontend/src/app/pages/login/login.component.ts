import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loading = false;
  errorMessage = '';

  form: any;

  // Usuário fake para testes
  usuarioFake = {
    email: "cliente@exemplo.com",
    senha: "123456",
    id: 123
  };

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  login() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, senha } = this.form.value;

    // ===== LOGIN FAKE =====
    if (email === this.usuarioFake.email && senha === this.usuarioFake.senha) {
      // simula retorno do backend
      localStorage.setItem('token', 'token-fake-teste');
      localStorage.setItem('clienteId', this.usuarioFake.id.toString());

      // navega para dashboard
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Email ou senha incorretos';
      this.loading = false;
    }
  }
}
