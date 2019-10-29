import {ICoordinates, IFilters, IRadiusValue, ITerminalFilters} from '../components/types';
import {IStateMap} from './state-map.service';
import {IAppConfig} from '../app.config';

export function createFiltersConfig<K extends keyof IFilters>(name: K, appConfig: IAppConfig): IFilters[K] {
  const {filtersDefault, filtersInit} = appConfig;
  let config = {...filtersDefault[name]};
  if (filtersInit[name]) {
    config = {...config, ...filtersInit[name]};
  }
  return config;
}

export function isEmpty(value: any) {
  return value === undefined || value === null;
}

export function isEqualTerminalFilters(a: ITerminalFilters, b: ITerminalFilters): boolean {

  if (isEmpty(a) && isEmpty(b)) {
    return true;
  }

  if (isEmpty(a) || isEmpty(b)) {
    return false;
  }

  return Object.keys(a).every((key: string) => (a[key] === b[key]))
}


export function isEqualRadius(a: IRadiusValue, b: IRadiusValue): boolean {
  if (!a && !b) {
    return true;
  }

  if (Boolean(a) !== Boolean(b)) {
    return false;
  }
  return a.value === b.value
    && a.unit === b.unit;
}

export function isEqualCoordinates(a: ICoordinates, b: ICoordinates): boolean {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}

export function isEqualMapState(a: IStateMap, b: IStateMap): boolean {
  return a.zoom === b.zoom;
}

export function numberIsEqual(a: number, b: number): boolean {
  return a === b;
}
