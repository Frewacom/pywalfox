import {
  IPalette,
  IPywalColors,
  IColorscheme,
  IBrowserTheme,
  IExtensionTheme,
  IDuckDuckGoTheme,
  IExtensionMessage,
  IColorschemeTemplate,
  IOptionSetData,
} from '../definitions';

import {
  generateColorscheme,
  generateExtensionTheme,
  generateDDGTheme,
} from './colorscheme';

import {
  MIN_REQUIRED_DAEMON_VERSION,
  EXTENSION_MESSAGES,
  EXTENSION_OPTIONS,
  VALID_CSS_TARGETS,
} from '../config';

import { State } from './state';
import { NativeApp } from './native-app';
import { SettingsPage } from './settings-page';

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
    // TODO: Setup listener for theme updates and update 'isApplied'
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

  private setOption(optionData: IOptionSetData) {
    if (!optionData) {
      UI.sendDebuggingOutput('Tried to set option, but no data was provided', true);
      return;
    }

    switch (optionData.option) {
      case EXTENSION_OPTIONS.FONT_SIZE:
        // TODO: Set font size
        break;
      case EXTENSION_OPTIONS.DUCKDUCKGO:
        this.setDDGEnabled(optionData.enabled);
        break;
      case EXTENSION_OPTIONS.USER_CHROME: /* Fallthrough */
      case EXTENSION_OPTIONS.USER_CONTENT:
        this.setCustomCSSEnabled(optionData.option, optionData.enabled);
        break;
      default:
        UI.sendDebuggingOutput(`Received unhandled option: ${optionData.option}`);
    }
  }

  /* Handles incoming messages from the UI and other content scripts. */
  private onMessage(message: IExtensionMessage) {
    switch (message.action) {
      case EXTENSION_MESSAGES.DDG_THEME_GET:
        const theme = this.state.getDDGTheme();
        theme ? DDG.setTheme(theme) : DDG.resetTheme();
        break;
      case EXTENSION_MESSAGES.PYWAL_COLORS_GET:
        var pywalColors = this.state.getPywalColors();
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
      case EXTENSION_MESSAGES.THEME_MODE_SET:
        this.state.setThemeMode(message.data);
        var pywalColors = this.state.getPywalColors();
        pywalColors && this.updateThemes(pywalColors);
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
        break;
      case EXTENSION_MESSAGES.OPTION_SET:
        this.setOption(message.data);
        break;
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

    if (this.state.getDDGThemeEnabled()) {
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
    const ddgTheme = generateDDGTheme(colorscheme);

    this.setBrowserTheme(colorscheme.browser);
    this.settingsPage.setTheme(extensionTheme);
    UI.sendPywalColors(pywalColors);
    UI.sendTemplate(template);
    UI.sendDebuggingOutput('Pywal colors was fetched from daemon and applied successfully');

    if (this.state.getDDGThemeEnabled()) {
      DDG.setTheme(ddgTheme);
    }

    this.state.setThemes(pywalColors, colorscheme, extensionTheme, ddgTheme);
    this.state.setApplied(true);

    !this.state.getEnabled() && this.state.setEnabled(true);
  }

  private setBrowserTheme(browserTheme: IBrowserTheme) {
    browser.theme.update({ colors: browserTheme });
  }

  private setCustomCSSEnabled(target: string, enabled: boolean) {
    if (VALID_CSS_TARGETS.includes(target)) {
      this.nativeApp.requestCssEnabled(target, enabled);
    } else {
      UI.sendDebuggingOutput(`Could not enable CSS target "${target}". Invalid target`);
    }
  }

  private setDDGEnabled(enabled: boolean) {
    const isEnabled = this.state.getDDGThemeEnabled();

    if (enabled && !isEnabled) {
      const ddgTheme = this.state.getDDGTheme();
      if (!ddgTheme) {
        UI.sendDebuggingOutput('Could not enable DuckDuckGo theme. Is the Pywalfox theme enabled?');
      } else {
        DDG.setTheme(ddgTheme);
      }
    } else if (!enabled && isEnabled) {
      DDG.resetTheme();
    }

    this.state.setDDGThemeEnabled(enabled);
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
    UI.sendDebuggingOutput('Daemon is outdated and things may break. Please update');
  }

  private nativeAppConnected() {
    if (!this.state.getApplied() && this.state.getEnabled()) {
      this.nativeApp.requestColorscheme();
    }

    this.state.setConnected(true);
  }

  private nativeAppDisconnected() {
    UI.sendDebuggingOutput('Disconnected from native app', true);
    this.state.setConnected(false);
  }

  private cssToggleSuccess(target: string, enabled: boolean) {
    UI.sendOptionSet(target, enabled);
    UI.sendNotification(`Custom CSS: ${target} was enabled successfully!`);
    this.state.setCssEnabled(target, enabled);
  }

  private cssToggleFailed(error: string) {
    // TODO: Send an 'OPTION_SET' error so that the settings page can update the button state
    UI.sendDebuggingOutput(error, true);
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
