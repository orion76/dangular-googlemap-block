import {IButton, IMessageItem, TButtonAction} from '../types';

export const buttonsCollection: Record<TButtonAction, IButton> = {
  close: {action: 'close', icon: 'pa pa-check', label: 'Close'},
  submit: {action: 'submit', icon: 'pa pa-check', label: 'Ok'},
  back: {action: 'back', icon: 'pa pa-check', label: 'Back'},
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
