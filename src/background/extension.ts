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
  generateDDGTheme,
} from './colorscheme';

import { State } from './state';
import { NativeApp } from './native-app';
import { SettingsPage } from './settings-page';
import { MIN_REQUIRED_DAEMON_VERSION, EXTENSION_MESSAGES } from '../config';

import * as UI from '../communication/ui';
import * as DDG from '../communication/duckduckgo';

export class Extension {
  private state: State;
  private nativeApp: NativeApp;
  private settingsPage: SettingsPage;

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
    browser.browserAction.onClicked.addListener(this.onIconClicked.bind(this));
  }

  private onIconClicked(tab: browser.tabs.Tab, clickData: browser.contextMenus.OnClickData) {
    if (this.settingsPage.isOpen()) {
      this.settingsPage.focus();
    } else {
      let extensionTheme = this.state.getExtensionTheme();
      if (extensionTheme) {
        this.settingsPage.open(extensionTheme);
      } else {
        this.settingsPage.open();
      }
    }
  }

  /* Handles incoming messages from the UI and other content scripts. */
  private onMessage(message: IExtensionMessage) {
    switch (message.action) {
      case EXTENSION_MESSAGES.DDG_THEME_GET:
        const theme = this.state.getDuckDuckGoTheme();
        theme ? DDG.setTheme(theme) : DDG.resetTheme();
        break;
      case EXTENSION_MESSAGES.PYWAL_COLORS_GET:
        const pywalColors = this.state.getPywalColors();
        pywalColors && UI.sendPywalColors(pywalColors);
        break;
      case EXTENSION_MESSAGES.TEMPLATE_GET:
        const template = this.state.getTemplate();
        template && UI.sendTemplate(template);
        break;
      case EXTENSION_MESSAGES.THEME_MODE_GET:
        const mode = this.state.getThemeMode();
        UI.sendThemeMode(mode);
        break;
      case EXTENSION_MESSAGES.THEME_FETCH:
        this.nativeApp.requestColorscheme();
        break;
      case EXTENSION_MESSAGES.THEME_DISABLE:
        this.resetThemes();
        break;
      case EXTENSION_MESSAGES.DEBUGGING_INFO_GET:
        const info = this.state.getDebuggingInfo();
        UI.sendDebuggingInfo(info);
    }
  }

  private createSettingsPage() {
    let currentTheme = null;
    if (this.state.getEnabled()) {
      currentTheme = this.state.getExtensionTheme();
    }

    this.settingsPage = new SettingsPage(currentTheme);
  }

  private resetThemes() {
    browser.theme.reset();
    this.settingsPage.resetTheme();
    UI.sendDebuggingOutput('Theme was disabled');

    if (this.state.getDuckDuckGoThemeEnabled()) {
      DDG.resetTheme();
    }

    this.state.setThemes(null, null, null, null); // TODO: Could probably save the generated themes
    this.state.setApplied(false);
    this.state.setEnabled(false);
  }

  private updateThemes(pywalColors: IPywalColors, customColors?: IPalette) {
    const template = this.state.getTemplate();
    const colorscheme = generateColorscheme(pywalColors, customColors, template);
    const extensionTheme = generateExtensionTheme(colorscheme);

    this.setBrowserTheme(colorscheme.browser);
    this.settingsPage.setTheme(extensionTheme);
    UI.sendPywalColors(pywalColors);
    UI.sendTemplate(template);
    UI.sendDebuggingOutput('Pywal colors was fetched from daemon and applied successfully');

    let ddgTheme: IDuckDuckGoTheme = null;
    if (this.state.getDuckDuckGoThemeEnabled()) {
      ddgTheme = generateDDGTheme(colorscheme);
      DDG.setTheme(ddgTheme);
    }

    this.state.setThemes(pywalColors, colorscheme, extensionTheme, ddgTheme);
    this.state.setApplied(true);

    !this.state.getEnabled() && this.state.setEnabled(true);
  }

  private setBrowserTheme(browserTheme: IBrowserTheme) {
    browser.theme.update({ colors: browserTheme });
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
    if (!this.state.getApplied() && this.state.getEnabled()) {
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

    if (this.state.getEnabled()) {
      this.setSavedBrowserTheme();
    }

    this.createSettingsPage();
    this.nativeApp.connect();
  }
}
