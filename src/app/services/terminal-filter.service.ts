import {Inject, Injectable, InjectionToken} from '@angular/core';
import {
  ICoordinates,
  IDistanceUnit,
  IFilters,
  IRadiusValue,
  ITerminalFilters,
  ITerminalFilterService,
  ITerminalInfo,
  TRadiusUnits
} from '../components/types';
import {Observable, Subscription} from 'rxjs';
import {IViewUpdateService, VIEW_UPDATE_SERVICE} from './view-update.service';
import {FIT_BOUNDS_SERVICE, IFitBoundsService} from './fitbounds.service';
import {STATE_FILTERS_SERVICE} from './state-filters.service';
import {IStateMapService, STATE_MAP_SERVICE} from './state-map.service';
import {ISearchHistoryService, SEARCH_HISTORY_SERVICE} from './search-history.service';
import {ITerminalsService, TERMINALS_SERVICE} from './terminals.service';
import {APP_CONFIG, IAppConfig} from '../app.config';
import {createFiltersConfig} from './utils';
import {IStateFiltersService} from './types';
import {IMessageService, MESSAGE_SERVICE} from './message.service';

export const TERMINAL_FILTER_SERVICE = new InjectionToken('TERMINAL_FILTER_SERVICE');


@Injectable()
export class TerminalFilterService implements ITerminalFilterService {

  _filtersSubscription: Subscription;
  coordinateDecimalPlaces = 10 ** 6;
  _filters: Observable<IFilters>;

  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig,
    @Inject(VIEW_UPDATE_SERVICE) private view: IViewUpdateService,
    @Inject(FIT_BOUNDS_SERVICE) private fitBounds: IFitBoundsService,
    @Inject(STATE_FILTERS_SERVICE) private state: IStateFiltersService,
    @Inject(STATE_MAP_SERVICE) private map: IStateMapService,
    @Inject(SEARCH_HISTORY_SERVICE) private history: ISearchHistoryService,
    @Inject(TERMINALS_SERVICE) private terminals: ITerminalsService,
    @Inject(MESSAGE_SERVICE) private message: IMessageService) {

  }


  _prepareCoordinates(coordinates: ICoordinates): ICoordinates {
    const {latitude, longitude} = coordinates;

    return {

      latitude: this._prepareCoordinate(latitude),
      longitude: this._prepareCoordinate(longitude),
      address: coordinates.address
    };
  }

  _prepareCoordinate(coordinate: number) {
    return Math.round(coordinate * this.coordinateDecimalPlaces) / this.coordinateDecimalPlaces;
  }

  searchTerminalFilters(terminalFilters: ITerminalFilters) {

    const coordinates: ICoordinates = this.getCoordinates();
    const radius = this.state.getFilter('radius');
    const filters = {radius, coordinates, terminalFilters};

    this.terminals.load(filters)
      .subscribe((terminals: ITerminalInfo[]) => {
        if (terminals.length > 0) {
          this.map.setTerminals({terminals, filters});
        } else {
          const terminalFiltersOld = this.state.getFilter('terminalFilters');
          this.state.setFilter('terminalFilters', terminalFiltersOld);
          this.message.showTerminalsNotFound(filters);
        }
      });
  }

  back() {
    const filters = this.history.get();
    this.search(filters);
  }

  start() {
    const filters: IFilters = {
      radius: createFiltersConfig('radius', this.config),
      coordinates: createFiltersConfig('coordinates', this.config),
      terminalFilters: createFiltersConfig('terminalFilters', this.config)
    };

    this.search(filters);
  }

  searchAddress(coordinates: ICoordinates) {

    this.history.add(this.state.getFilters());

    const radius = createFiltersConfig('radius', this.config);
    radius.value = this.config.filtersDefault.radius.max;
    if (this.state.hasInput('radiusUnit')) {
      radius.unit = this.state.getInput('radiusUnit');
      this.addRadiusUnitLabel(radius);
    }

    const terminalFilters = this.state.getFilter('terminalFilters');

    const filters = {radius, coordinates, terminalFilters};
    console.log('[search address]', filters);
    this.terminals.load(filters)
      .subscribe((terminals: ITerminalInfo[]) => {
        if (terminals.length > 0) {
          this.state.setFilter('radius', radius);
          this.state.setFilter('coordinates', coordinates);

          this.map.setTerminals({terminals, filters});
          this.map.setRadius(radius);
          this.map.setCoordinates(coordinates);
          this.map.setCircle(coordinates);
        } else {
          this.message.showTerminalsByAddressNotFound(filters);
        }
      });
  }


  searchCoordinates(coordinates: ICoordinates) {
    coordinates.source = 'mouse';
    if (!this.state.hasFilter('radius')) {
      return;
    }
    this.history.add(this.state.getFilters());
    const radius = this.state.getFilter('radius');
    const terminalFilters = this.state.getFilter('terminalFilters');

    const filters = {radius, coordinates, terminalFilters};
    console.log('[search coordinates]', filters);
    this.terminals.load(filters)
      .subscribe((terminals: ITerminalInfo[]) => {
        if (terminals.length > 0) {

          this.state.setFilter('coordinates', coordinates);

          this.map.setCircle(coordinates);
          this.map.setTerminals({terminals, filters});
        } else {
          this.message.showTerminalsNotFound(filters);
        }
      });
  }

  searchRadius(radius: IRadiusValue) {

    this.history.add(this.state.getFilters());

    const terminalFilters = this.state.getFilter('terminalFilters');
    const coordinates = this.state.getFilter('coordinates');
    coordinates.source = 'radius';
    const filters = {radius, coordinates, terminalFilters};
    console.log('[search radius]', filters);
    this.terminals.load(filters)
      .subscribe((terminals: ITerminalInfo[]) => {
        if (terminals.length > 0) {
          this.state.setFilter('radius', radius);
          this.map.setTerminals({terminals, filters});
          this.map.setRadius(radius);
        } else {
          const filtersOld = this.history.get();
          this.map.setRadius(filtersOld.radius);
          this.state.setFilter('radius', filtersOld.radius);
          this.message.showTerminalsNotFound(filters);
        }
      });
  }

  searchRadiusUnit(unit: TRadiusUnits) {

    this.history.add(this.state.getFilters());

    this.state.setInput('radiusUnit', unit);

    const radius = this.createRadius({...this.state.getFilter('radius'), unit});
    const terminalFilters = this.state.getFilter('terminalFilters');
    const coordinates = this.state.getFilter('coordinates');

    const filters = {radius, coordinates, terminalFilters};
    console.log('[search radius unit]', filters);
    this.terminals.load(filters)
      .subscribe((terminals: ITerminalInfo[]) => {
        if (terminals.length > 0) {
          this.state.setFilter('radius', radius);
          this.map.setTerminals({terminals, filters});
          this.map.setRadius(radius);
        } else {
          this.message.showTerminalsNotFound(filters);
        }
      });
  }


  createRadius(radius: IRadiusValue): IRadiusValue {
    const config: IDistanceUnit = this.config.distanceUnits[radius.unit];
    return {
      label: config.name,
      unit: radius.unit,
      value: Math.round(radius.value * config.dim),
    };
  }


  search(filters: IFilters) {

    this.history.add(this.state.getFilters());

    if (filters.radius.value === 0) {
      delete (filters.radius);
      delete (filters.coordinates);
    }
    console.log('[search]', filters);
    this.terminals.load(filters)
      .subscribe((terminals: ITerminalInfo[]) => {
        if (terminals.length > 0) {
          this.map.setTerminals({terminals, filters});

          if (!filters.radius) {
            this.map.setRadius({value: 0});
            let unit = this.state.getInput('radiusUnit');
            if (!unit) {
              const defFilters = createFiltersConfig('radius', this.config);
              unit = defFilters.unit;
            }
            this.state.setFilter('radius', {value: 0, unit});
          }
        } else {
          debugger;
        }
      });
  }

  getRadius(): IRadiusValue {

    let radius: IRadiusValue = null;
    if (this.state.hasFilter('radius')) {
      const radius = this.state.getFilter('radius');
      this.addRadiusUnitLabel(radius);
    }

    // if (this.state.hasInput('radius')) {
    //   return this.state.getInput('radius');
    // }
    if (!radius) {
      radius = this.config.filtersDefault.radius;
    }
    this.addRadiusUnitLabel(radius);
    return radius;
  }

  ___getRadius() {
    return {
      // unit: this.getRadiusUnit(),
      // value: this.getRadiusValue()
    };
  }

  getTerminalFilters(): ITerminalFilters {

    // if (this.state.hasInput('terminalFilters')) {
    //   filters = this.state.getInput('terminalFilters');
    // }

    if (this.state.hasFilter('terminalFilters')) {
      return this.state.getFilter('terminalFilters');
    }

    return createFiltersConfig('terminalFilters', this.config);
  }

  getCoordinates(): ICoordinates {
    if (this.state.hasFilter('coordinates')) {
      return this.state.getFilter('coordinates');
    }

    // if (this.state.hasInput('coordinates')) {
    //   return this.state.getInput('coordinates');
    // }


    return this.config.filtersDefault.coordinates;
  }


  addRadiusUnitLabel(radius: IRadiusValue) {
    radius.label = this.config.distanceUnits[radius.unit].name;
  }

}
