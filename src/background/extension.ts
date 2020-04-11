import { Colorscheme, IColorscheme, IPywalColors } from '../colorscheme';
import { NativeApp, INativeAppMessageCallbacks } from './native-app'
import { Messenger } from './messenger';


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

/**
 * Main entry point of the background process of the extension.
 *
 * @internal
 */
export class Extension {
  private nativeApp: NativeApp;
  private messenger: Messenger;
  private currentColorscheme: Colorscheme;

  constructor() {
    this.messenger = new Messenger('ui');
    this.nativeApp = new NativeApp({
      version: this.setVersion,
      output: this.printDebuggingOutput,
      colorscheme: this.setColorscheme,
      toggleCss: this.toggleCustomCss
    });
  }

  private setVersion(version: string) {

  }

  private printDebuggingOutput(message: string) {

  }

  private setColorscheme(pywalColors: IPywalColors) {
    this.currentColorscheme = new Colorscheme(pywalColors);
  }

  private toggleCustomCss(target: string, enabled: boolean) {

  }

  public start() {
    console.log('Hello world')
  }
}
