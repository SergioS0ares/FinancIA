import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RestauranteService {
  private _allCities = new BehaviorSubject<string[]>([]);
  private _allCuisines = new BehaviorSubject<string[]>([]);

  public allCities$ = this._allCities.asObservable();
  public allCuisines$ = this._allCuisines.asObservable();

  setCities(cities: string[]) {
    this._allCities.next(cities);
  }

  setCuisines(cuisines: string[]) {
    this._allCuisines.next(cuisines);
  }

  // Convenience: initial seed (optional)
  loadSeed(cities: string[], cuisines: string[]) {
    this.setCities(cities);
    this.setCuisines(cuisines);
  }
}
