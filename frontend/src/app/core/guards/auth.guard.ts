import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AcessService } from '../services/access.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(@Inject(Router) private router: Router, private auth: AuthService, private loginService: AcessService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const token = this.auth.getToken();
    if (token) {
      return of(true);
    }
    // Tenta renovar o token usando o refreshToken (cookie HttpOnly)
    return this.loginService.postRefreshToken().pipe(
      map((response) => {
        const token = (response as any).access_token ?? response.token;
        this.auth.setToken(token);
        return true;
      }),
      catchError(() => of(this.router.createUrlTree(['/login'])))
    );
  }
}