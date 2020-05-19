import { RESPONSE_TIMEOUT, NATIVE_MESSAGES } from '../../config/native';

import {
  IPywalColors,
  INativeAppMessage,
  INativeAppRequest,
  INativeAppMessageCallbacks
} from '../../definitions';

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
  private isConnected: boolean;
  private port: browser.runtime.Port;
  private callbacks: INativeAppMessageCallbacks;

  private versionCheckTimeout: number;
  private connectedCheckTimeout: number;

  constructor(callbacks: INativeAppMessageCallbacks) {
    this.callbacks = callbacks;
  }

  private logError(error: string) {
    this.callbacks.output(error, true);
  }

  private getData(message: INativeAppMessage) {
    if (message.hasOwnProperty('data')) {
      return message.data;
    }

    this.logError(`Recieved invalid message from native app. The 'data' field is undefined.`);
    return null;
  }

  private async onMessage(message: INativeAppMessage) {
    console.debug(message);
    switch(message.action) {
      case NATIVE_MESSAGES.VERSION:
        this.onVersionResponse(message);
        break;
      case NATIVE_MESSAGES.OUTPUT:
        const output: string = this.getData(message);
        output && this.callbacks.output(output);
        break;
      case NATIVE_MESSAGES.COLORSCHEME:
        const colorscheme: IPywalColors = this.getData(message);
        colorscheme && this.callbacks.colorscheme(colorscheme);
        break;
      case NATIVE_MESSAGES.CSS_ENABLE: /* fallthrough */
      case NATIVE_MESSAGES.CSS_DISABLE:
        this.onCssToggleResponse(message);
        break;
      case NATIVE_MESSAGES.CSS_FONT_SIZE:
        this.onCssFontSizeResponse(message);
        break;
      case NATIVE_MESSAGES.INVALID_ACTION:
        this.logError(`Native app recieved unhandled message action: ${message.action}`);
        break;
      default:
        this.logError(`Received unhandled message action: ${message.action}`);
        break;
    }
  }

  private onVersionResponse(message: INativeAppMessage) {
    const version = this.getData(message);
    if (version) {
      this.callbacks.version(version);
    } else {
      this.callbacks.updateNeeded();
    }

    clearTimeout(this.versionCheckTimeout);
  }

  private onCssToggleResponse(message: INativeAppMessage) {
    const target = this.getData(message);

    if (!target) {
      this.logError(`Custom CSS was applied successfully, but no target was specified`);
      return;
    }

    if (message.success) {
      this.callbacks.cssToggleSuccess(target);
    } else {
      const error = message['error'];
      this.callbacks.cssToggleFailed(target, error);
    }
  }

  private onCssFontSizeResponse(message: INativeAppMessage) {
    if (message.success) {
      this.callbacks.cssFontSizeSetSuccess(parseInt(message.data));
    } else {
      const error = message['error'];
      this.callbacks.cssFontSizeSetFailed(error);
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

  public connect() {
    this.port = browser.runtime.connectNative('pywalfox');
    this.isConnected = true;
    this.versionCheckTimeout = window.setTimeout(this.callbacks.updateNeeded, RESPONSE_TIMEOUT);
    this.connectedCheckTimeout = window.setTimeout(this.callbacks.connected, RESPONSE_TIMEOUT);
    this.setupListeners();
    this.requestVersion();
  }

  private sendMessage(message: INativeAppRequest) {
    this.port.postMessage(message);
  }

  public requestVersion() {
    this.sendMessage({ action: NATIVE_MESSAGES.VERSION });
  }

  public requestColorscheme() {
    this.sendMessage({ action: NATIVE_MESSAGES.COLORSCHEME });
  }

  public requestCssEnabled(target: string, enabled: boolean) {
    this.sendMessage({ action: enabled ? NATIVE_MESSAGES.CSS_ENABLE : NATIVE_MESSAGES.CSS_DISABLE, target });
  }

  public requestFontSizeSet(target: string, size: number) {
    this.sendMessage({ action: NATIVE_MESSAGES.CSS_FONT_SIZE, target, size });
  }
}
