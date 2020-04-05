/**
 * Interface for the messages used for communication between the browser extension
 * and the native messaging host.
 *
 * @public
 */
interface INativeAppMessage {
  action: string;
  success: boolean;
  data?: object;
  error?: string;
  target?: string;
  [propName: string]: any;
}

/**
 * Implements the communcation with the native messaging host.
 *
 * @remarks
 * Based on the native messaging protocol, allowing extensions to communicate with
 * user's computer and share resources that are otherwise inaccessible by the browser.
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
 *
 * @internal
 */
export class NativeApp {
  private port;
  private isConnected: boolean;
  private adapter: ;

  constructor() {

  }

  /**
   * Handles an incoming message from the native messaging host and
   * runs the appropriate action based on the message content.
   *
   * @param message - the message recieved from stdin of the connection
   */
  private async onMessage(message: INativeAppMessage) {
    switch(response.action) {
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
