import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, EMPTY, throwError } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { AuthService } from '../services/auth.service';
import { AcessService } from '../services/access.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string|null>(null);

  private publicRoutes = [
    '/api/auth/login',
    '/api/auth/registrar',
    '/api/auth/google',
    '/api/auth/verificar',
    '/api/auth/reenviar-codigo',
    '/api/auth/refresh',
    '/api/auth/logout',
    '/api/auth/redefinir-senha',
    '/api/auth/mudar-senha/',
    '/api/auth/esqueci-senha'
  ];

  constructor(
    private auth: AuthService,
    private loginService: AcessService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApiRequest = request.url.startsWith(`${environment.apiUrl}`);
    
    // NOVO: Verifica se a rota da requisição está na nossa lista de rotas públicas
    const isPublicRoute = this.publicRoutes.some(route => request.url.includes(route));

    // Se não for uma requisição para a nossa API ou se for uma rota pública,
    // simplesmente passamos a requisição adiante sem modificá-la.
    if (!isApiRequest || isPublicRoute) {
      return next.handle(request);
    }
    
    // Se for uma rota privada da API, adicionamos o token
    const token = this.auth.getToken();
    const authReq = request.clone({
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true
    });

    return next.handle(authReq).pipe(
      catchError(err => {
        if (!(err instanceof HttpErrorResponse)) {
          return throwError(() => err);
        }

        if (err.status === 401 && request.url.includes('/auth/refresh')) {
          this.auth.clearAuthData();
          this.router.navigate(['/login']);
          return EMPTY;
        }

        if (err.status === 401) {
          return this.handle401Error(authReq, next);
        }

        return throwError(() => err);
      })
    );
  }
  
  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.loginService.postRefreshToken().pipe(
        switchMap(res => {
          const token = (res as any).access_token ?? res.token;
          this.refreshTokenSubject.next(token);
          const retry = request.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          return next.handle(retry);
        }),
        catchError(_ => {
          this.auth.clearAuthData();
          this.router.navigate(['/login']);
          return EMPTY;
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(t => t != null),
      take(1),
      switchMap(tkn => {
        const retry = request.clone({
          setHeaders: { Authorization: `Bearer ${tkn!}` },
          withCredentials: true
        });
        return next.handle(retry);
      })
    );
  }
}