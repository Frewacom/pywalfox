import {
  IPalette,
  IPywalColors,
  IColorscheme,
  IBrowserTheme,
  IExtensionTheme,
  IDuckDuckGoTheme,
  IExtensionMessage,
  IColorschemeTemplate,
} from '../definitions';

import {
  generateColorscheme,
  generateExtensionTheme,
  generateDefaultExtensionTheme,
  generateDDGTheme,
} from './colorscheme';

import { State } from './state';
import { NativeApp } from './native-app';
import { MIN_REQUIRED_DAEMON_VERSION, EXTENSION_MESSAGES } from '../config';

import * as UI from '../communication/ui';
import * as DDG from '../communication/duckduckgo';

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
  private settingsPage: browser.tabs.Tab;

  constructor() {
    this.state = new State();
    this.nativeApp = new NativeApp({
      connected: this.nativeAppConnected.bind(this),
      updateNeeded: this.updateNeeded.bind(this),
      disconnected: this.nativeAppDisconnected.bind(this),
      version: this.validateVersion.bind(this),
      output: UI.sendDebuggingOutput,
      colorscheme: this.updateThemes.bind(this),
      cssToggleSuccess: this.cssToggleSuccess.bind(this),
      cssToggleFailed: this.cssToggleFailed.bind(this),
    });

    browser.runtime.onMessage.addListener(this.onMessage.bind(this));
  }

  /* Handles incoming messages from the UI and other content scripts. */
  private onMessage(message: IExtensionMessage) {
    switch (message.action) {
      case EXTENSION_MESSAGES.DDG_THEME_GET:
        const theme = this.state.getDuckDuckGoTheme();
        theme ? DDG.setTheme(theme) : DDG.resetTheme();
        break;
    }
  }

  private resetThemes() {
    const defaultExtensionTheme = generateDefaultExtensionTheme();

    browser.theme.reset();
    this.setExtensionTheme(defaultExtensionTheme);

    if (this.state.getDuckDuckGoThemeEnabled()) {
      DDG.resetTheme();
    }

    this.state.setThemes(null, null, null);;
    this.state.setApplied(false);
  }

  private updateThemes(pywalColors: IPywalColors, customColors?: IPalette) {
    const template = this.state.getTemplate();
    const colorscheme = generateColorscheme(pywalColors, customColors, template);
    const extensionTheme = generateExtensionTheme(colorscheme);

    this.setBrowserTheme(colorscheme.browser);
    this.setExtensionTheme(extensionTheme);

    let ddgTheme: IDuckDuckGoTheme = null;
    if (this.state.getDuckDuckGoThemeEnabled()) {
      ddgTheme = generateDDGTheme(colorscheme);
      DDG.setTheme(ddgTheme);
    }

    this.state.setThemes(colorscheme, extensionTheme, ddgTheme);
    this.state.setApplied(true);
  }

  private setBrowserTheme(browserTheme: IBrowserTheme) {
    browser.theme.update({ colors: browserTheme });
  }

  private setExtensionTheme(extensionTheme: IExtensionTheme) {
    if (!this.settingsPage) {
      return;
    }

    browser.tabs.insertCSS(this.settingsPage.id, { code: extensionTheme });
  }

  /**
   * Fetches the browser- and extension theme from state and applies it, if set.
   * This is used when launching the background script to increase the speed
   * at which the theme is applied.
   *
   * In all other cases, use 'updateThemes'.
   */
  private setSavedBrowserTheme() {
    const colorscheme = this.state.getColorscheme();
    if (colorscheme) {
      this.setBrowserTheme(colorscheme);
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

  private cssToggleSuccess(target: string, enabled: boolean) {
    this.state.setCssEnabled(target, enabled);
  }

  private cssToggleFailed(error: string) {
    UI.sendNotification(error);
  }

  public async start() {
    browser.storage.local.clear(); // debugging
    await this.state.load();

    this.setSavedBrowserTheme();
    this.nativeApp.connect();
  }
}
