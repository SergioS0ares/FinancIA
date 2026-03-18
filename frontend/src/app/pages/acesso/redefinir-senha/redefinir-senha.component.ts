import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AcessService } from '../../../core/services/access.service';
import { DefaultLoginLayoutComponent } from '../default-login-layout/default-login-layout.component';
import { getApiErrorMessage } from '../../../core/utils/api-error';

// Imports do Angular Material e NG-Zorro (similares ao seu login)
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Validador customizado para verificar se as senhas são iguais (mesmo do signup)
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('novaSenha')?.value;
  const passwordConfirm = control.get('confirmarSenha');
  if (password !== passwordConfirm?.value) {
    passwordConfirm?.setErrors({ passwordMismatch: true });
  } else {
    const currentErrors = { ...passwordConfirm?.errors };
    delete currentErrors['passwordMismatch'];
    passwordConfirm?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
  }
  return null;
}

@Component({
  selector: 'app-redefinir-senha',
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
  templateUrl: './redefinir-senha.component.html',
  styleUrls: ['./redefinir-senha.component.scss']
})
export class RedefinirSenhaComponent implements OnInit {
  resetForm: FormGroup;
  token: string | null = null;
  
  isLoading = false; // Não precisa mais de loading inicial
  hidePassword = true;
  hideConfirmPassword = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accessService = inject(AcessService);
  private toastService = inject(ToastrService);
  private fb = inject(FormBuilder);

  constructor() {
    this.resetForm = this.fb.group({
      novaSenha: ['', [Validators.required, this.validadorSenhaForte]],
      confirmarSenha: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    // Captura o token dos path parameters
    this.token = this.route.snapshot.paramMap.get('token');
    
    console.log('Token capturado da URL:', this.token);

    if (!this.token) {
      this.toastService.error("Token de redefinição não encontrado na URL.", "Erro");
      this.router.navigate(['/login']);
      return;
    }
  }

  // Validador de senha forte (mesmo do signup)
  validadorSenhaForte = (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (!valor) return null;
    const erros: ValidationErrors = {};
    if (valor.length < 8) {
      erros['minCaracteres'] = true;
    }
    if (valor.length >= 8 && !/[!@#$%^&*(),.?":{}|<>]/.test(valor)) {
      erros['semCaractereEspecial'] = true;
    }
    return Object.keys(erros).length ? erros : null;
  }

  onSubmit(): void {
    console.log('onSubmit chamado');
    console.log('Formulário válido:', this.resetForm.valid);
    console.log('Token:', this.token);
    console.log('Erros do formulário:', this.resetForm.errors);
    console.log('Erros novaSenha:', this.resetForm.get('novaSenha')?.errors);
    console.log('Erros confirmarSenha:', this.resetForm.get('confirmarSenha')?.errors);

    if (this.resetForm.invalid || !this.token) {
      console.log('Formulário inválido ou token ausente');
      this.resetForm.markAllAsTouched();
      return;
    }

    console.log('Iniciando requisição de redefinição de senha');
    this.isLoading = true;
    const novaSenha = this.resetForm.get('novaSenha')?.value;
    
    this.accessService.postRedefinirSenha(this.token, novaSenha).subscribe({
      next: (response: any) => {
        console.log('Resposta da redefinição:', response);
        this.isLoading = false;
        this.toastService.success("Sua senha foi redefinida com sucesso!", "Sucesso!");
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastService.error(getApiErrorMessage(err, 'Não foi possível redefinir sua senha. Tente solicitar um novo link.'), 'Erro');
      }
    });
  }
}