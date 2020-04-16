import { EXTENSION_MESSAGES } from './config';
import { IDuckDuckGoTheme } from './colorscheme';

export interface IExtensionMessage {
  action: string;
  data?: any;
};

type MessageCallback = (message: IExtensionMessage) => void;

function sendMessage(action: string, data?: any) {
  browser.runtime.sendMessage({ action, data });
}

export function setupExtensionMessageListener(messageCallback: MessageCallback) {
  browser.runtime.onMessage.addListener(messageCallback);
}

export namespace UI {
  export function sendDebuggingOutput(message: string) {
    sendMessage(EXTENSION_MESSAGES.OUTPUT, message);
  }

  export function sendNotification(message: string) {
    sendMessage(EXTENSION_MESSAGES.NOTIFCATION, message);
  }
}

export namespace DDG {
  export function requestTheme() {
    sendMessage(EXTENSION_MESSAGES.DDG_THEME_GET);
  }

  export function setTheme(theme: IDuckDuckGoTheme) {
    sendMessage(EXTENSION_MESSAGES.DDG_THEME_ENABLED, theme);
  }

  export function resetTheme() {
    sendMessage(EXTENSION_MESSAGES.DDG_THEME_DISABLED);
  }
}
