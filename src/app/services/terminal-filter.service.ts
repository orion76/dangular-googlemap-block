import {Inject, Injectable, InjectionToken} from '@angular/core';
import {
  ICoordinates,
  IFilters,
  IRadiusValue,
  ITerminalFilters,
  ITerminalFilterService,
  ITerminalInfo
} from '../components/types';
import {APP_CONFIG, IAppConfig} from '../app.config';
import {BehaviorSubject, combineLatest, Observable, Subject, Subscription} from 'rxjs';
import {delay, distinctUntilChanged, map, take, tap, withLatestFrom} from 'rxjs/operators';
import {DATA_SERVICE, IDataService, IParams} from './data.service';
import {LatLngBoundsLiteral} from '@agm/core';
import {IViewUpdateService, VIEW_UPDATE_SERVICE} from './view-update.service';
import {FIT_BOUNDS_SERVICE, IFitBoundsService} from './fitbounds.service';

export const TERMINAL_FILTER_SERVICE = new InjectionToken('TERMINAL_FILTER_SERVICE');

function isCoordinatesEqual(c1: ICoordinates, c2: ICoordinates): boolean {
  return c1.latitude === c2.latitude && c1.longitude === c2.longitude;
}

@Injectable()
export class TerminalFilterService implements ITerminalFilterService {

  zoom: BehaviorSubject<number>;
  radius: BehaviorSubject<IRadiusValue>;
  filterTerminal: BehaviorSubject<ITerminalFilters>;
  // fitBounds: BehaviorSubject<LatLngBoundsLiteral | boolean>;
  terminals$: BehaviorSubject<ITerminalInfo[]>;
  coordinatesPrev: ICoordinates;
  filters$: Observable<IFilters>;
  _searchParametersSubscription: Subscription;
  _coordinatesSubscription: Subscription;
  _radiusSubscription: Subscription;
  found: BehaviorSubject<number>;

  coordinateDecimalPlaces = 10 ** 6;

  constructor(
    @Inject(VIEW_UPDATE_SERVICE) private view: IViewUpdateService,
    @Inject(FIT_BOUNDS_SERVICE) private fitBounds: IFitBoundsService,
    @Inject(APP_CONFIG) private config: IAppConfig,
    @Inject(DATA_SERVICE) private data: IDataService) {
  }

  private _coordinates: BehaviorSubject<ICoordinates>;

  get coordinates(): Observable<ICoordinates> {
    return this._coordinates.pipe(
      // distinctUntilChanged(isCoordinatesEqual)
    );
  }

  backCoordinates() {
    if (this.coordinatesPrev) {
      this.changeCoordinates(this.coordinatesPrev);
    }
  }

  _prepareCoordinates(coordinates: ICoordinates): ICoordinates {
    const {source, latitude, longitude} = coordinates;

    return {
      source,
      latitude: this._prepareCoordinate(latitude),
      longitude: this._prepareCoordinate(longitude),
    };
  }

  _prepareCoordinate(coordinate: number) {
    return Math.round(coordinate * this.coordinateDecimalPlaces) / this.coordinateDecimalPlaces;
  }

  changeCoordinates(coordinates: ICoordinates) {
    if (coordinates) {
      this._coordinates
        .pipe(withLatestFrom(this.found, (prev: ICoordinates, found: number) => ({prev, found})), take(1))
        .subscribe((data: { prev: ICoordinates, found: number }) => {

          if (data.found > 0) {
            this.coordinatesPrev = data.prev;
          }


          this.fitBounds.source(coordinates.source);
          coordinates = this._prepareCoordinates(coordinates);
          this._coordinates.next(coordinates);
        });
    }
  }


  subscribeSearchParametersChange(searchParameters) {
    return searchParameters.subscribe((filters: IFilters) => {
      const source = 'terminal';

      this.data.loadItems(source, filters)
        .pipe(
          map((data: any[]) => {
            return data.map((terminal: any) => {
              terminal.latitude = terminal.geodata.lat;
              terminal.longitude = terminal.geodata.lon;
              delete terminal.geodata;
              return terminal;
            });
          })
        )
        .subscribe((data: any[]) => {
          this.terminals$.next(data);
          this.found.next(data.length);
        });
    });
  }

  onSearchParametersChange(): Observable<IFilters> {
    return combineLatest(this.coordinates, this.radius, this.filterTerminal).pipe(
      map(([coordinates, radius, terminalFilters]) => ({coordinates, radius, terminalFilters}))
    );
  }

  init() {

    this._initSubjects();
    this.filters$ = this.onSearchParametersChange();
    this._searchParametersSubscription = this.subscribeSearchParametersChange(this.filters$);
  }

  destroy() {
    if (this._coordinatesSubscription) {
      this._coordinatesSubscription.unsubscribe();
    }

    if (this._searchParametersSubscription) {
      this._searchParametersSubscription.unsubscribe();
    }

    if (this._radiusSubscription) {
      this._radiusSubscription.unsubscribe();
    }
  }

  private _initSubjects() {
    this.terminals$ = new BehaviorSubject<ITerminalInfo[]>([]);

    const {coordinates, terminalFilters, radius} = this.config.filters;
    // this.fitBounds = new BehaviorSubject<boolean>(false);
    this.zoom = new BehaviorSubject<number>(this.config.zoom);
    this.radius = new BehaviorSubject<IRadiusValue>(radius);
    this.found = new BehaviorSubject<number>(0);
    this._coordinates = new BehaviorSubject<ICoordinates>(coordinates);
    this.filterTerminal = new BehaviorSubject<ITerminalFilters>(terminalFilters);

    this.view.addObservable(this.terminals$, 'terminals');
    this.view.addObservable(this.found, 'found');
  }
}
