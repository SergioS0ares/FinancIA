import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { AcessService } from '../../../core/services/access.service';
import { DefaultLoginLayoutComponent } from '../default-login-layout/default-login-layout.component';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-confirmar-codigo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DefaultLoginLayoutComponent,
    MatCheckboxModule,
    MatIconModule,
  ],
  templateUrl: './confirmar-codigo.component.html',
  styleUrls: ['./confirmar-codigo.component.scss'],
})
export class ConfirmarCodigoComponent implements OnInit {
  /** Um caractere por célula OTP (0–9) */
  readonly otpIndices = [0, 1, 2, 3, 4, 5] as const;
  digits: string[] = ['', '', '', '', '', ''];

  idVerificacao: string | null = null;
  mantenhaMeConectado = false;

  carregando = false;
  reenviando = false;
  isReenviarDisabled = false;
  reenviarButtonText = 'Reenviar código';

  hasError = false;
  statusMessage = '';
  statusType: 'success' | 'error' | 'info' = 'info';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accessService = inject(AcessService);
  private toastService = inject(ToastrService);

  ngOnInit(): void {
    this.idVerificacao = this.route.snapshot.paramMap.get('id');

    if (!this.idVerificacao) {
      this.toastService.error('ID de verificação inválido ou ausente.', 'Erro de segurança');
      void this.router.navigate(['/login']);
    }
  }

  get codigo(): string {
    return this.digits.join('');
  }

  isCodigoCompleto(): boolean {
    return /^\d{6}$/.test(this.codigo);
  }

  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const char = raw.slice(-1);
    this.digits[index] = char;
    input.value = char;
    this.hasError = false;
    this.statusMessage = '';
    if (char && index < 5) {
      this.focusOtpCell(index + 1);
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.focusOtpCell(index - 1);
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const nums = text.replace(/\D/g, '').slice(0, 6).split('');
    for (let i = 0; i < 6; i++) {
      this.digits[i] = nums[i] ?? '';
    }
    this.syncDomValues();
    const nextEmpty = this.digits.findIndex(d => d === '');
    this.focusOtpCell(nextEmpty === -1 ? 5 : nextEmpty);
    this.hasError = false;
    this.statusMessage = '';
  }

  private syncDomValues(): void {
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById(`otp-${i}`) as HTMLInputElement | null;
      if (el) {
        el.value = this.digits[i];
      }
    }
  }

  private focusOtpCell(index: number): void {
    const clamped = Math.max(0, Math.min(5, index));
    requestAnimationFrame(() => {
      document.getElementById(`otp-${clamped}`)?.focus();
    });
  }

  getStatusIcon(): string {
    switch (this.statusType) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'cancel';
      default:
        return 'info';
    }
  }

  verificarCodigo(): void {
    if (!this.isCodigoCompleto() || !this.idVerificacao) {
      return;
    }

    this.carregando = true;
    this.statusMessage = 'Verificando segurança...';
    this.statusType = 'info';

    this.accessService
      .postVerificarCodigo(this.idVerificacao, this.codigo, this.mantenhaMeConectado)
      .subscribe({
        next: () => {
          this.carregando = false;
          this.statusType = 'success';
          this.statusMessage = 'Código verificado! Entrando...';
          this.toastService.success('Conta ativada com sucesso!', 'Bem-vindo');
          void this.router.navigate(['/app']);
        },
        error: (err: unknown) => {
          this.carregando = false;
          this.hasError = true;
          this.statusType = 'error';
          this.digits = ['', '', '', '', '', ''];
          this.syncDomValues();
          this.focusOtpCell(0);
          this.statusMessage = getApiErrorMessage(err, 'Código inválido ou expirado.');
        },
      });
  }

  reenviarCodigo(): void {
    if (!this.idVerificacao) {
      return;
    }

    const emailCadastro = localStorage.getItem('emailCadastro');
    if (!emailCadastro) {
      this.toastService.error('Não foi possível identificar o e-mail. Volte ao cadastro ou ao login.');
      return;
    }

    this.reenviando = true;
    this.accessService.postReenviarCodigo(emailCadastro).subscribe({
      next: () => {
        this.reenviando = false;
        this.statusType = 'success';
        this.statusMessage = 'Um novo código foi enviado para o seu e-mail.';
        this.iniciarCooldownReenvio();
      },
      error: () => {
        this.reenviando = false;
        this.toastService.error('Erro ao reenviar o código.', 'Erro');
      },
    });
  }

  voltarVerificacao(): void {
    void this.router.navigate(['/verificacao-email']);
  }

  private iniciarCooldownReenvio(): void {
    this.isReenviarDisabled = true;
    let segundos = 60;

    const intervalo = window.setInterval(() => {
      segundos--;
      this.reenviarButtonText = `Aguarde ${segundos}s`;

      if (segundos <= 0) {
        clearInterval(intervalo);
        this.isReenviarDisabled = false;
        this.reenviarButtonText = 'Reenviar código';
      }
    }, 1000);
  }
}
