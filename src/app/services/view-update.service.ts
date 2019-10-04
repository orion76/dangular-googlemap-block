import {Observable, Subject, Subscription} from 'rxjs';
import {delay} from 'rxjs/operators';
import {InjectionToken} from '@angular/core';

export const VIEW_UPDATE_SERVICE = new InjectionToken('VIEW_UPDATE_SERVICE');

export interface IViewUpdateService {
  onUpdate(): Observable<boolean>;

  addObservable(item: Observable<any>, name: string);

  destroy();
}

export class ViewUpdateService implements IViewUpdateService {
  _subject: Subject<boolean>;
  _observable: Observable<boolean>;
  _subscriptions: Subscription[] = [];

  constructor() {
    this._subject = new Subject<boolean>();
    this._observable = this._subject.asObservable();
  }

  onUpdate() {
    return this._observable;
  }

  addObservable(item: Observable<any>, name: string) {
    const _name = name;
    this._subscriptions.push(item.pipe(delay(1)).subscribe((data: any) => {
      this._subject.next(true);
    }));
  }

  destroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
