import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StickySearchService {
  public sticky$ = new BehaviorSubject<boolean>(false);
  public sidebarAberta$ = new BehaviorSubject<boolean>(true);

  setSticky(value: boolean) {
    this.sticky$.next(value);
  }

  setSidebarAberta(value: boolean) {
    this.sidebarAberta$.next(value);
  }
}
