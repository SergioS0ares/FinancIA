import { Component, inject } from '@angular/core';
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
export class SignUpComponent {

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
    const payload = {
      nome: form.name,
      email: form.email,
      password: form.password
    };
    this.loginService.postSignup(payload).subscribe({
      next: (res) => {
        this.toastService.success('Cadastro realizado com sucesso! Você já pode fazer login.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        const errorMessage = err.error?.erro || err.error?.message || "Erro inesperado! Tente novamente mais tarde";
        this.toastService.error(errorMessage);
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
