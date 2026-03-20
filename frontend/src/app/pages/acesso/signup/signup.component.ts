import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormArray, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AcessService } from '../../../core/services/access.service';
import { ToastrService } from 'ngx-toastr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { getApiErrorMessage } from '../../../core/utils/api-error';

declare const google: any;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatRadioModule,
    MatTabsModule,
    MatCheckboxModule,
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignUpComponent implements AfterViewInit {
  @ViewChild('googleButton', { static: false }) googleButton?: ElementRef<HTMLDivElement>;

  readonly siteKey = environment.recaptchaSiteKey;
  captchaToken: string | null = null;

   // Objeto para controlar a visibilidade de cada campo de senha
   passwordVisibility: { [key: string]: boolean } = {
    password: true,
    passwordConfirm: true
  };

  // single, extensible signup form
  signupForm: FormGroup;

  private router = inject(Router);
  private loginService = inject(AcessService);
  private toastService = inject(ToastrService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  mensagemCepInvalido = '';
  // future-proof: container for extra dynamic fields if needed
  extraFields = this.fb.group({});

  ngAfterViewInit(): void {
    // GIS carrega com defer; um tick garante o #googleButton no DOM
    setTimeout(() => this.initGoogleSignIn(), 0);
  }

  private initGoogleSignIn(): void {
    const el = this.googleButton?.nativeElement;
    if (!el) {
      return;
    }
    if (typeof google === 'undefined') {
      console.error('Google Identity Services script não carregado.');
      return;
    }
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      ux_mode: 'redirect',
      login_uri: 'http://localhost:8000/api/auth/google/callback',
    });
    google.accounts.id.renderButton(el, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'signup_with',
    });
  }

  constructor() {
    // Create a single, extensible signup form with clear field keys (easier to test)
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      password: ['', [Validators.required, this.validadorSenhaForte]],
      passwordConfirm: ['', [Validators.required]],
      extras: this.extraFields // placeholder group for future dynamic fields
    }, { validators: this.passwordMatchValidator });
  }

  // CORREÇÃO: Validadores definidos como arrow functions para manter o contexto do 'this'.
  validadorSenhaForte = (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (!valor) return null;
    const erros: ValidationErrors = {};
    if (valor.length < 8) {
      erros['minCaracteres'] = true;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(valor)) {
      erros['semCaractereEspecial'] = true;
    }
    return Object.keys(erros).length ? erros : null;
  }

  togglePasswordVisibility(field: string): void {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
  }

  passwordMatchValidator = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const passwordConfirm = group.get('passwordConfirm');
    if (password !== passwordConfirm?.value) {
      passwordConfirm?.setErrors({ passwordMismatch: true });
    } else {
      const currentErrors = { ...passwordConfirm?.errors };
      delete currentErrors['passwordMismatch'];
      passwordConfirm?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
    }
    return null;
  }

  onResolved(token: string | null): void {
    this.captchaToken = token;
  }

  cadastrar() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    const form = this.signupForm.getRawValue();
    this.loginService.postSignup({
      nome: form.name,
      email: form.email,
      password: form.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('emailCadastro', form.email);
        this.toastService.success(
          res.message ?? 'Cadastro criado! Verifique seu e-mail para o código de 6 dígitos.',
          'Quase lá'
        );
        if (res.idVerificacao) {
          this.router.navigate(['/confirmar-codigo', res.idVerificacao]);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err: any) => {
        this.toastService.error(getApiErrorMessage(err, 'Erro ao cadastrar. Tente novamente.'));
      }
    });
  }

  submitForm() {
    this.cadastrar();
  }

  irParaLogin() {
    this.router.navigate(["/login"]);
  }
}
