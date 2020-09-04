import {
  IPywalData,
  INativeAppMessage,
  INativeAppRequest,
  INativeAppMessageCallbacks,
} from '@definitions';

import { RESPONSE_TIMEOUT_MS, NATIVE_MESSAGES } from '@config/general';

/**
 * Implements the communcation with the native messaging host.
 *
 * @remarks
 * Based on the native messaging protocol, allowing extensions to communicate with
 * user's computer and share resources that are otherwise inaccessible by the browser.
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
 */
export default class NativeApp {
  public isConnected: boolean;

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

    this.logError('Recieved invalid message from native app. The \'data\' field is undefined.');
    return null;
  }

  private async onMessage(message: INativeAppMessage) {
    console.debug(message);
    switch (message.action) {
      case NATIVE_MESSAGES.VERSION:
        this.onVersionResponse(message);
        break;
      case NATIVE_MESSAGES.OUTPUT:
        this.onDebuggingOutput(message);
        break;
      case NATIVE_MESSAGES.PYWAL_COLORS:
        this.onPywalColorsResponse(message);
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

  private onPywalColorsResponse(message: INativeAppMessage) {
    if (message.success) {
      const pywalData: IPywalData = this.getData(message);

      if (!pywalData) {
        this.logError('Pywal data was read successfully but contained null');
        return;
      }

      this.callbacks.pywalColorsFetchSuccess(pywalData);
    } else {
      this.callbacks.pywalColorsFetchFailed(message.error);
    }
  }

  private onCssToggleResponse(message: INativeAppMessage) {
    const target = this.getData(message);

    if (message.success) {
      if (!target) {
        this.logError('Custom CSS was applied successfully, but the target was not specified');
        return;
      }

      this.callbacks.cssToggleSuccess(target);
    } else {
      this.callbacks.cssToggleFailed(target, message.error);
    }
  }

  private onCssFontSizeResponse(message: INativeAppMessage) {
    if (message.success) {
      const updatedFontSize = this.getData(message);

      if (!updatedFontSize) {
        this.logError('Font size was updated successfully, but the updated font size was not specified');
        return;
      }

      this.callbacks.cssFontSizeSetSuccess(parseInt(updatedFontSize, 10));
    } else {
      this.callbacks.cssFontSizeSetFailed(message.error);
    }
  }

  private onDebuggingOutput(message: INativeAppMessage) {
    const output: string = this.getData(message);
    output && this.callbacks.output(output);
  }

  private async onDisconnect({ error }: browser.runtime.Port) {
    if (error) {
      clearTimeout(this.versionCheckTimeout);
      clearTimeout(this.connectedCheckTimeout);
      this.callbacks.disconnected();
      console.log(`Disconnected from native messaging host: ${error}`);
    }
  }

  private setupListeners() {
    this.port.onMessage.addListener(this.onMessage.bind(this));
    this.port.onDisconnect.addListener(this.onDisconnect.bind(this));
  }

  private sendMessage(message: INativeAppRequest) {
    if (!this.isConnected) {
      // If we are not connected, it means that an error occured. No point to try and reconnect
      console.error('Failed to send data to native app. You are not connected');
      return;
    }

    this.port.postMessage(message);
  }

  public connect() {
    this.port = browser.runtime.connectNative('pywalfox');
    this.isConnected = true;

    this.versionCheckTimeout = window.setTimeout(this.callbacks.updateNeeded, RESPONSE_TIMEOUT_MS);
    this.connectedCheckTimeout = window.setTimeout(this.callbacks.connected, RESPONSE_TIMEOUT_MS);

    this.setupListeners();
    this.requestVersion();
  }

  public requestVersion() {
    this.sendMessage({ action: NATIVE_MESSAGES.VERSION });
  }

  public requestPywalColors() {
    this.sendMessage({ action: NATIVE_MESSAGES.PYWAL_COLORS });
  }

  public requestCssEnabled(target: string, enabled: boolean) {
    const action = enabled ? NATIVE_MESSAGES.CSS_ENABLE : NATIVE_MESSAGES.CSS_DISABLE;
    this.sendMessage({ action, target });
  }

  public requestFontSizeSet(target: string, size: number) {
    this.sendMessage({ action: NATIVE_MESSAGES.CSS_FONT_SIZE, target, size });
  }
}
