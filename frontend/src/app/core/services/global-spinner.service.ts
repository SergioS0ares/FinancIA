import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalSpinnerService {
  public visibilidade$ = new BehaviorSubject<boolean>(false);

  show() {
    this.visibilidade$.next(true);
  }

  hide() {
    this.visibilidade$.next(false);
  }

  toggle() {
    this.visibilidade$.next(!this.visibilidade$.value);
  }

  // Compatibilidade: aliases em português usados pelo código existente
  public mostrar(): void {
    this.show();
  }

  public ocultar(): void {
    this.hide();
  }
}
