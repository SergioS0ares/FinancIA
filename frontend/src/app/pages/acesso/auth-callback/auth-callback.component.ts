import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `<p style="text-align:center;margin-top:24px;">Autenticando com o Google...</p>`
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const accessToken = params['access_token'] as string | undefined;
      const refreshToken = params['refresh_token'] as string | undefined;

      if (accessToken) {
        this.auth.setToken(accessToken);
        // Opcional: salvar refreshToken em outro lugar se você quiser usá-lo depois.
        this.router.navigate(['/app']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}

