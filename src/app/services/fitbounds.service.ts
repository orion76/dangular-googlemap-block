import {BehaviorSubject, Observable} from 'rxjs';
import {InjectionToken} from '@angular/core';
import {TCoordinatesSource} from '../components/types';
import {filter, map, withLatestFrom} from 'rxjs/operators';

export const FIT_BOUNDS_SERVICE = new InjectionToken('FIT_BOUNDS_SERVICE');

export interface IFitBoundsService {
  readonly value$: Observable<boolean>;

  source(source: TCoordinatesSource);

  set(value: boolean);


}

export class FitBoundsService implements IFitBoundsService {
  _value: BehaviorSubject<boolean>;
  _source: BehaviorSubject<TCoordinatesSource>;
  _source$: Observable<TCoordinatesSource>;

  constructor() {
    this._value = new BehaviorSubject<boolean>(true);
    this._source = new BehaviorSubject<TCoordinatesSource>('init');
    this._value$ = this._value.asObservable();
    this._source$ = this._source.asObservable();
  }

  _value$: Observable<boolean>;

  get value$() {
    return this._value$.pipe(
      withLatestFrom(this._source$),
      map(([value, source]) => {
        switch (source) {
          case 'mouse':
            value = false;
            break;
        }

        return value;
      })
    );
  }

  set(value: boolean) {
    this._value.next(value);
  }

  source(source: TCoordinatesSource) {
    this._source.next(source);
  }

}
