import {ChangeDetectorRef, Component, Inject, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {IMessageItem, TButtonAction, TMessageType} from '../types';
import {buttonsCollection} from './messages.config';
import {IMessageService, MESSAGE_SERVICE} from '../../services/message.service';


@Component({
  selector: 'message-window',
  template: `
      <p-dialog [header]="_message.title" [(visible)]="display" [modal]="true" [responsive]="true"
                [style]="{width: '350px', minWidth: '200px'}" [minY]="70"
                [baseZIndex]="10000" [styleClass]="dialogClass(_message.type)" (onHide)="close('close')">
          <p>{{_message.message}}</p>
          <p-footer>
              <p-button *ngFor="let button of _message.buttons" type="button" [icon]="button.icon"
                        [styleClass]="button.klass"
                        (onClick)="close(button.action)" [label]="button.label"></p-button>
          </p-footer>
      </p-dialog>
  `,
})

export class MessageWindowComponent implements OnInit {
  display: boolean;
  _message: IMessageItem;


  constructor(@Inject(MESSAGE_SERVICE) private service: IMessageService, private cdr: ChangeDetectorRef) {
  }

  dialogClass(type: TMessageType) {
    return `message-window-${type}`;
  }

  close(action: TButtonAction) {
    this.display = false;
    this._message = this.cleanMessage();
    this.service.close({submitted: true, action});
  }

  cleanMessage(): IMessageItem {
    return {type: 'info', title: '', message: '', buttons: [buttonsCollection.close]};
  }

  debug(...vars: any[]) {
    // console.log('[GoogleMapComponent]', ...vars);
  }

  ngOnInit() {
    this._message = this.cleanMessage();
    this.service.onMessage.subscribe((message: IMessageItem) => {
      this._message = message;
      this.display = true;
      this.cdr.detectChanges();
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
