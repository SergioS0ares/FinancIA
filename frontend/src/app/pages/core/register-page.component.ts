import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-layout">
      <div class="auth-card">
        <h1>Criar conta no FinancIA</h1>
        <p class="subtitle">
          Cadastre-se para deixar a IA cuidar da leitura dos seus extratos.
        </p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <label class="field">
            <span>Nome</span>
            <input
              type="text"
              formControlName="nome"
              placeholder="Seu nome completo"
              autocomplete="name"
            />
          </label>

          <label class="field">
            <span>E-mail</span>
            <input
              type="email"
              formControlName="email"
              placeholder="seuemail@exemplo.com"
              autocomplete="email"
            />
          </label>

          <label class="field">
            <span>Senha</span>
            <input
              type="password"
              formControlName="password"
              placeholder="Mínimo de 6 caracteres"
              autocomplete="new-password"
            />
          </label>

          <button class="btn primary" type="submit" [disabled]="form.invalid">
            Criar conta
          </button>
        </form>

        <button class="btn ghost" type="button" (click)="goToLogin()">
          Já tenho conta
        </button>
      </div>
    </div>
  `,
})
export class RegisterPageComponent {
  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  onSubmit() {
    if (this.form.invalid) return;
    // Aqui depois vamos chamar o backend /api/auth/registrar
    console.log('Register form', this.form.value);
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}

