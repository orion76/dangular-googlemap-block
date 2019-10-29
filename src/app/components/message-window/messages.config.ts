import {IButton, IMessageItem, TButtonAction} from '../types';

export const buttonsCollection: Record<TButtonAction, IButton> = {
  close: {action: 'close', icon: 'pa pa-check', label: 'Close', klass: 'message-button action-close'},
  submit: {action: 'submit', icon: 'pa pa-check', label: 'Ok', klass: 'message-button action-submit'},
  back: {action: 'back', icon: 'pa pa-check', label: 'Back', klass: 'message-button action-back'},
};


export class TerminalMessages {

}
