import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

const THEME_KEY = 'app-theme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark') document.documentElement.classList.add('theme-dark');
      else if (saved === 'light') document.documentElement.classList.remove('theme-dark');
    }
  }
}

