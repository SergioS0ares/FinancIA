import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

import { TransactionService, type Transacao } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-nova-transacao-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './nova-transacao-dialog.component.html',
  styleUrls: ['./nova-transacao-dialog.component.scss'],
})
export class NovaTransacaoDialogComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NovaTransacaoDialogComponent, Transacao | null>,
    private transactionService: TransactionService,
    private toastr: ToastrService,
  ) {
    this.form = this.fb.group({
      tipo: ['despesa', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      descricao: ['', [Validators.required, Validators.maxLength(200)]],
      categoria: ['', Validators.maxLength(80)],
      dataLocal: [NovaTransacaoDialogComponent.toDatetimeLocalValue(new Date()), Validators.required],
    });
  }

  /** Valor para input type="datetime-local" (fuso local). */
  private static toDatetimeLocalValue(d: Date): string {
    const offsetMs = d.getTimezoneOffset() * 60_000;
    const local = new Date(d.getTime() - offsetMs);
    return local.toISOString().slice(0, 16);
  }

  private static fromDatetimeLocalValue(s: string): string {
    return new Date(s).toISOString();
  }

  salvar(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const raw = this.form.value;

    const payload: Transacao = {
      tipo: raw.tipo,
      valor: Number(raw.valor),
      descricao: raw.descricao?.trim(),
      categoria: raw.categoria?.trim() || undefined,
      data: NovaTransacaoDialogComponent.fromDatetimeLocalValue(raw.dataLocal),
    };

    this.transactionService.criarTransacao(payload).subscribe({
      next: (res) => {
        this.toastr.success('Transação salva com sucesso!');
        this.dialogRef.close(res);
      },
      error: () => {
        this.toastr.error('Erro ao salvar transação');
        this.loading = false;
      },
    });
  }
}
