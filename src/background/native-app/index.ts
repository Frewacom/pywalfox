import { MESSAGES } from '../../config';
import { IPywalColors } from '../../colorscheme';

/* Interface for the messages sent to the native messaging host. */
interface INativeAppRequest {
  action: string;
  target?: string;
}

/* Interface for the messages received from the native messaging host. */
export interface INativeAppMessage {
  action: string;
  success: boolean;
  error?: string;
  data?: string;
  [key: string]: any;
}

export interface INativeAppMessageCallbacks {
  connected: () => void,
  updateNeeded: () => void,
  disconnected: () => void,
  version: (version: string) => void,
  output: (message: string) => void,
  colorscheme: (colorscheme: IPywalColors) => void,
  toggleCss: (target: string, enabled: boolean) => void,
}

/**
 * Implements the communcation with the native messaging host.
 *
 * @remarks
 * Based on the native messaging protocol, allowing extensions to communicate with
 * user's computer and share resources that are otherwise inaccessible by the browser.
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
 *
 * @param callbacks - the callbacks to be used when a message is received
 */
export class NativeApp {
  private port: browser.runtime.Port;
  private isConnected: boolean;
  private callbacks: INativeAppMessageCallbacks;

  private versionCheckTimeout: number;
  private connectedCheckTimeout: number;

  constructor(callbacks: INativeAppMessageCallbacks) {
    this.callbacks = callbacks;
  }

  private logError(error: string) {
    this.callbacks.output(error);
    console.error(error);
  }

  private getData(message: INativeAppMessage) {
    if (message.hasOwnProperty('data')) {
      return message.data;
    }

    this.logError(`Recieved invalid message from native app. The 'data' field is undefined.`);
    return false;
  }

  private async onMessage(message: INativeAppMessage) {
    console.debug(message);
    if (message.success === true) {
      switch(message.action) {
        case MESSAGES.VERSION:
          const version = this.getData(message);
          if (version) {
            this.callbacks.version(version);
          } else {
            this.callbacks.updateNeeded();
          }
          clearTimeout(this.versionCheckTimeout);
          break;
        case MESSAGES.OUTPUT:
          const output = this.getData(message);
          if (output) {
            this.callbacks.output(output);
          }
          break;
        case MESSAGES.COLORSCHEME:
          const colorscheme = this.getData(message);
          if (colorscheme) {
            this.callbacks.colorscheme(colorscheme);
          }
          break;
        case MESSAGES.CSS_ENABLE:
          const enableTarget = this.getData(message);
          if (enableTarget) {
            this.callbacks.toggleCss(enableTarget, true);
          }
          break;
        case MESSAGES.CSS_DISABLE:
          const disableTarget = this.getData(message);
          if (disableTarget) {
            this.callbacks.toggleCss(disableTarget, false);
          }
          break;
        case MESSAGES.INVALID_ACTION:
          this.logError(`Native app recieved unhandled message action: ${message.action}`);
          break;
        default:
          this.logError(`Received unhandled message action: ${message.action}`);
          break;
      }
    } else {
      this.logError(`Native app returned an error on action ${message.action}:\n${message.error}`);
    }
  }

  private async onDisconnect(port: browser.runtime.Port) {
    if (port.error) {
      clearTimeout(this.versionCheckTimeout);
      clearTimeout(this.connectedCheckTimeout);
      this.callbacks.disconnected();
      console.log('Disconnected from native messaging host');
    }
  }

  private setupListeners() {
    this.port.onMessage.addListener(this.onMessage.bind(this));
    this.port.onDisconnect.addListener(this.onDisconnect.bind(this));
  }

  public async connect() {
    this.port = await browser.runtime.connectNative('pywalfox');
    this.isConnected = true;
    this.versionCheckTimeout = window.setTimeout(this.callbacks.updateNeeded, 1000);
    this.connectedCheckTimeout = window.setTimeout(this.callbacks.connected, 1000);
    this.setupListeners();
    this.requestVersion();
  }

  private sendMessage(message: INativeAppRequest) {
    this.port.postMessage(message);
  }

  public requestVersion() {
    this.sendMessage({ action: MESSAGES.VERSION });
  }

  public requestColorscheme() {
    this.sendMessage({ action: MESSAGES.COLORSCHEME });
  }

  public requestCssEnabled(target: string, enabled: boolean) {
    this.sendMessage({ action: enabled ? MESSAGES.CSS_ENABLE : MESSAGES.CSS_DISABLE, target });
  }
}
