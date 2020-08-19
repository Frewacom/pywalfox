import {
  IPalette,
  IPywalColors,
  IColorscheme,
  IBrowserTheme,
  IThemeTemplate,
  IOptionSetData,
  IExtensionTheme,
  IPaletteTemplate,
  IExtensionMessage,
  ThemeModes,
  CSSTargets,
} from '@definitions';

import {
  EXTENSION_PAGES,
  EXTENSION_OPTIONS,
  EXTENSION_COMMANDS,
  EXTENSION_MESSAGES,
  DEFAULT_CSS_FONT_SIZE,
  MIN_REQUIRED_DAEMON_VERSION,
} from '@config/general';

import {
  DEFAULT_THEME_DARK,
  DEFAULT_THEME_LIGHT,
} from '@config/default-themes';

import {
  extendPywalColors,
  generateColorscheme,
  generateBrowserTheme,
} from './colorscheme';

import { State } from './state';
import { NativeApp } from './native-app';
import { AutoMode } from './auto-mode';
import { ExtensionPage } from './extension-page';

import * as UI from '@communication/ui';
import * as DDG from '@communication/duckduckgo';

export class Extension {
  private state: State;
  private nativeApp: NativeApp;
  private settingsPage: ExtensionPage;
  private updatePage: ExtensionPage;
  private autoMode: AutoMode;
  private stateLoadPromise: Promise<void>;

  constructor() {
    this.state = new State();
    this.stateLoadPromise = null;
    this.autoMode = new AutoMode(this.onThemeChangeTrigger.bind(this));
    this.nativeApp = new NativeApp({
      connected: this.nativeAppConnected.bind(this),
      updateNeeded: this.updateNeeded.bind(this),
      disconnected: this.nativeAppDisconnected.bind(this),
      version: this.validateVersion.bind(this),
      output: UI.sendDebuggingOutput.bind(this),
      pywalColorsFetchSuccess: this.onPywalColorsFetchSuccess.bind(this),
      pywalColorsFetchFailed: this.onPywalColorsFetchFailed.bind(this),
      cssToggleSuccess: this.cssToggleSuccess.bind(this),
      cssToggleFailed: this.cssToggleFailed.bind(this),
      cssFontSizeSetSuccess: this.cssFontSizeSetSuccess.bind(this),
      cssFontSizeSetFailed: this.cssFontSizeSetFailed.bind(this),
    });

    browser.commands.onCommand.addListener(this.onCommand.bind(this));
    browser.runtime.onMessage.addListener(this.onMessage.bind(this));
    browser.browserAction.onClicked.addListener(() => this.settingsPage.open());
  }

  private getDefaultTemplate() {
    const themeMode = this.state.getThemeMode();

    if (!themeMode) {
      console.error('Failed to get default template: theme mode is not set');
      return;
    }

    return themeMode === ThemeModes.Dark ? DEFAULT_THEME_DARK : DEFAULT_THEME_LIGHT;
  }

  private startAutoThemeMode() {
    const { start, end } = this.state.getAutoTimeInterval();
    this.autoMode.start(start, end);
  }

  private setOption(optionData: IOptionSetData) {
    if (!optionData) {
      UI.sendDebuggingOutput('Tried to set option, but no data was provided', true);
      return;
    }

    switch (optionData.option) {
      case EXTENSION_OPTIONS.FONT_SIZE:
        this.setCssFontSize(optionData['value']);
        break;
      case EXTENSION_OPTIONS.DUCKDUCKGO:
        this.setDDGEnabled(optionData);
        break;
      case EXTENSION_OPTIONS.USER_CHROME: /* Fallthrough */
      case EXTENSION_OPTIONS.USER_CONTENT:
        this.setCustomCSSEnabled(optionData);
        break;
      case EXTENSION_OPTIONS.AUTO_TIME_START: /* Fallthrough */
      case EXTENSION_OPTIONS.AUTO_TIME_END:
        this.setAutoTimeInterval(optionData);
        break;
      default:
        UI.sendDebuggingOutput(`Received unhandled option: ${optionData.option}`);
    }
  }

  /* Handles extension keybindings set using Firefox */
  private onCommand(command: string) {
    switch (command) {
      case EXTENSION_COMMANDS.FETCH_THEME:
        this.nativeApp.requestPywalColors();
        break;
      case EXTENSION_COMMANDS.DISABLE_THEME:
        this.resetThemes();
        break;
      case EXTENSION_COMMANDS.ENABLE_DARK_MODE:
        this.setThemeMode(ThemeModes.Dark);
        break;
      case EXTENSION_COMMANDS.ENABLE_LIGHT_MODE:
        this.setThemeMode(ThemeModes.Light);
        break;
      case EXTENSION_COMMANDS.ENABLE_AUTO_MODE:
        this.setThemeMode(ThemeModes.Auto);
        break;
      default:
        console.warn(`Received unhandled command from Firefox: ${command}`);
    }
  }

  /* Handles incoming messages from the UI and other content scripts. */
  private async onMessage({ action, data }: IExtensionMessage) {
    switch (action) {
      case EXTENSION_MESSAGES.INITIAL_DATA_GET:
        // If the settings page is open on firefox startup, the initial data will be
        // requested before the state has loaded. To avoid this, we will wait for
        // 'this.stateLoadPromise' to be resolved before sending the data to the page.
        if (this.stateLoadPromise !== null) {
          await this.stateLoadPromise;
        }

        UI.sendInitialData(this.state.getInitialData());
        break;
      case EXTENSION_MESSAGES.DDG_THEME_GET:
        this.setDDGTheme();
        break;
      case EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET:
        this.setPaletteTemplate(data);
        break;
      case EXTENSION_MESSAGES.THEME_TEMPLATE_SET:
        this.setThemeTemplate(data);
        break;
      case EXTENSION_MESSAGES.THEME_MODE_SET:
        this.setThemeMode(data);
        break;
      case EXTENSION_MESSAGES.TEMPLATE_THEME_MODE_GET:
        UI.sendTemplateThemeMode(this.state.getTemplateThemeMode());
        break;
      case EXTENSION_MESSAGES.THEME_FETCH:
        this.fetchTheme();
        break;
      case EXTENSION_MESSAGES.THEME_DISABLE:
        this.resetThemes();
        break;
      case EXTENSION_MESSAGES.PALETTE_COLOR_SET:
        this.setPaletteColor(data);
        break;
      case EXTENSION_MESSAGES.OPTION_SET:
        this.setOption(data);
        break;
      case EXTENSION_MESSAGES.UPDATE_PAGE_MUTE:
        this.state.setUpdateMuted(true);
        this.updatePage.close();
        break;
    }
  }

  private updateExtensionPagesTheme(extensionTheme: IExtensionTheme) {
    this.settingsPage.setTheme(extensionTheme);
    this.updatePage.setTheme(extensionTheme);
  }

  private fetchTheme() {
    const isConnected = this.state.getConnected();

    if (!isConnected) {
      UI.sendNotification('Fetch failed', 'You are not connected to the Pywalfox daemon', true);
      return;
    }

    this.nativeApp.requestPywalColors();
  }

  private resetThemes() {
    browser.theme.reset();
    this.updateExtensionPagesTheme(null);

    if (this.state.getThemeMode() === ThemeModes.Auto) {
      this.autoMode.stop();
    }

    if (this.state.getDDGThemeEnabled()) {
      DDG.resetTheme();
    }

    this.state.setColors(null, null);
    this.state.setCustomColors(null);
    this.state.setApplied(false);

    UI.sendDebuggingOutput('Theme was disabled');
  }

  private setThemes(pywalColors: IPywalColors, customColors?: Partial<IPalette>) {
    const template = this.state.getTemplate();
    const colorscheme = generateColorscheme(pywalColors, customColors, template);

    this.setBrowserTheme(colorscheme.browser);
    this.updateExtensionPagesTheme(colorscheme.extension);

    if (this.state.getDDGThemeEnabled()) {
      DDG.setTheme(colorscheme.hash, colorscheme.duckduckgo);
    }

    this.state.setColors(pywalColors, colorscheme);
    this.state.setCustomColors(customColors ? customColors : null);
    this.state.setApplied(true);
  }

  private applyUpdatedPaletteTemplate(template: IPaletteTemplate) {
    const pywalColors = this.state.getPywalColors();

    if (!pywalColors) {
      return;
    }

    const customColors = this.state.getCustomColors();
    const filteredCustomColors = customColors.filter((color) => {
      pywalColors[template[color]] !== customColors[color];
    });

    this.setThemes(pywalColors, filteredCustomColors);
    UI.sendCustomColors(filteredCustomColors);
  }

  private applyDuckDuckGoTheme() {
    const colorscheme = this.state.getColorscheme();

    if (colorscheme) {
      DDG.setTheme(colorscheme.hash, colorscheme.duckduckgo);
    }
  }

  private setBrowserTheme(browserTheme: IBrowserTheme) {
    browser.theme.update({ colors: browserTheme });
  }

  private setDDGEnabled({ option, enabled }: IOptionSetData) {
    const isDDGEnabled = this.state.getDDGThemeEnabled();

    if (enabled && !isDDGEnabled) {
      this.applyDuckDuckGoTheme();
    } else if (!enabled && isDDGEnabled) {
      DDG.resetTheme();
    }

    UI.sendOption(option, enabled);
    this.state.setDDGThemeEnabled(enabled);
  }

  private setDDGTheme() {
    const isDDGEnabled = this.state.getDDGThemeEnabled();

    if (isDDGEnabled) {
      this.applyDuckDuckGoTheme();
    } else {
      DDG.resetTheme();
    }
  }

  private setCustomCSSEnabled({ option, enabled }: IOptionSetData) {
    if (Object.values(CSSTargets).includes(<CSSTargets>option)) {
      this.nativeApp.requestCssEnabled(option, enabled);
    } else {
      let action = enabled ? 'enable' : 'disable';
      UI.sendNotification('Custom CSS', `Could not ${action} CSS target "${option}". Invalid target`, true);
      UI.sendOption(option, !enabled);
    }
  }

  private setCssFontSize(value: number) {
    if (typeof value === 'number' && value !== undefined && value >= 10 && value <= 20) {
      // Currently, only userChrome uses the custom font size feature
      this.nativeApp.requestFontSizeSet(CSSTargets.UserChrome, value);
    } else {
      UI.sendNotification('Font size error', 'Invalid size or not set', true);
    }
  }

  private setSavedColorscheme(colorscheme: IColorscheme) {
    console.log('Applying saved colorscheme');
    this.setBrowserTheme(colorscheme.browser);
    this.updateExtensionPagesTheme(colorscheme.extension);
    this.state.setApplied(true);
  }

  private async onThemeChangeTrigger(isDay: boolean) {
    await this.state.setIsDay(isDay);
    this.updateThemeForCurrentMode();
    UI.sendTemplateThemeMode(this.state.getTemplateThemeMode());
    UI.sendDebuggingOutput(`Theme update triggered by automatic theme mode. Is day: ${isDay}`);
  }

  private updateThemeForCurrentMode() {
    const pywalColors = this.state.getPywalColors();
    const template = this.state.getTemplate();
    const customColors = this.state.getCustomColors();

    pywalColors && this.setThemes(pywalColors, customColors);

    UI.sendPaletteTemplate(template.palette);
    UI.sendThemeTemplate(template.browser);
    UI.sendCustomColors(customColors);
  }

  private async setThemeMode(mode: ThemeModes) {
    const currentMode = this.state.getThemeMode();

    if (currentMode === mode) {
      return;
    }

    await this.state.setThemeMode(mode); // Must wait for this to finish
    this.updateThemeForCurrentMode();

    if (mode === ThemeModes.Auto) {
      if (this.state.getApplied()) {
        this.startAutoThemeMode();
      }

      UI.sendTemplateThemeMode(this.state.getTemplateThemeMode());
    } else {
      this.autoMode.stop();
    }

    UI.sendThemeMode(mode);
  }

  private setPaletteTemplate(template: IPaletteTemplate) {
    let updatedTemplate: IPaletteTemplate = template;

    if (updatedTemplate === null) {
      updatedTemplate = this.getDefaultTemplate().palette;
    }

    this.state.setPaletteTemplate(updatedTemplate);
    this.applyUpdatedPaletteTemplate(updatedTemplate);

    UI.sendPaletteTemplate(updatedTemplate);
    UI.sendNotification('Palette template', 'Template was updated successfully');
  }

  private setThemeTemplate(template: IThemeTemplate) {
    const palette = this.state.getPalette();
    let updatedTemplate = template;

    if (updatedTemplate === null) {
      updatedTemplate = this.getDefaultTemplate().browser;
    }

    if (palette !== null) {
      // Generate a new browser theme only based on the current palette and the new template
      const browserTheme = generateBrowserTheme(palette, updatedTemplate);
      this.setBrowserTheme(browserTheme);
      this.state.setBrowserTheme(browserTheme);
    }

    this.state.setThemeTemplate(updatedTemplate);

    UI.sendThemeTemplate(updatedTemplate);
    UI.sendNotification('Theme template', 'Template was updated successfully');
  }

  private setPaletteColor(palette: Partial<IPalette>) {
    const pywalColors = this.state.getPywalColors();

    if (pywalColors !== null) {
      const customPalette = this.createCustomColorPalette(palette);
      this.setThemes(pywalColors, customPalette);
    }
  }

  private setAutoTimeInterval({ option, value }: IOptionSetData) {
    const isApplied = this.state.getApplied();

    if (option === EXTENSION_OPTIONS.AUTO_TIME_START) {
      this.state.setAutoTimeStart(value);
      this.autoMode.setStartTime(value, isApplied);
      UI.sendAutoTimeStart(value);
    } else {
      this.state.setAutoTimeEnd(value);
      this.autoMode.setEndTime(value, isApplied);
      UI.sendAutoTimeEnd(value);
    }

    UI.sendNotification('Auto mode', 'Light theme interval was updated successfully');
  }

  private createCustomColorPalette(data: Partial<IPalette>) {
    const currentColors = this.state.getCustomColors();

    if (currentColors === null) {
      return data;
    }

    return Object.assign(currentColors, data);
  }

  private validateVersion(version: string) {
    const versionNumber = parseFloat(version);
    if (versionNumber < MIN_REQUIRED_DAEMON_VERSION) {
      this.updateNeeded();
    }

    this.state.setVersion(versionNumber);
  }

  private updateNeeded() {
    if (this.state.getUpdateMuted()) {
      console.log('Update is required, but user has muted update notifications');
      return;
    }

    this.updatePage.open();
  }

  private nativeAppConnected() {
    this.state.setConnected(true);
  }

  private nativeAppDisconnected() {
    this.state.setConnected(false);

    UI.sendDebuggingOutput('Disconnected from native app', true);
    UI.sendDebuggingInfo({ connected: false, version: this.state.getVersion() });
  }

  private async onPywalColorsFetchSuccess(pywalColors: IPywalColors) {
    const colors = extendPywalColors(pywalColors);
    UI.sendDebuggingOutput('Pywal colors were fetched from daemon and applied successfully');
    UI.sendPywalColors(colors);

    // We must make sure to reset all custom colors for both theme modes or
    // previously selected custom colors will still be active on theme mode switch,
    // even after a Fetch.
    await this.state.resetAllCustomColors();

    this.setThemes(colors);

    if (this.state.getThemeMode() === ThemeModes.Auto) {
      this.startAutoThemeMode();
    }
  }

  private onPywalColorsFetchFailed(error: string) {
    UI.sendNotification('Pywal colors', error, true);
  }

  private cssToggleSuccess(target: CSSTargets) {
    const newState = this.state.getCssEnabled(target) ? false : true;
    let notificationMessage: string = `${target} was disabled successfully!`;

    if (newState === true) {
      notificationMessage = `${target} was enabled successfully!`;

      // If the user has changed the default font size, we must update it after
      // the CSS has been enabled.
      if (target === CSSTargets.UserChrome) {
        const fontSize = this.state.getCssFontSize();

        if (fontSize !== DEFAULT_CSS_FONT_SIZE) {
          this.setCssFontSize(fontSize);
        }
      }
    }

    this.state.setCssEnabled(target, newState);

    UI.sendOption(target, newState);
    UI.sendNotification('Restart needed', notificationMessage);
  }

  private cssToggleFailed(target: string, error: string) {
    const currentState = this.state.getCssEnabled(target);

    UI.sendOption(target, currentState);
    UI.sendNotification('Custom CSS', error);
  }

  private cssFontSizeSetSuccess(size: number) {
    this.state.setCssFontSize(size);

    UI.sendNotification('Restart needed', 'Updated base font size successfully');
    UI.sendFontSize(size);
  }

  private cssFontSizeSetFailed(error: string) {
    UI.sendNotification('Font size', error, false);
  }

  public async start() {
    this.settingsPage = new ExtensionPage(EXTENSION_PAGES.SETTINGS);
    this.updatePage = new ExtensionPage(EXTENSION_PAGES.UPDATE);

    this.stateLoadPromise = this.state.load();
    await this.stateLoadPromise;
    this.stateLoadPromise = null;

    const savedColorscheme = this.state.getColorscheme();
    const currentThemeMode = this.state.getThemeMode();

    // Run this after creating the extension pages so that the themes can be
    // set if the pages were reopened on launch.
    if (savedColorscheme !== null) {
      if (currentThemeMode === ThemeModes.Auto) {
        this.startAutoThemeMode();
      }

      this.setSavedColorscheme(savedColorscheme);
    }

    this.nativeApp.connect();
  }
}
