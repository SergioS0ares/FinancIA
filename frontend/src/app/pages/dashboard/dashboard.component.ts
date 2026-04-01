import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService, type Transacao } from '../../core/services/transaction.service';
import { TransactionRefreshService } from '../../core/services/transaction-refresh.service';
import { NovaTransacaoDialogComponent } from '../layout-principal/nova-transacao-dialog/nova-transacao-dialog.component';
import { ToastrService } from 'ngx-toastr';

export interface GastoPorCategoria {
  categoria: string;
  valor: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly refresh = inject(TransactionRefreshService);
  private readonly dialog = inject(MatDialog);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  transacoes: Transacao[] = [];
  saldoTotal = 0;
  carregandoTransacoes = false;

  /** Até 5 movimentações mais recentes (por data). */
  readonly limiteRecentes = 5;

  ngOnInit(): void {
    this.carregarTransacoes();
    this.refresh.onReload.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.carregarTransacoes());
  }

  /** Soma de receitas no período carregado. */
  get totalReceitas(): number {
    return this.transacoes
      .filter((t) => t.tipo === 'receita')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  }

  /** Soma de despesas no período carregado. */
  get totalDespesas(): number {
    return this.transacoes
      .filter((t) => t.tipo === 'despesa')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  }

  /** Despesas agrupadas por categoria (maiores primeiro). */
  get gastosPorCategoria(): GastoPorCategoria[] {
    const map = new Map<string, number>();
    for (const t of this.transacoes) {
      if (t.tipo !== 'despesa') continue;
      const raw = (t.categoria || '').trim();
      const c = raw || 'Sem categoria';
      map.set(c, (map.get(c) || 0) + (Number(t.valor) || 0));
    }
    return Array.from(map.entries())
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }

  get maxValorCategoria(): number {
    const arr = this.gastosPorCategoria;
    if (!arr.length) return 1;
    return Math.max(...arr.map((x) => x.valor), 0.01);
  }

  /** Largura da barra em % (0–100) para o maior gasto = 100%. */
  larguraBarraCategoria(valor: number): number {
    return Math.min(100, (valor / this.maxValorCategoria) * 100);
  }

  /** Categoria sugerida para o card de IA (a que mais pesa em despesas). */
  get categoriaParaInsight(): string {
    const top = this.gastosPorCategoria[0];
    return top?.categoria ?? 'Restaurantes';
  }

  get transacoesRecentes(): Transacao[] {
    return this.transacoes.slice(0, this.limiteRecentes);
  }

  private ordenarPorDataRecente(lista: Transacao[]): Transacao[] {
    return [...lista].sort((a, b) => {
      const ta = a.data ? new Date(a.data).getTime() : 0;
      const tb = b.data ? new Date(b.data).getTime() : 0;
      return tb - ta;
    });
  }

  private calcularSaldo(): void {
    this.saldoTotal = this.transacoes.reduce((acc, t) => {
      const valor = Number(t.valor) || 0;
      return acc + (t.tipo === 'receita' ? valor : -valor);
    }, 0);
  }

  carregarTransacoes(): void {
    this.carregandoTransacoes = true;
    this.transactionService.listarTransacoes().subscribe({
      next: (res) => {
        this.transacoes = this.ordenarPorDataRecente(res ?? []);
        this.calcularSaldo();
        this.carregandoTransacoes = false;
      },
      error: () => {
        this.toastr.error('Erro ao carregar transações');
        this.carregandoTransacoes = false;
      },
    });
  }

  abrirNovaTransacao(): void {
    const ref = this.dialog.open(NovaTransacaoDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      disableClose: this.carregandoTransacoes,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.refresh.requestReload();
    });
  }
}
