import { Colorscheme, IColorscheme, IPywalColors } from '../colorscheme';
import { NativeApp, INativeAppMessageCallbacks } from './native-app'
import { Messenger } from '../messenger';
import { State } from '../state';


/**
 * Expose 'wrappedJSObject' from the 'window' namespace.
 *
 * @remarks
 * The object is used by the DuckDuckGo content script to interface
 * with the DuckDuckGo scripts. It allows us to get and set settings
 * using the built-in functions.
 */
declare global {
  interface Window {
    wrappedJSObject: { DDG: any; };
  }
}

export class Extension {
  private state: State;
  private nativeApp: NativeApp;
  private messenger: Messenger;
  private currentColorscheme: Colorscheme;

  constructor() {
    this.state = new State();
    this.messenger = new Messenger('ui');
    this.nativeApp = new NativeApp({
      version: this.setVersion,
      output: this.printDebuggingOutput,
      colorscheme: this.setColorscheme,
      toggleCss: this.toggleCustomCss,
      updateNeeded: this.updateNeeded,
      nativeAppDisconnected: this.nativeAppDisconnected,
    });
  }

  private setVersion(version: string) {

  }

  private updateNeeded() {

  }

  private nativeAppDisconnected() {

  }

  private printDebuggingOutput(message: string) {

  }

  private setColorscheme(pywalColors: IPywalColors) {
    this.currentColorscheme = new Colorscheme(pywalColors);
  }

  private toggleCustomCss(target: string, enabled: boolean) {

  }

  public async start() {
    console.log('Hello world');
    this.state.load();
    this.nativeApp.connect();
  }
}
