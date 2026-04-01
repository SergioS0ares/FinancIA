import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TransactionService, type Transacao } from '../../core/services/transaction.service';
import { TransactionRefreshService } from '../../core/services/transaction-refresh.service';
import { NovaTransacaoDialogComponent } from '../layout-principal/nova-transacao-dialog/nova-transacao-dialog.component';
import { ToastrService } from 'ngx-toastr';

type FiltroTipo = 'todos' | 'receita' | 'despesa';

@Component({
  selector: 'app-historico-transacoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './historico-transacoes.component.html',
  styleUrl: './historico-transacoes.component.scss',
})
export class HistoricoTransacoesComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly refresh = inject(TransactionRefreshService);
  private readonly dialog = inject(MatDialog);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  todas: Transacao[] = [];
  carregando = false;

  filtroTipo: FiltroTipo = 'todos';
  dataInicio = '';
  dataFim = '';
  /** Texto livre: filtra por nome da categoria (contém, ignora maiúsculas). */
  filtroCategoria = '';

  ngOnInit(): void {
    this.carregar();
    this.refresh.onReload.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.carregar());
  }

  private ordenarPorDataDesc(lista: Transacao[]): Transacao[] {
    return [...lista].sort((a, b) => {
      const ta = a.data ? new Date(a.data).getTime() : 0;
      const tb = b.data ? new Date(b.data).getTime() : 0;
      return tb - ta;
    });
  }

  carregar(): void {
    this.carregando = true;
    this.transactionService.listarTransacoes().subscribe({
      next: (res) => {
        this.todas = this.ordenarPorDataDesc(res ?? []);
        this.carregando = false;
      },
      error: () => {
        this.toastr.error('Erro ao carregar histórico');
        this.carregando = false;
      },
    });
  }

  limparFiltros(): void {
    this.filtroTipo = 'todos';
    this.dataInicio = '';
    this.dataFim = '';
    this.filtroCategoria = '';
  }

  abrirNovaTransacao(): void {
    const ref = this.dialog.open(NovaTransacaoDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.refresh.requestReload();
    });
  }

  get filtradas(): Transacao[] {
    let list = [...this.todas];

    if (this.filtroTipo !== 'todos') {
      list = list.filter((t) => t.tipo === this.filtroTipo);
    }

    const catQ = this.filtroCategoria.trim().toLowerCase();
    if (catQ) {
      list = list.filter((t) => (t.categoria || '').toLowerCase().includes(catQ));
    }

    if (this.dataInicio) {
      const start = new Date(this.dataInicio + 'T00:00:00').getTime();
      list = list.filter((t) => {
        if (!t.data) return false;
        return new Date(t.data).getTime() >= start;
      });
    }

    if (this.dataFim) {
      const end = new Date(this.dataFim + 'T23:59:59.999').getTime();
      list = list.filter((t) => {
        if (!t.data) return false;
        return new Date(t.data).getTime() <= end;
      });
    }

    return this.ordenarPorDataDesc(list);
  }
}
