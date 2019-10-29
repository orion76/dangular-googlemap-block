import {Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {IFilters} from '../components/types';
import {extractRelationships, itemToArray, normalizeReference} from './converter';
import {map, switchMap} from 'rxjs/operators';
import {IEntity, IJSONAPIEntity} from './types';


export interface ISource {
  entrypoint: string;
}


export interface IBackendConfig {
  url: string;
}

export const backendConfig: IBackendConfig = {
  url: 'crypto-dev1.ti-work.site'
};

export interface ISources {
  [key: string]: ISource;
}

export const sourcesConfig: ISources = {
  terminal: {
    entrypoint: '/coin-api/terminal/list'
  },
  terminal_prices: {
    entrypoint: '/coin-api/terminal/{id}/prices'
  },
};

export const DATA_SERVICE = new InjectionToken('DATA_SERVICE');

export interface IDataService {
  loadItems(source: string, filters?: IFilters): Observable<any>;

  loadTerminalPrices(source: string, terminalId: string): Observable<any>;
}

export interface IParams {
  [param: string]: string | string[];
}

@Injectable()
export class DataService implements IDataService {

  constructor(private http: HttpClient) {
  }

  convert(response: any): Observable<any> {
    debugger;
    const entities = itemToArray(response.data);
    const includes = response.included ? response.included : [];
    const entitiesMap = normalizeReference(entities.concat(includes));
    entitiesMap.forEach((entity: IJSONAPIEntity) => extractRelationships(entitiesMap, entity));
    return of(entities);
  }

  loadItems(source: string, filters?: IFilters): Observable<any> {

    const config: ISource = sourcesConfig[source];
    const params: IParams = {_format: 'json'};

    this.addCoordinateParams(params, filters);
    this.addActionParams(params, filters);

    return this.http.get(this.createUrl(config.entrypoint), {params});
  }


  loadTerminalPrices(source: string, terminalId: string): Observable<any> {
    const config: ISource = sourcesConfig[source];

    return this.http.get(this.createUrl(config.entrypoint, terminalId), {});
  }

  createUrl(entrypoint: string, id?: string) {
    // return `${backendConfig.url}/${entrypoint}`;
    let url = entrypoint;
    if (id) {
      url = url.replace('\{id\}', id);
    }
    return url;
  }

  _isNotEmpty(val: any) {
    return val !== null && val !== undefined;
  }

  addActionParams(params: IParams, filters: IFilters): void {

    if (!filters.terminalFilters) {
      return;
    }

    const {buy, sell, open} = filters.terminalFilters;

    if (buy !== sell) {
      if (buy) {
        params.buy = String(buy);
      }
      if (sell) {
        params.sell = String(sell);
      }
    }


    if (this._isNotEmpty(open)) {
      params.open = String(open);
    }
  }

  addCoordinateParams(params: IParams, filters: IFilters): void {

    if (filters.coordinates) {
      params['current[lat]'] = String(filters.coordinates.latitude);
      params['current[lon]'] = String(filters.coordinates.longitude);
    }
    if (filters.radius) {
      params.radius = String(filters.radius.value);
    }

  }
}
