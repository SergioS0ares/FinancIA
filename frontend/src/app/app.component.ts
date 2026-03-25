import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';

const THEME_KEY = 'app-theme';
const DARK_MODE_KEY = 'darkMode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    const legacyDark = localStorage.getItem(DARK_MODE_KEY) === 'true';
    const isDark = savedTheme === 'dark' || (savedTheme === null && legacyDark);

    const el = this.document.documentElement;
    if (isDark) {
      el.classList.add('dark', 'theme-dark');
    } else {
      el.classList.remove('dark', 'theme-dark');
    }
  }
}
