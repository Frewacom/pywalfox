import { State } from '../state';
import { Messenger } from '../messenger';
import { MIN_REQUIRED_DAEMON_VERSION } from '../config';
import { NativeApp } from './native-app'
import { Colorscheme, IColorscheme, IPywalColors } from '../colorscheme';

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
      connected: this.nativeAppConnected.bind(this),
      updateNeeded: this.updateNeeded.bind(this),
      disconnected: this.nativeAppDisconnected.bind(this),
      version: this.validateVersion.bind(this),
      output: this.printDebuggingOutput.bind(this),
      colorscheme: this.setColorscheme.bind(this),
      toggleCss: this.toggleCustomCss.bind(this),
    });
  }

  private setTheme(theme: browser._manifest.ThemeType) {
    browser.theme.update(theme);
  }

  private applySavedTheme() {
    const theme = this.state.getBrowserTheme();
    if (theme) {
      this.setTheme(theme);
      this.state.setApplied(true);
    } else {
      this.state.setApplied(false);
    }
  }

  private validateVersion(version: string) {
    const versionNumber = parseFloat(version);
    if (versionNumber < MIN_REQUIRED_DAEMON_VERSION) {
      this.updateNeeded();
    }

    this.state.setVersion(versionNumber);
  }

  private updateNeeded() {
    console.log('Update needed');
  }

  private nativeAppConnected() {
    if (!this.state.getApplied()) {
      this.nativeApp.requestColorscheme();
    }

    this.state.setConnected(true);
  }

  private nativeAppDisconnected() {
    console.error('Disconnected from native app');
    this.state.setConnected(false);
  }

  private printDebuggingOutput(message: string) {

  }

  private setColorscheme(pywalColors: IPywalColors) {
    this.currentColorscheme = new Colorscheme(pywalColors);
  }

  private toggleCustomCss(target: string, enabled: boolean) {

  }

  public async start() {
    browser.storage.local.clear(); // debugging
    await this.state.load();

    this.applySavedTheme();
    this.nativeApp.connect();
  }
}
