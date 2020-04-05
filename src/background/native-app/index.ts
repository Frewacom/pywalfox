import { IPywalColors } from '../../colorscheme';

/**
 * Interface for the messages used for communication between the browser extension
 * and the native messaging host.
 */
export interface INativeAppMessage {
  action: string;
  success: boolean;
  data?: object;
  error?: string;
  target?: string;
  [propName: string]: any;
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
  toggleCss: (target: string, enabled: boolean) => void,
  invalidAction: (action: string) => void
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

  constructor(callbacks: INativeAppMessageCallbacks) {
    this.callbacks = callbacks;
    this.connect();
  }

  /**
   * Handles an incoming message from the native messaging host and
   * runs the appropriate action based on the message content.
   *
   * @param message - the message recieved from stdin of the connection
   */
  private async onMessage(message: INativeAppMessage) {
    switch(message.action) {
      default:
        break;
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
    this.port = browser.runtime.connectNative("pywalfox");
    this.isConnected = true;
    this.setupListeners()
  }
}
