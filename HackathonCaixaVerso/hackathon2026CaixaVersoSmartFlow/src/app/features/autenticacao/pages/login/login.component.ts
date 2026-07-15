import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Subject } from 'rxjs';
import { catchError, exhaustMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutenticacaoService } from '../../../../core/services/autenticacao.service';
import { AutenticacaoStore } from '../../../../core/store/autenticacao.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AutenticacaoService);
  private readonly store       = inject(AutenticacaoStore);
  private readonly router      = inject(Router);
  private readonly route       = inject(ActivatedRoute);

  // Sinais de estado da UI (somente leitura para o template)
  readonly carregando = this.store.carregando;
  readonly erro       = this.store.erro;

  readonly form = this.fb.group({
    matricula: [
      '',
      [Validators.required, Validators.pattern(/^[cC]\d{6}$/)],
    ],
    senha: ['', [Validators.required, Validators.minLength(1)]],
  });

  // Subject que dispara o fluxo de login; exhaustMap garante que
  // cliques múltiplos não disparem múltiplas requisições simultâneas.
  private readonly submit$ = new Subject<void>();

  constructor() {
    this.submit$
      .pipe(
        exhaustMap(() => {
          if (this.form.invalid) return EMPTY;

          const { matricula, senha } = this.form.getRawValue();
          this.store.iniciarCarregamento();

          return this.authService.login(matricula!, senha!).pipe(
            catchError((err: HttpErrorResponse) => {
              const mensagem =
                err.status === 401
                  ? 'Matrícula ou senha incorretos.'
                  : err.status === 429
                    ? 'Muitas tentativas. Aguarde um minuto e tente novamente.'
                    : 'Erro ao conectar ao servidor. Tente novamente.';
              this.store.definirErro(mensagem);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ?? '/pagina-inicial';
        this.router.navigateByUrl(returnUrl);
      });
  }

  onSubmit(): void {
    this.submit$.next();
  }
}
