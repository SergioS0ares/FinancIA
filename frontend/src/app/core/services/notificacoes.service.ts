import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Notificacao {
  id: string;
  restauranteId: string;
  nomeRestaurante: string;
  dataReserva: string;
  // adicione outros campos conforme necessário
}

@Injectable({ providedIn: 'root' })
export class NotificacoesService {
  constructor() {}

  getNotificacoes(): Observable<Notificacao[]> {
    // Implementação mínima: retornar lista vazia (o backend deve fornecer dados reais)
    return of([] as Notificacao[]);
  }
}
