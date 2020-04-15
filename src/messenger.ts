import { EXTENSION_MESSAGES } from './config';

export interface IExtensionMessage {
  action: string;
  data?: any;
};

/* Implements the communcation between the background- and content scripts. */
export class Messenger {
  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    browser.runtime.onMessage.addListener((message: IExtensionMessage) => {

    });
  }

  public printDebuggingOutput(message: string) {
    browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.OUTPUT, data: message });
  }

  public displayNotification(message: string) {
    browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.NOTIFCATION, data: message });
  }
}
