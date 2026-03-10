import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-layout">
      <div class="auth-card">
        <h1>Entrar no FinancIA</h1>
        <p class="subtitle">
          Acesse seu painel seguro para enviar extratos e acompanhar seus insights financeiros.
        </p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
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
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </label>

          <button class="btn primary" type="submit" [disabled]="form.invalid">
            Entrar
          </button>
        </form>

        <button class="btn ghost" type="button" (click)="goToRegister()">
          Criar minha conta
        </button>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  onSubmit() {
    if (this.form.invalid) return;
    // Aqui depois vamos chamar o backend /api/auth/login
    console.log('Login form', this.form.value);
  }

  goToRegister() {
    this.router.navigate(['/auth/registrar']);
  }
}

