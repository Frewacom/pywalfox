import {
  IPalette,
  IPywalColors,
  IBrowserTheme,
  IExtensionMessage,
  IOptionSetData,
  IPaletteTemplate,
  IThemeTemplate,
  ThemeModes,
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
} from '../config/general';

import {
  DEFAULT_THEME_DARK,
  DEFAULT_THEME_LIGHT,
  DEFAULT_PALETTE_TEMPLATE_DARK,
  DEFAULT_BROWSER_TEMPLATE_DARK,
  DEFAULT_PALETTE_TEMPLATE_LIGHT,
  DEFAULT_BROWSER_TEMPLATE_LIGHT,
} from '../config/default-themes';

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
      colorscheme: this.onPywalColorsReceived.bind(this),
      cssToggleSuccess: this.cssToggleSuccess.bind(this),
      cssToggleFailed: this.cssToggleFailed.bind(this),
      cssFontSizeSetSuccess: this.cssFontSizeSetSuccess.bind(this),
      cssFontSizeSetFailed: this.cssFontSizeSetFailed.bind(this),
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

  private getInitialData() {
    const pywalColors = this.state.getPywalColors();
    const template = this.state.getTemplate();
    const themeMode = this.state.getThemeMode();
    const debuggingInfo = this.state.getDebuggingInfo();
    const enabled = this.state.getEnabled();
    const options = this.state.getOptionsData();

    return {
      pywalColors,
      template,
      themeMode,
      debuggingInfo,
      enabled,
      options,
    };
  }

  private getDefaultTemplate() {
    const themeMode = this.state.getThemeMode();

    if (!themeMode) {
      console.error('Theme mode is not set');
      return;
    }

    if (themeMode === ThemeModes.Dark) {
      return DEFAULT_THEME_DARK;
    }

    return DEFAULT_THEME_LIGHT;
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
        this.setDDGEnabled(optionData);
        break;
      case EXTENSION_OPTIONS.USER_CHROME: /* Fallthrough */
        this.setCustomCSSEnabled(optionData);
        // TODO: If the base font size has changed, request a font size update
        break;
      case EXTENSION_OPTIONS.USER_CONTENT:
        this.setCustomCSSEnabled(optionData);
        break;
      default:
        UI.sendDebuggingOutput(`Received unhandled option: ${optionData.option}`);
    }
  }

  /* Handles incoming messages from the UI and other content scripts. */
  private onMessage(message: IExtensionMessage) {
    switch (message.action) {
      case EXTENSION_MESSAGES.INITIAL_DATA_GET:
        const initialData = this.getInitialData();
        UI.sendInitialData(initialData);
        break;
      case EXTENSION_MESSAGES.DDG_THEME_GET:
        const isEnabled = this.state.getDDGThemeEnabled();
        if (isEnabled) {
          const theme = this.state.getDDGTheme();
          theme ? DDG.setTheme(theme): DDG.resetTheme();
        } else {
          DDG.resetTheme();
        }
        break;
      case EXTENSION_MESSAGES.PYWAL_COLORS_GET:
        var pywalColors = this.state.getPywalColors();
        pywalColors && UI.sendPywalColors(pywalColors);
        break;
      case EXTENSION_MESSAGES.TEMPLATE_GET:
        const template = this.state.getTemplate();
        template && UI.sendTemplate(template);
        break;
      case EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET:
        this.setPaletteTemplate(message);
        break;
      case EXTENSION_MESSAGES.THEME_TEMPLATE_SET:
        this.setThemeTemplate(message);
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
      case EXTENSION_MESSAGES.PALETTE_COLOR_SET:
        var pywalColors = this.state.getPywalColors();
        if (pywalColors !== null) {
          this.updateThemes(pywalColors, message.data);
        }
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

    // TODO: Do we have to send this on each theme update?
    UI.sendPywalColors(pywalColors);
    UI.sendTemplate(template);

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

  private setCustomCSSEnabled(optionData: IOptionSetData) {
    const target = optionData.option;
    const enabled = optionData.enabled;
    if (VALID_CSS_TARGETS.includes(target)) {
      this.nativeApp.requestCssEnabled(target, enabled);
    } else {
      UI.sendDebuggingOutput(`Could not enable CSS target "${target}". Invalid target`);
    }
  }

  private setDDGEnabled(optionData: IOptionSetData) {
    const enabled = optionData.enabled;
    const isEnabled = this.state.getDDGThemeEnabled();

    if (enabled && !isEnabled) {
      const ddgTheme = this.state.getDDGTheme();
      if (ddgTheme) {
        DDG.setTheme(ddgTheme);
      }
    } else if (!enabled && isEnabled) {
      DDG.resetTheme();
    }

    UI.sendOptionSet(optionData.option, optionData.enabled);
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

  // TODO: Validate type of message.data
  private setPaletteTemplate(message: IExtensionMessage) {
    const template = message.data;

    if (template === null) {
      const defaultTemplate = this.getDefaultTemplate();
      this.state.setPaletteTemplate(defaultTemplate.palette);
    } else {
      this.state.setPaletteTemplate(template);
    }
  }

  private setThemeTemplate(message: IExtensionMessage) {
    const template = message.data;

    if (template === null) {
      const defaultTemplate = this.getDefaultTemplate();
      this.state.setThemeTemplate(defaultTemplate.browser);
    } else {
      this.state.setThemeTemplate(template);
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

  private onPywalColorsReceived(pywalColors: IPywalColors) {
    UI.sendDebuggingOutput('Pywal colors was fetched from daemon and applied successfully');
    this.updateThemes(pywalColors);
  }

  private cssToggleSuccess(target: string) {
    const newState = this.state.getCssEnabled(target) ? false : true;
    let notificationMessage: string;

    if (newState === true) {
      notificationMessage = `${target} was enabled successfully!`;
    } else {
      notificationMessage = `${target} was disabled successfully!`;
    }

    UI.sendOptionSet(target, newState);
    UI.sendNotification('Custom CSS', notificationMessage);
    this.state.setCssEnabled(target, newState);
  }

  private cssToggleFailed(target: string, error: string) {
    const currentState = this.state.getCssEnabled(target);
    UI.sendOptionSet(target, currentState);
    UI.sendNotification('Custom CSS', error);
  }

  private cssFontSizeSetSuccess(size: number) {
    UI.sendNotification('Font size', 'Updated base font size successfully');
    UI.sendFontSizeSet(size);
    this.state.setCssFontSize(size);
  }

  private cssFontSizeSetFailed(error: string) {
    UI.sendNotification('Font size', error, false);
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
