import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

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
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup<ILoginForm>;
  showLoginError = false;
  hidePassword = true;

  private router = inject(Router);
  private loginService = inject(AcessService);
  private toastService = inject(ToastrService);
  private authService = inject(AuthService);
  private socialAuthService = inject(SocialAuthService, { optional: true });
  private googleAuthSub: Subscription | null = null;

  constructor() {
    this.loginForm = new FormGroup<ILoginForm>({
      email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      senha: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
    });
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
          const token = (res as any).access_token ?? (res as any).token;
          this.authService.setAuthData(token, res.nome, res.tipoUsuario, res.id, res.imagem, res.restauranteId);
          this.router.navigate(['app']);
        },
        error: (err: any) => {
          this.showLoginError = true;
          const errorMessage = err.error?.erro || err.error?.message || 'Não foi possível acessar sua conta. Verifique seu e-mail e senha e tente novamente.';
          this.toastService.error(errorMessage);
        }
      });
    } else {
      this.showLoginError = true;
      this.toastService.error('Email ou senha inválidos.');
    }
  }

  ngOnInit(): void {
    if (this.socialAuthService) {
      this.googleAuthSub = this.socialAuthService.authState.subscribe((user: SocialUser | null) => {
        if (user?.idToken) {
          this.loginService.postLoginWithGoogle(user.idToken).subscribe({
            next: (res) => {
              this.showLoginError = false;
              this.toastService.success('Login feito com sucesso!');
              const token = (res as any).access_token ?? (res as any).token;
              this.authService.setAuthData(token, res.nome, res.tipoUsuario, res.id, res.imagem, res.restauranteId);
              this.router.navigate(['app']);
            },
            error: (err) => {
              this.showLoginError = true;
              const msg = err.error?.erro || err.error?.message || 'Não foi possível entrar com o Google. Tente novamente.';
              this.toastService.error(msg);
            }
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.googleAuthSub?.unsubscribe();
  }

  signInWithGoogle(): void {
    if (this.socialAuthService) {
      this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
    } else {
      this.toastService.warning('Login com Google não disponível. Verifique a configuração da origem no Google Cloud Console.');
    }
  }

  irParaCadastro() { this.router.navigate(['signup']); }

  forgotPassword() {
    const email = this.loginForm.get('email')?.value;
    if (!email) { this.toastService.warning('Por favor, digite seu e-mail antes de solicitar a redefinição de senha.'); return; }
    if (this.loginForm.get('email')?.invalid) { this.toastService.warning('Por favor, digite um e-mail válido.'); return; }

    this.loginService.postEsqueciMinhaSenha(email).subscribe({ next: () => this.toastService.success('Instruções para redefinição de senha foram enviadas para seu e-mail!'), error: (err) => this.toastService.error(err.error?.erro || err.error?.message || 'Erro ao enviar e-mail de redefinição. Tente novamente.') });
  }
}
