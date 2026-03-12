// auth.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Perfil {
  tipo: 'CLIENTE' | 'RESTAURANTE' | 'FUNCIONARIO';
  nome: string;
  id?: string;
  imagem?: string | null;
  restauranteId?: string; // ID do restaurante (usado quando tipo é FUNCIONARIO)
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_NAME_KEY = 'nome';
  private readonly USER_TYPE_KEY = 'tipoUsuario';
  private readonly RESTAURANTE_ID_KEY = 'idRestaurante';
  private readonly RESTAURANTE_ID_FUNCIONARIO_KEY = 'restauranteIdFuncionario';
  private readonly USER_IMAGE_KEY = 'imagemUsuario';

  private _token: string | null = null;
  private _perfil: Perfil | null = null;
  private readonly BASE_IMAGE_URL = `${environment.apiUrl}`

  constructor() {
    this._token = localStorage.getItem(this.TOKEN_KEY);
    const nome = localStorage.getItem(this.USER_NAME_KEY);
    const tipo = localStorage.getItem(this.USER_TYPE_KEY) as 'CLIENTE' | 'RESTAURANTE' | 'FUNCIONARIO' | null;
    const id = localStorage.getItem(this.RESTAURANTE_ID_KEY) || undefined;
    const imagem = localStorage.getItem(this.USER_IMAGE_KEY) || undefined;
    const restauranteId = localStorage.getItem(this.RESTAURANTE_ID_FUNCIONARIO_KEY) || undefined;
  
    if (nome && tipo) {
      this._perfil = { nome, tipo, id, imagem, restauranteId };
    }
    console.log('[AuthService] Constructor - perfil inicial:', this._perfil);
  }

  setAuthData(token: string, nome: string, tipoUsuario: 'CLIENTE' | 'RESTAURANTE' | 'FUNCIONARIO', id?: string, imagem?: string | null, restauranteId?: string) {
    this.setToken(token);
    this.setPerfil({ nome, tipo: tipoUsuario, id, imagem, restauranteId });
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_NAME_KEY, nome);
    localStorage.setItem(this.USER_TYPE_KEY, tipoUsuario);
    if (id) {
       localStorage.setItem(this.RESTAURANTE_ID_KEY, id);
    }
    if (restauranteId) {
      localStorage.setItem(this.RESTAURANTE_ID_FUNCIONARIO_KEY, restauranteId);
    } else {
      localStorage.removeItem(this.RESTAURANTE_ID_FUNCIONARIO_KEY);
    }
    if (imagem) {
        localStorage.setItem(this.USER_IMAGE_KEY, imagem);
    } else {
        localStorage.removeItem(this.USER_IMAGE_KEY);
    }
  }

  setToken(token: string) {
    this._token = token;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setPerfil(perfil: Perfil) {
    this._perfil = perfil;
    localStorage.setItem(this.USER_NAME_KEY, perfil.nome);
    localStorage.setItem(this.USER_TYPE_KEY, perfil.tipo);
    if (perfil.id) {
        localStorage.setItem(this.RESTAURANTE_ID_KEY, perfil.id);
    }
    if (perfil.restauranteId) {
      localStorage.setItem(this.RESTAURANTE_ID_FUNCIONARIO_KEY, perfil.restauranteId);
    } else {
      localStorage.removeItem(this.RESTAURANTE_ID_FUNCIONARIO_KEY);
    }
    if (perfil.imagem) {
        localStorage.setItem(this.USER_IMAGE_KEY, perfil.imagem);
    } else {
        localStorage.removeItem(this.USER_IMAGE_KEY);
    }
  }

  get perfil(): Perfil | null {
    if (this._perfil) {
      return this._perfil;
    }
    
    const nome = localStorage.getItem(this.USER_NAME_KEY);
    const tipo = localStorage.getItem(this.USER_TYPE_KEY) as 'CLIENTE' | 'RESTAURANTE' | 'FUNCIONARIO' | null;
    const id = localStorage.getItem(this.RESTAURANTE_ID_KEY) || undefined;
    const imagem = localStorage.getItem(this.USER_IMAGE_KEY) || undefined;
    const restauranteId = localStorage.getItem(this.RESTAURANTE_ID_FUNCIONARIO_KEY) || undefined;
    
    if (nome && tipo && this.getToken()) {
      this._perfil = { nome, tipo, id, imagem, restauranteId };
  
      return this._perfil;
    }
   
    return null;
  }

  clearAuthData() {
    this._token = null;
    this._perfil = null;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_NAME_KEY);
    localStorage.removeItem(this.USER_TYPE_KEY);
    localStorage.removeItem(this.RESTAURANTE_ID_KEY);
    localStorage.removeItem(this.RESTAURANTE_ID_FUNCIONARIO_KEY);
    localStorage.removeItem(this.USER_IMAGE_KEY);
  }

  hasRole(role: 'CLIENTE' | 'RESTAURANTE' | 'FUNCIONARIO'): boolean {
    return this.perfil?.tipo === role;
  }

  getAbsoluteImageUrl(relativePath: string | null | undefined): string {
    if (relativePath) {
      return `${this.BASE_IMAGE_URL}${relativePath}`;
    }
    return '';
  }
}