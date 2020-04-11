import { IPywalColors } from '../../colorscheme';

/**
 * Interface for the messages received from the native messaging host.
 */
export interface INativeAppMessage {
  action: string;
  success: boolean;
  error?: string;
  version?: string;
  target?: string;
  colorscheme?: IPywalColors;
  [key: string]: any;
}

/**
 * Interface for the messages sent to the native messaging host.
 */
interface INativeAppRequest {
  action: string;
  target?: string;
}

/**
 * Interface for the callbacks used by the NativeApp class whenever a message is received.
 *
 * @remarks
 * The messaged received from the native messaging host will be parsed and
 * the appropriate callback defined in the interface will be called.
 *
 * @internal
 */
export interface INativeAppMessageCallbacks {
  version: (version: string) => void,
  output: (message: string) => void,
  colorscheme: (colorscheme: IPywalColors) => void,
  toggleCss: (target: string, enabled: boolean) => void
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
 *
 * @internal
 */
export class NativeApp {
  private port: browser.runtime.Port;
  private isConnected: boolean;
  private callbacks: INativeAppMessageCallbacks;

  private versionCheckTimeout: NodeJS.Timer;

  constructor(callbacks: INativeAppMessageCallbacks) {
    this.callbacks = callbacks;
    this.connect();
    this.requestVersion();
  }

  /**
   * Sends an error to be printed in the console and
   * in the debugging output of the settings page.
   *
   * @param error - the error message to print
   */
  private logError(error: string) {
    this.callbacks.output(error);
    console.error(error);
  }

  /**
   * Get value of a message recieved from the native messaging host.
   *
   * @param message - the message recieved from the native messaging host
   * @param key - the key to get the value of
   *
   * @returns the value stored in key of message, or false if key is not present in message
   */
  private getValue(message: INativeAppMessage, key: string) {
    if (message.hasOwnProperty(key)) {
      return message[key];
    }

    this.logError(`Recieved invalid message from native app. Missing required key: ${key}`);
    return false;
  }

  /**
   * Handles an incoming message from the native messaging host and
   * runs the appropriate action based on the message content.
   *
   * @param message - the message recieved from stdin of the connection
   */
  private async onMessage(message: INativeAppMessage) {
    if (message.success === true) {
      switch(message.action) {
        case 'debug:version':
          const version = this.getValue(message, 'version');
          if (version) {
            clearTimeout(this.versionCheckTimeout);
            this.callbacks.version(version);
          }
          break;
        case 'debug:output':
          const output = this.getValue(message, 'output');
          if (output) {
            this.callbacks.output(output);
          }
          break;
        case 'action:colorscheme':
          const colorscheme = this.getValue(message, 'colorscheme');
          if (colorscheme) {
            this.callbacks.colorscheme(colorscheme);
          }
          break;
        case 'css:enable':
          const enableTarget = this.getValue(message, 'target');
          if (enableTarget) {
            this.callbacks.toggleCss(enableTarget, true);
          }
          break;
        case 'css:disable':
          const disableTarget = this.getValue(message, 'target');
          if (disableTarget) {
            this.callbacks.toggleCss(disableTarget, false);
          }
          break;
        case 'action:invalid':
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

  /**
   * Handles the disconnection from the native messaging host
   *
   * @param port - the connection port that was disconnected
   */
  private async onDisconnect(port: browser.runtime.Port) {
    if (port.error) {
      console.log('Disconnected from native messaging host');
    }
  }

  /**
   * Sets up event listeners for the native messaging host connection.
   */
  private setupListeners() {
    this.port.onMessage.addListener(this.onMessage)
    this.port.onDisconnect.addListener(this.onDisconnect)
  }

  /**
   * Connects to the native messaging host.
   */
  public connect() {
    this.port = browser.runtime.connectNative('pywalfox');
    this.isConnected = true;
    this.setupListeners()
  }

  /**
   * Sends a message to the native messaging host.
   *
   * @param message - the message to send
   */
  private sendMessage(message: INativeAppRequest) {
    this.port.postMessage(message);
  }

  /**
   * Sends a message to the native messaging host, requesting the current version.
   */
  public requestVersion() {
    this.sendMessage({ action: 'debug:version' });
  }
}
