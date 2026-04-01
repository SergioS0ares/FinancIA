import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Emite quando transações devem ser recarregadas (ex.: após fechar o modal de nova transação). */
@Injectable({ providedIn: 'root' })
export class TransactionRefreshService {
  private readonly reload$ = new Subject<void>();

  /** Inscreva-se nas páginas que listam transações. */
  get onReload() {
    return this.reload$.asObservable();
  }

  requestReload(): void {
    this.reload$.next();
  }
}
