import {Observable} from 'rxjs';
import {ICoordinates, IFilters, IRadiusValue, ITerminalFilters, IUserInput} from '../components/types';

export interface IEntity {
  id: string;
  source: string;
  title?: string;
  is_new?: boolean;

  drupal_internal__id?: string;
}

export interface iJSONAPI_Response_Relationship {
  data: IJSONAPIEntity | IJSONAPIEntity[];
}

export interface IJSONAPIEntity {
  id: string;
  type: string;
  attributes?: Record<string, string>;
  relationships?: Record<string, iJSONAPI_Response_Relationship>;
}


export interface IStateFiltersService {

  readonly onChangeRadius: Observable<IRadiusValue>;
  readonly onChangeCoordinates: Observable<ICoordinates>;
  readonly onChangeTerminalFilters: Observable<ITerminalFilters>;

  hasInput(name: keyof IUserInput): boolean;

  hasFilter(name: keyof IFilters): boolean;
  setFilter<K extends keyof IFilters>(name: K, value: IFilters[K]);
  getInput<K extends keyof IUserInput>(name: K): IUserInput[K];

  setInput<K extends keyof IUserInput>(name: K, value: IUserInput[K]);
  getFilters(): IFilters;
  getFilter<K extends keyof IFilters>(name: K): IFilters[K];
}

