// src/app/pages/layout-principal/layout-principal.component.ts
import { Component, Inject, type OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { AcessService } from '../../core/services/access.service';
import { TransactionService, type Transacao } from '../../core/services/transaction.service';
import { NovaTransacaoDialogComponent } from './nova-transacao-dialog/nova-transacao-dialog.component';
import { ToastrService } from 'ngx-toastr';

const THEME_KEY = 'app-theme';
const DARK_MODE_KEY = 'darkMode';

@Component({
  selector: 'app-layout-principal',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './layout-principal.component.html',
  styleUrl: './layout-principal.component.scss',
  animations: [],
})
export class LayoutPrincipalComponent implements OnInit {
  sidebarAberta = true;
  mobileSidebarAberta = false;
  /** Item ativo do menu (visual do mock). */
  activeNav = 0;
  isDark = false;

  transacoes: Transacao[] = [];
  saldoTotal = 0;
  carregandoTransacoes = false;

  constructor(
    public router: Router,
    private auth: AuthService,
    private acessService: AcessService,
    private dialog: MatDialog,
    private transactionService: TransactionService,
    private toastr: ToastrService,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  ngOnInit(): void {
    const el = this.document.documentElement;
    this.isDark = el.classList.contains('theme-dark') || el.classList.contains('dark');

    this.carregarTransacoes();
  }

  get userName(): string {
    return this.auth.perfil?.nome || 'Usuário';
  }

  get userType(): string {
    const tipo = this.auth.perfil?.tipo;
    switch (tipo) {
      case 'RESTAURANTE':
        return 'Restaurante';
      case 'FUNCIONARIO':
        return 'Funcionário';
      default:
        return 'Cliente';
    }
  }

  setActiveNav(index: number): void {
    this.activeNav = index;
  }

  private persistTheme(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(THEME_KEY, this.isDark ? 'dark' : 'light');
    localStorage.setItem(DARK_MODE_KEY, this.isDark ? 'true' : 'false');
  }

  setLightTheme(): void {
    const el = this.document.documentElement;
    el.classList.remove('dark', 'theme-dark');
    this.isDark = false;
    this.persistTheme();
  }

  setDarkTheme(): void {
    const el = this.document.documentElement;
    el.classList.add('dark', 'theme-dark');
    this.isDark = true;
    this.persistTheme();
  }

  handleSidebarClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    if (!this.sidebarAberta) {
      this.sidebarAberta = true;
    }
  }

  toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      this.mobileSidebarAberta = !this.mobileSidebarAberta;
      return;
    }
    this.sidebarAberta = !this.sidebarAberta;
  }

  closeMobileSidebar(): void {
    this.mobileSidebarAberta = false;
  }

  logout(): void {
    this.acessService.postLogout().subscribe({
      next: () => {
        try {
          this.auth.clearAuthData();
        } catch {
          /* ignore */
        }
        void this.router.navigate(['/login']);
      },
      error: () => {
        try {
          this.auth.clearAuthData();
        } catch {
          /* ignore */
        }
        void this.router.navigate(['/login']);
      },
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
        this.transacoes = res ?? [];
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
      if (result) this.carregarTransacoes();
    });
  }
}
