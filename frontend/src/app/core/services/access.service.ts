import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { LoginResponse, RegisterResponse } from '../../types/login-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AcessService {
  apiUrl: string = `${environment.apiUrl}/api/auth`;

  constructor(private httpClient: HttpClient, private auth: AuthService) {}

  /**
   * POST /auth/login - Login com e-mail e senha.
   * Backend devolve access_token no JSON e grava refresh_token em cookie HTTP-Only.
   */
  postLogin(email: string, senha: string): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password: senha }, { withCredentials: true })
      .pipe(
        tap((value: any) => {
          const token = value.access_token ?? value.token;
          if (token) this.auth.setToken(token);
          this.auth.setPerfil({
            tipo: value.tipoUsuario ?? 'CLIENTE',
            nome: value.nome ?? 'Usuário',
            id: value.id ?? '',
            imagem: value.imagem ?? null,
            restauranteId: value.restauranteId
          });
        })
      );
  }

  /**
   * POST /auth/google - Login com token do Google (idToken).
   * Backend devolve access_token no JSON e refresh_token em cookie HTTP-Only.
   */
  postLoginWithGoogle(idToken: string): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>(`${this.apiUrl}/google`, { token: idToken }, { withCredentials: true })
      .pipe(
        tap((value: any) => {
          const token = value.access_token ?? value.token;
          if (token) this.auth.setToken(token);
          this.auth.setPerfil({
            tipo: value.tipoUsuario ?? 'CLIENTE',
            nome: value.nome ?? 'Usuário Google',
            id: value.id ?? '',
            imagem: value.imagem ?? null,
            restauranteId: value.restauranteId
          });
        })
      );
  }

  /**
   * POST /auth/registrar - Cadastro (backend Python: email, nome, password).
   */
  postSignup(data: { email: string; nome: string; password: string }): Observable<RegisterResponse> {
    return this.httpClient.post<RegisterResponse>(
      `${this.apiUrl}/registrar`,
      { email: data.email, nome: data.nome, password: data.password },
      { withCredentials: true }
    );
  }

  /**
   * POST /auth/refresh — O refresh_token vai no cookie HTTP-Only (withCredentials: true).
   * O backend devolve apenas { access_token, token_type }; não envia perfil.
   */
  postRefreshToken(): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(res => {
          const token = (res as any).access_token ?? (res as any).token;
          if (token) {
            this.auth.setToken(token);
          }
        })
      );
  }

  postReenviarCodigo(email: string): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/reenviar-codigo`, { email });
  }

  postEsqueciMinhaSenha(email: string): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/esqueci-senha`, { email });
  }

  postVerificarCodigo(idVerificacao: string, codigo: string, mantenhaMeConectado: boolean): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/verificar`, {
      idVerificacao,
      codigo,
      mantenhaMeConectado
    }, { withCredentials: true }).pipe(
      tap((value: any) => {
        const token = value.access_token ?? value.token;
        if (token) {
          this.auth.setToken(token);
          this.auth.setPerfil({
            tipo: value.tipoUsuario ?? 'CLIENTE',
            nome: value.nome ?? 'Usuário',
            id: value.id ?? '',
            imagem: value.imagem ?? null,
            restauranteId: value.restauranteId
          });
        }
      })
    );
  }

  postLogout(): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.auth.clearAuthData();
      })
    );
  }

  /**
   * Envia a nova senha para o backend para concluir a redefinição.
   * O token é passado na URL como path parameter.
   */
  postRedefinirSenha(token: string, novaSenha: string): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/mudar-senha/${token}`, { novaSenha }, { withCredentials: true });
  }

  /**
   * Login específico para garçons/funcionários (reservado para usos futuros).
   */
}
