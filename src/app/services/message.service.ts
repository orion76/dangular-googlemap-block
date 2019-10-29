import {Observable, Subject} from 'rxjs';
import {Inject, InjectionToken} from '@angular/core';
import {IButton, IDistanceUnit, IFilters, IMessageItem, IMessageWindowState, ITerminalInfo} from '../components/types';
import {filter} from 'rxjs/operators';
import {buttonsCollection} from '../components/message-window/messages.config';
import {APP_CONFIG, IAppConfig} from '../app.config';
import {STATE_FILTERS_SERVICE} from './state-filters.service';
import {IStateFiltersService} from './types';

export const MESSAGE_SERVICE = new InjectionToken('MESSAGE_SERVICE');

export interface IMessageService {
  readonly onMessage: Observable<IMessageItem>;
  readonly onClose: Observable<IMessageWindowState>;

  close(state: IMessageWindowState);

  showTerminalsNotFound(filters: IFilters): Observable<IMessageWindowState>;
  showTerminalsByAddressNotFound(filters: IFilters): Observable<IMessageWindowState>;
  showLocationDisabled(): Observable<IMessageWindowState>;
}

export class MessageService implements IMessageService {
  message$: Subject<IMessageItem> = new Subject<IMessageItem>();
  close$: Subject<IMessageWindowState> = new Subject<IMessageWindowState>();

  constructor(@Inject(STATE_FILTERS_SERVICE) private state: IStateFiltersService,
              @Inject(APP_CONFIG) private config: IAppConfig) {

  }

  get onMessage(): Observable<IMessageItem> {
    return this.message$.asObservable();
  }

  get onClose() {
    return this.close$.asObservable();
  }

  close(state: IMessageWindowState) {
    this.close$.next(state);
  }

  showTerminalsByAddressNotFound(filters: IFilters): Observable<IMessageWindowState> {
    const {radius, coordinates} = filters;
    const message = this.terminalsByAddressNotFound(
      coordinates.address,
      Math.round(radius.value),
      radius.label
    );
    this.message$.next(message);
    return this.close$;
  }

  showTerminalsNotFound(filters: IFilters): Observable<IMessageWindowState> {

    const {radius, coordinates} = filters;


    const message = this.terminalsNotFound(
      Math.round(radius.value),
      radius.label
    );
    this.message$.next(message);
    return this.close$;
  }

  showLocationDisabled(): Observable<IMessageWindowState> {
    const title = 'location prohibited';
    const message = `Location is prohibited by the browser’s security policy.
      To determine the location, enable the appropriate permission for this site in your browser settings.`;

    const buttons: IButton[] = [
      buttonsCollection.close
    ];

    this.message$.next({type: 'warning', title, message, buttons});
    return this.close$;
  }

  terminalsByAddressNotFound(address: string, radius: number, radiusUnit: string): IMessageItem {
    const title = 'Terminals not found';
    const message = `no terminals within ${radius} ${radiusUnit} of ${address}`;

    const buttons: IButton[] = [
      buttonsCollection.close
    ];

    return {type: 'warning', title, message, buttons};
  }

  terminalsNotFound(radius: number, radiusUnit: string): IMessageItem {
    const title = 'Terminals not found';
    const message = `no terminals within ${radius} ${radiusUnit} `;

    const buttons: IButton[] = [
      buttonsCollection.close
    ];

    return {type: 'warning', title, message, buttons};
  }

}
