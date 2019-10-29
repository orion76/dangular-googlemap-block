import {ICoordinates, IFilters, IRadiusValue, ITerminalFilters, IUserInput} from '../components/types';
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {Inject, InjectionToken} from '@angular/core';
import {APP_CONFIG, IAppConfig} from '../app.config';
import {createFiltersConfig, isEmpty, isEqualCoordinates, isEqualRadius, isEqualTerminalFilters} from './utils';
import {IStateFiltersService} from './types';


export const STATE_FILTERS_SERVICE = new InjectionToken('STATE_FILTERS_SERVICE');

export class StateFiltersService implements IStateFiltersService {
  private _lastSuccess: IFilters;
  private _userInput: IUserInput;

  private _filtersSuccessSubject: BehaviorSubject<IFilters>;
  private readonly _filtersSuccess: Observable<IFilters>;


  constructor(@Inject(APP_CONFIG) private config: IAppConfig) {

    this._lastSuccess = this.getDefaultFilters();
    this._filtersSuccessSubject = new BehaviorSubject<IFilters>(this._lastSuccess);
    this._filtersSuccess = this._filtersSuccessSubject.asObservable();

    this._userInput = {};
  }

  get onChangeCoordinates(): Observable<ICoordinates> {
    return this._filtersSuccess.pipe(
      map((filters: IFilters) => filters.coordinates),
      distinctUntilChanged(isEqualCoordinates)
    );
  }

  get onChangeRadius(): Observable<IRadiusValue> {
    return this._filtersSuccess.pipe(
      map((filters: IFilters) => filters.radius),
    );
  }

  get onChangeTerminalFilters(): Observable<ITerminalFilters> {
    return this._filtersSuccess.pipe(
      map((filters: IFilters) => filters.terminalFilters),
      filter(Boolean)
    );
  }

  getDefaultFilters(): IFilters {
    return Object.keys(this.config.filtersDefault)
      .reduce((filters: IFilters, key: keyof IFilters) => {
        filters[key] = createFiltersConfig(key, this.config);
        return filters;
      }, {});
  }

  hasInput(name: keyof IUserInput): boolean {
    return isEmpty(this._userInput[name]) === false;
  }

  getInput<K extends keyof IUserInput>(name: K): IUserInput[K] {
    return this._userInput[name];
  }

  setInput<K extends keyof IUserInput>(name: K, value: IUserInput[K]) {
    return this._userInput[name] = value;
  }

  hasFilter(name: keyof IFilters): boolean {
    return isEmpty(this._lastSuccess[name]) === false;
  }

  setFilter<K extends keyof IFilters>(name: K, value: IFilters[K]) {
    console.log('[setFilter]', name, value);
    this._lastSuccess[name] = value;
    this._filtersSuccessSubject.next(this._lastSuccess);
  }

  getFilter<K extends keyof IFilters>(name: K): IFilters[K] {
    return this._lastSuccess[name];
  }

  getFilters(): IFilters {
    return this._lastSuccess;
  }

}
