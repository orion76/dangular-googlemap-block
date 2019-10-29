import {IFilters, ITerminalInfo} from '../components/types';
import {Inject, InjectionToken} from '@angular/core';
import {APP_CONFIG, IAppConfig} from '../app.config';
import {createFiltersConfig} from './utils';


export interface ISearchHistoryService {
  add(filters: IFilters);

  get(): IFilters;
}

export const SEARCH_HISTORY_SERVICE = new InjectionToken('SEARCH_HISTORY_SERVICE');


export class SearchHistoryService implements ISearchHistoryService {

  private lastSuccessFilters: IFilters = null;

  constructor(@Inject(APP_CONFIG) private config: IAppConfig) {

  }

  add(filters: IFilters) {
    this.lastSuccessFilters = {...filters};
  }

  get(): IFilters {
    if (this.lastSuccessFilters) {
      return {...this.lastSuccessFilters};
    } else {
      const filters = {};
      Object.keys(this.config.filtersDefault).forEach((key: keyof IFilters) => {
        filters[key] = createFiltersConfig(key, this.config);
      });
      return filters;
    }
  }
}
