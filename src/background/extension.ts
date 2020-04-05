import { Colorscheme, IColorscheme, IPywalColors } from '../colorscheme';
import { NativeApp, INativeAppMessageCallbacks } from './native-app'


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
 */
export class Extension {
  private version: string;
  private nativeApp : NativeApp;
  private currentColorscheme: Colorscheme;

  constructor() {
    this.nativeApp = new NativeApp({
      version: this.setVersion,
      output: this.printDebuggingOutput,
      colorscheme: this.setColorscheme,
      toggleCss: this.toggleCustomCss,
      invalidAction: this.invalidAction
    });
  }

  private setVersion(version: string) {
    this.version = version;
  }

  private printDebuggingOutput(message: string) {

  }

  private setColorscheme(pywalColors: IPywalColors) {
    this.currentColorscheme = new Colorscheme(pywalColors);
  }

  private toggleCustomCss(target: string, enabled: boolean) {

  }

  private invalidAction(action: string) {

  }

  public start() {
    console.log('Hello world')
  }
}
