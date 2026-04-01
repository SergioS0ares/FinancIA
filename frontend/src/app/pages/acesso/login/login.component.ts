import { Component, inject, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AcessService } from '../../../core/services/access.service';
import { ToastrService } from 'ngx-toastr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ILoginForm } from '../../../Interfaces/ILoginForm.interface';
import { AuthService } from '../../../core/services/auth.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { bindGoogleButtonToTheme } from '../../../core/utils/google-identity';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleButton', { static: true }) googleButton!: ElementRef<HTMLDivElement>;

  loginForm: FormGroup<ILoginForm>;
  showLoginError = false;
  hidePassword = true;

  private router = inject(Router);
  private loginService = inject(AcessService);
  private toastService = inject(ToastrService);
  private authService = inject(AuthService);

  private unbindGoogle?: () => void;

  constructor() {
    this.loginForm = new FormGroup<ILoginForm>({
      email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      senha: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    });
  }

  ngAfterViewInit(): void {
    this.scheduleGoogleBind();
  }

  ngOnDestroy(): void {
    this.unbindGoogle?.();
  }

  /** GIS carrega com defer; tenta até o script estar disponível. */
  private scheduleGoogleBind(attempt = 0): void {
    const el = this.googleButton?.nativeElement;
    if (typeof google !== 'undefined' && el) {
      this.unbindGoogle = bindGoogleButtonToTheme(el, { text: 'continue_with' });
      return;
    }
    if (attempt < 35) {
      setTimeout(() => this.scheduleGoogleBind(attempt + 1), 100);
    }
  }

  realizarLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.get('email')?.value;
    const senha = this.loginForm.get('senha')?.value;

    if (email && senha) {
      this.loginService.postLogin(email, senha).subscribe({
        next: (res: any) => {
          this.showLoginError = false;
          if (res.idVerificacao) {
            this.toastService.info(res.mensagem || 'Código de verificação enviado para seu e-mail.');
            this.router.navigate(['/confirmar-codigo', res.idVerificacao]);
            return;
          }
          this.toastService.success('Login feito com sucesso!');
          const token = res.access_token ?? res.token;
          this.authService.setAuthData(
            token,
            res.nome ?? 'Usuário',
            res.tipoUsuario ?? 'CLIENTE',
            res.id,
            res.imagem,
            res.restauranteId
          );
          void this.router.navigate(['/app']);
        },
        error: (err: any) => {
          this.showLoginError = true;
          this.toastService.error(getApiErrorMessage(err, 'Não foi possível acessar sua conta. Verifique seu e-mail e senha.'));
        },
      });
    } else {
      this.showLoginError = true;
      this.toastService.error('Email ou senha inválidos.');
    }
  }

  irParaCadastro() {
    this.router.navigate(['signup']);
  }

  forgotPassword() {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.toastService.warning('Por favor, digite seu e-mail antes de solicitar a redefinição de senha.');
      return;
    }
    if (this.loginForm.get('email')?.invalid) {
      this.toastService.warning('Por favor, digite um e-mail válido.');
      return;
    }

    this.loginService.postEsqueciMinhaSenha(email).subscribe({
      next: () => this.toastService.success('Instruções para redefinição de senha foram enviadas para seu e-mail!'),
      error: (err) => this.toastService.error(getApiErrorMessage(err, 'Erro ao enviar e-mail de redefinição. Tente novamente.')),
    });
  }
}
