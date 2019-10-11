import {IButton, IMessageItem, TButtonAction} from '../types';

export const buttonsCollection: Record<TButtonAction, IButton> = {
  close: {action: 'close', icon: 'pa pa-check', label: 'Close', klass: 'message-button action-close'},
  submit: {action: 'submit', icon: 'pa pa-check', label: 'Ok', klass: 'message-button action-submit'},
  back: {action: 'back', icon: 'pa pa-check', label: 'Back', klass: 'message-button action-back'},
};


export class TerminalMessages {
  static terminalsByAddressNotFound(address: string, radius: number, radiusUnit: string): IMessageItem {
    const title = 'Terminals not found';
    const message = `no terminals within ${radius} ${radiusUnit} of ${address}`;

    const buttons: IButton[] = [
      buttonsCollection.back,
      buttonsCollection.close
    ];

    return {type: 'warning', title, message, buttons};
  }

  static terminalsNotFound(radius: number, radiusUnit: string): IMessageItem {
    const title = 'Terminals not found';
    const message = `no terminals within ${radius} ${radiusUnit} `;

    const buttons: IButton[] = [
      buttonsCollection.back,
      buttonsCollection.close
    ];

    return {type: 'warning', title, message, buttons};
  }
}
