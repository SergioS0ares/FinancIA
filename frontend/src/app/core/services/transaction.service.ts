import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Transacao {
  id?: string;
  usuario_id?: string;
  tipo: 'receita' | 'despesa';
  categoria?: string;
  valor: number;
  descricao?: string;
  data?: string; // ISO string (vem do backend como datetime serializado)
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly apiUrl = `${environment.apiUrl}/api/transactions`;

  constructor(private http: HttpClient) {}

  listarTransacoes(): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(`${this.apiUrl}/`);
  }

  criarTransacao(transacao: Transacao): Observable<Transacao> {
    return this.http.post<Transacao>(`${this.apiUrl}/`, transacao);
  }
}

