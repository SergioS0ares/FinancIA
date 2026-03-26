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
      descricao: ['', Validators.required],
      categoria: [''],
      data: [new Date().toISOString()],
    });
  }

  salvar(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const raw = this.form.value;

    // Garantir tipos corretos pro backend.
    const payload: Transacao = {
      tipo: raw.tipo,
      valor: Number(raw.valor),
      descricao: raw.descricao,
      categoria: raw.categoria || undefined,
      data: raw.data,
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

