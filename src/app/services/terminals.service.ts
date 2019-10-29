import {Inject, Injectable, InjectionToken} from '@angular/core';
import {IFilters, ITerminalInfo} from '../components/types';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';
import {DATA_SERVICE, IDataService} from './data.service';

export const TERMINALS_SERVICE = new InjectionToken('TERMINALS_SERVICE');

export interface ITerminalsService {
  readonly found: Observable<number>;
  readonly terminals: Observable<ITerminalInfo[]>;

  load(filters: IFilters);
}

@Injectable()
export class TerminalsService implements ITerminalsService {

  private _terminalsSubject: BehaviorSubject<ITerminalInfo[]>;

  constructor(
    @Inject(DATA_SERVICE) private data: IDataService) {
    this.init();
  }

  private _terminals: Observable<ITerminalInfo[]>;

  get terminals() {
    return this._terminals;
  }

  private _found: Observable<number>;

  get found() {
    return this._found;
  }

  init() {
    this._terminalsSubject = new BehaviorSubject<ITerminalInfo[]>([]);
    this._terminals = this._terminalsSubject.asObservable();
    this._found = this._terminals.pipe(
      map((terminals: ITerminalInfo[]) => terminals.length),
      filter(Boolean)
    );
  }

  load(filters: IFilters): Observable<ITerminalInfo[]> {
    const source = 'terminal';
    return this.data.loadItems(source, filters)
      .pipe(
        map((data: any[]) => {
          return data.map((terminal: any) => {
            terminal.latitude = terminal.geodata.lat;
            terminal.longitude = terminal.geodata.lon;
            delete terminal.geodata;
            return terminal;
          });
        }),
        tap((terminals: ITerminalInfo[]) => this._terminalsSubject.next(terminals))
      );
  }
}
