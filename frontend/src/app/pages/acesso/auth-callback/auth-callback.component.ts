import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AcessService } from '../../../core/services/access.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height: 240px; display: flex; align-items: center; justify-content: center; padding: 24px;">
      <div style="text-align: center;">
        <div style="font-weight: 700; margin-bottom: 8px;">Autenticando...</div>
        <div style="opacity: 0.75;">Por favor, aguarde o redirecionamento.</div>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private accessService = inject(AcessService);

  ngOnInit(): void {
    const accessToken =
      this.route.snapshot.queryParamMap.get('access_token') ??
      this.route.snapshot.queryParamMap.get('token');

    if (accessToken) {
      this.auth.setToken(accessToken);
      this.router.navigate(['/app']);
      return;
    }

    // Caso o backend/setcookie não retorne token na URL, tentamos renovar via refresh token (cookie HTTP-Only).
    this.accessService
      .postRefreshToken()
      .pipe(
        catchError(() => of(null))
      )
      .subscribe((res) => {
        // accessService já tenta setar token via tap; só garantimos o redirect.
        if (res) this.router.navigate(['/app']);
        else this.router.navigate(['/login']);
      });
  }
}

