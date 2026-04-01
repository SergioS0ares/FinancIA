// src/app/pages/layout-principal/layout-principal.component.ts
import { Component, HostListener, Inject, type OnDestroy, type OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { AcessService } from '../../core/services/access.service';
import { NovaTransacaoDialogComponent } from './nova-transacao-dialog/nova-transacao-dialog.component';
import { TransactionRefreshService } from '../../core/services/transaction-refresh.service';

const THEME_KEY = 'app-theme';
const DARK_MODE_KEY = 'darkMode';

@Component({
  selector: 'app-layout-principal',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './layout-principal.component.html',
  styleUrl: './layout-principal.component.scss',
})
export class LayoutPrincipalComponent implements OnInit, OnDestroy {
  sidebarAberta = true;
  mobileSidebarAberta = false;
  /** Menu lateral no desktop (md+). */
  desktopSidebarExpanded = true;
  isDark = false;

  constructor(
    public router: Router,
    private auth: AuthService,
    private acessService: AcessService,
    private dialog: MatDialog,
    private transactionRefresh: TransactionRefreshService,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  ngOnInit(): void {
    const el = this.document.documentElement;
    this.isDark = el.classList.contains('theme-dark') || el.classList.contains('dark');
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    if (ev.key !== 'Escape' || !this.mobileSidebarAberta || this.isDesktopNav()) {
      return;
    }
    ev.preventDefault();
    this.closeMobileSidebar();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.matchMedia('(min-width: 768px)').matches) {
      this.mobileSidebarAberta = false;
      this.document.body.style.overflow = '';
    }
  }

  get userName(): string {
    return this.auth.perfil?.nome || 'Usuário';
  }

  get userInitial(): string {
    const n = this.userName.trim();
    return n ? n.charAt(0).toUpperCase() : '?';
  }

  toggleDesktopSidebar(): void {
    this.desktopSidebarExpanded = !this.desktopSidebarExpanded;
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

  toggleTheme(): void {
    const root = this.document.documentElement;
    root.classList.toggle('theme-dark');
    root.classList.toggle('dark');
    this.isDark = root.classList.contains('theme-dark') || root.classList.contains('dark');
    this.persistTheme();
  }

  private isDesktopNav(): boolean {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.matchMedia('(min-width: 768px)').matches;
  }

  onNavToggle(): void {
    if (this.isDesktopNav()) {
      this.toggleDesktopSidebar();
    } else {
      this.toggleMobileDrawer();
    }
  }

  get navToggleIcon(): string {
    if (this.isDesktopNav()) {
      return this.desktopSidebarExpanded ? 'chevron_left' : 'chevron_right';
    }
    return this.mobileSidebarAberta ? 'chevron_left' : 'chevron_right';
  }

  get navToggleAriaLabel(): string {
    if (this.isDesktopNav()) {
      return this.desktopSidebarExpanded ? 'Recolher menu' : 'Expandir menu';
    }
    return this.mobileSidebarAberta ? 'Fechar menu' : 'Abrir menu';
  }

  get navToggleTitle(): string {
    return this.navToggleAriaLabel;
  }

  toggleMobileDrawer(): void {
    this.mobileSidebarAberta = !this.mobileSidebarAberta;
    this.syncMobileDrawerBodyLock();
  }

  closeMobileSidebar(): void {
    this.mobileSidebarAberta = false;
    this.syncMobileDrawerBodyLock();
  }

  private syncMobileDrawerBodyLock(): void {
    const body = this.document.body;
    if (!body || typeof window === 'undefined') {
      return;
    }
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    body.style.overflow = this.mobileSidebarAberta && mobile ? 'hidden' : '';
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

  abrirNovaTransacao(): void {
    const ref = this.dialog.open(NovaTransacaoDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.transactionRefresh.requestReload();
    });
  }
}
