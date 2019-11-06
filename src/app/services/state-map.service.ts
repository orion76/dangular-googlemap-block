import {ICoordinates, IFilters, IRadiusValue, ITerminalInfo} from '../components/types';
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {Inject, InjectionToken} from '@angular/core';
import {APP_CONFIG, IAppConfig} from '../app.config';
import {createFiltersConfig, isEqualCoordinates, isEqualMapState, isEqualRadius} from './utils';


export interface IStateMap {
  zoom: number;
  displayTerminalInfo: boolean;
}

export interface IStateMapService {
  readonly map: Observable<IStateMap>;
  readonly coordinates: Observable<ICoordinates>;
  readonly terminals: Observable<ISearchResult>;
  readonly radius: Observable<IRadiusValue>;
  readonly circle: Observable<ICoordinates>;

  setMap<K extends keyof IStateMap>(state: K, value: IStateMap[K]);


  setCoordinates(coordinates: ICoordinates);

  setCircle(coordinates: ICoordinates);

  setRadius(radius: IRadiusValue);

  setTerminals(result: ISearchResult);
}

export const STATE_MAP_SERVICE = new InjectionToken('STATE_MAP_SERVICE');

export interface ISearchResult {
  terminals: ITerminalInfo[];
  filters: IFilters;
}

export class StateMapService implements IStateMapService {
  private _terminalsSubject: BehaviorSubject<ISearchResult>;
  private _coordinatesSubject: BehaviorSubject<ICoordinates>;
  private _circleSubject: BehaviorSubject<ICoordinates>;
  private _radiusSubject: BehaviorSubject<IRadiusValue>;
  private _mapSubject: BehaviorSubject<IStateMap>;
  private readonly _terminals: Observable<ISearchResult>;
  private readonly _map: Observable<IStateMap>;
  private readonly _coordinates: Observable<ICoordinates>;
  private readonly _circle: Observable<ICoordinates>;
  private readonly _radius: Observable<IRadiusValue>;
  private _mapState: IStateMap;

  constructor(@Inject(APP_CONFIG) private config: IAppConfig) {
    this._terminalsSubject = new BehaviorSubject<ISearchResult>({terminals: [], filters: null});
    this._terminals = this._terminalsSubject.asObservable();


    const coordinates = createFiltersConfig('coordinates', this.config);

    this._coordinatesSubject = new BehaviorSubject<ICoordinates>(coordinates);
    this._coordinates = this._coordinatesSubject.asObservable().pipe(distinctUntilChanged(isEqualCoordinates));

    this._circleSubject = new BehaviorSubject<ICoordinates>(coordinates);
    this._circle = this._circleSubject.asObservable().pipe(distinctUntilChanged(isEqualCoordinates));

    this._radiusSubject = new BehaviorSubject<IRadiusValue>(createFiltersConfig('radius', this.config));
    this._radius = this._radiusSubject.asObservable().pipe(distinctUntilChanged(isEqualRadius));

    this._mapState = config.map;

    this._mapSubject = new BehaviorSubject<IStateMap>(this._mapState);
    this._map = this._mapSubject.asObservable().pipe(distinctUntilChanged(isEqualMapState));
  }

  get map(): Observable<IStateMap> {
    return this._map;
  }

  get coordinates(): Observable<ICoordinates> {
    return this._coordinates;
  }

  get circle(): Observable<ICoordinates> {
    return this._circle;
  }

  get radius(): Observable<IRadiusValue> {
    return this._radius;
  }

  get terminals(): Observable<ISearchResult> {
    return this._terminals;
  }

  setTerminals(result: ISearchResult) {
    this._terminalsSubject.next(result);
  }

  setCoordinates(coordinates: ICoordinates) {
    this._coordinatesSubject.next(coordinates);
  }

  setCircle(coordinates: ICoordinates) {
    this._circleSubject.next(coordinates);
  }

  setMap<K extends keyof IStateMap>(state: K, value: IStateMap[K]) {
    this._mapState[state] = value;
    this._mapSubject.next(this._mapState);
  }

  setRadius(radius: IRadiusValue) {
    this._radiusSubject.next(radius);
  }

}
