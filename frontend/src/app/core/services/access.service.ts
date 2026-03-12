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
  apiUrl: string = `${environment.apiUrl}/auth`;

  constructor(private httpClient: HttpClient, private auth: AuthService) {}

  /**
   * POST /auth/login - Login tradicional com e-mail e senha.
   */
  postLogin(email: string, senha: string): Observable<LoginResponse> {
    // Backend Python espera "password" em vez de "senha"
    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/login`, { email, password: senha }, { withCredentials: true }).pipe(
      tap((value: any) => {
        const token = value.access_token ?? value.token;
        this.auth.setToken(token);
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
   */
  postLoginWithGoogle(idToken: string): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/google`, { token: idToken }, { withCredentials: true }).pipe(
      tap((value: any) => {
        const token = value.access_token ?? value.token;
        this.auth.setToken(token);
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
   * POST /auth/registrar - Cadastro de conta.
   */
  postSignup(data: any): Observable<RegisterResponse> {
    return this.httpClient.post<RegisterResponse>(`${this.apiUrl}/registrar`, data, { withCredentials: true });
  }

  postRefreshToken(): Observable<LoginResponse> {
    console.log('[LoginService] calling /auth/refresh');
    return this.httpClient
      .post<LoginResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(res => {
          console.log('[LoginService] refresh response received:', res);
          this.auth.setToken(res.token);
          this.auth.setPerfil({
            tipo: res.tipoUsuario,
            nome: res.nome,
            imagem: res.imagem,
            id: res.id,
            restauranteId: res.restauranteId
          });
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
      tap((value) => {
        if (value.token) {
          this.auth.setToken(value.token);
          this.auth.setPerfil({
            tipo: value.tipoUsuario,
            nome: value.nome,
            id: value.id,
            imagem: value.imagem,
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
