import {Component, EventEmitter, Input, NgModule, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {Observable} from 'rxjs';
import {IMessageItem, IMessageWindowState, TButtonAction, TMessageType} from '../types';
import {buttonsCollection} from './messages.config';


@Component({
  selector: 'message-window',
  template: `
      <p-dialog [header]="_message.title" [(visible)]="display" [modal]="true" [responsive]="true"
                [style]="{width: '350px', minWidth: '200px'}" [minY]="70"
                [baseZIndex]="10000" [styleClass]="dialogClass(_message.type)" (onHide)="close('close')">
          <p>{{_message.message}}</p>
          <p-footer>
              <p-button *ngFor="let button of _message.buttons" type="button" pButton [icon]="button.icon"
                        (onClick)="close(button.action)" [label]="button.label"></p-button>
          </p-footer>
      </p-dialog>
  `,
})

export class MessageWindowComponent implements OnInit {
  display: boolean;
  _message: IMessageItem;


  @Input() message: Observable<IMessageItem>;

  @Output() state: EventEmitter<IMessageWindowState> = new EventEmitter<IMessageWindowState>();

  constructor() {
  }

  dialogClass(type: TMessageType) {
    return `message-window-${type}`;
  }

  close(action: TButtonAction) {
    this.display = false;
    this._message = this.cleanMessage();
    this.state.emit({submitted: true, action});
  }

  cleanMessage(): IMessageItem {
    return {type: 'info', title: '', message: '', buttons: [buttonsCollection.close]};
  }

  debug(...vars: any[]) {
    // console.log('[GoogleMapComponent]', ...vars);
  }

  ngOnInit() {
    this._message = this.cleanMessage();
    this.message.subscribe((message: IMessageItem) => {
      this._message = message;
      this.display = true;
    });
  }

}


@NgModule({
  imports: [CommonModule, DialogModule, ButtonModule],
  exports: [MessageWindowComponent],
  declarations: [MessageWindowComponent],
  providers: [],
})
export class MessageWindowModule {
}
