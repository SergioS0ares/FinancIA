import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

const THEME_KEY = 'app-theme';
const DARK_MODE_KEY = 'darkMode';

@Component({
  selector: 'app-default-login-layout',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './default-login-layout.component.html',
  styleUrl: './default-login-layout.component.scss',
})
export class DefaultLoginLayoutComponent implements OnInit {
  @Input() title = '';
  /** Ex.: "Login", "Cadastro" — linha "FinanciA — …" abaixo da marca */
  @Input() screenSubtitle = '';
  @Input() primaryBtnText = '';
  @Input() secondaryBtnText = '';
  @Input() disablePrimaryBtn = false;
  @Input() primaryBtnLoading = false;
  @Output() submit = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<void>();

  isDark = false;

  ngOnInit(): void {
    const root = document.documentElement;
    this.isDark = root.classList.contains('theme-dark') || root.classList.contains('dark');
  }

  onPrimaryClick(): void {
    this.submit.emit();
  }

  onSecondaryClick(): void {
    this.navigate.emit();
  }

  toggleTheme(): void {
    const root = document.documentElement;
    root.classList.toggle('theme-dark');
    root.classList.toggle('dark');
    this.isDark = root.classList.contains('theme-dark') || root.classList.contains('dark');
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_KEY, this.isDark ? 'dark' : 'light');
      localStorage.setItem(DARK_MODE_KEY, this.isDark ? 'true' : 'false');
    }
  }
}
