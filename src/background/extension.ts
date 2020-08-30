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

import Messenger from '@communication/messenger';
import NativeMessenger from '@communication/native-messenger';
import DarkreaderMessenger from '@communication/darkreader-messenger';

import State from './state';
import AutoMode from './auto-mode';
import Generators from './generators';
import ExtensionPage from './extension-page';

export default class Extension {
  private state: State;
  private nativeMessenger: NativeMessenger;
  private darkreaderMessenger: DarkreaderMessenger;
  private settingsPage: ExtensionPage;
  private updatePage: ExtensionPage;
  private autoMode: AutoMode;
  private stateLoadPromise: Promise<void>;

  constructor() {
    this.state = new State();
    this.stateLoadPromise = null;
    this.darkreaderMessenger = new DarkreaderMessenger(this.onDarkreaderError.bind(this));
    this.autoMode = new AutoMode(this.onThemeChangeTrigger.bind(this));
    this.nativeMessenger = new NativeMessenger({
      connected: this.nativeAppConnected.bind(this),
      updateNeeded: this.updateNeeded.bind(this),
      disconnected: this.nativeAppDisconnected.bind(this),
      version: this.validateVersion.bind(this),
      output: Messenger.UI.sendDebuggingOutput.bind(this),
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
      return null;
    }

    return themeMode === ThemeModes.Dark ? DEFAULT_THEME_DARK : DEFAULT_THEME_LIGHT;
  }

  private startAutoThemeMode() {
    const { start, end } = this.state.getAutoTimeInterval();
    this.autoMode.start(start, end);
  }

  private setOption(optionData: IOptionSetData) {
    if (!optionData) {
      Messenger.UI.sendDebuggingOutput('Tried to set option, but no data was provided', true);
      return;
    }

    switch (optionData.option) {
      case EXTENSION_OPTIONS.FONT_SIZE:
        this.setCssFontSize(optionData.value);
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
      case EXTENSION_OPTIONS.DARKREADER:
        this.setDarkreaderEnabled(optionData);
        break;
      default:
        Messenger.UI.sendDebuggingOutput(`Received unhandled option: ${optionData.option}`);
    }
  }

  /* Handles extension keybindings set using Firefox */
  private onCommand(command: string) {
    switch (command) {
      case EXTENSION_COMMANDS.FETCH_THEME:
        this.nativeMessenger.requestPywalColors();
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

        Messenger.UI.sendInitialData(this.state.getInitialData());
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
        Messenger.UI.sendTemplateThemeMode(this.state.getTemplateThemeMode());
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
      default:
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
      Messenger.UI.sendNotification('Fetch failed', 'You are not connected to the Pywalfox daemon', true);
      return;
    }

    this.nativeMessenger.requestPywalColors();
  }

  private resetThemes() {
    browser.theme.reset();
    this.updateExtensionPagesTheme(null);

    if (this.state.getThemeMode() === ThemeModes.Auto) {
      this.autoMode.stop();
    }

    if (this.state.getDDGThemeEnabled()) {
      Messenger.DDG.resetTheme();
    }

    if (this.state.getDarkreaderEnabled()) {
      this.darkreaderMessenger.requestThemeReset();
    }

    this.state.setColors(null, null);
    this.state.setCustomColors(null);
    this.state.setApplied(false);

    Messenger.UI.sendDebuggingOutput('Theme was disabled');
  }

  private setThemes(pywalColors: IPywalColors, customColors?: Partial<IPalette>) {
    const mode = this.state.getTemplateThemeMode();
    const template = this.state.getTemplate();
    const colorscheme = Generators.colorscheme(mode, pywalColors, customColors, template);

    this.setBrowserTheme(colorscheme.browser);
    this.updateExtensionPagesTheme(colorscheme.extension);

    if (this.state.getDDGThemeEnabled()) {
      Messenger.DDG.setTheme(colorscheme.hash, colorscheme.duckduckgo);
    }

    if (this.state.getDarkreaderEnabled()) {
      this.darkreaderMessenger.requestThemeSet(colorscheme.darkreader);
    }

    this.state.setColors(pywalColors, colorscheme);
    this.state.setCustomColors(customColors || null);
    this.state.setApplied(true);

    return colorscheme;
  }

  private applyUpdatedPaletteTemplate(template: IPaletteTemplate) {
    const pywalColors = this.state.getPywalColors();
    const customColors = this.state.getCustomColors();

    if (!pywalColors) {
      return;
    }

    // Make sure that a color from the pywal palette is not used as a custom color.
    let filteredCustomColors = customColors;
    if (customColors !== null) {
      filteredCustomColors = <Partial<IPalette>>Object.keys(customColors).filter((key) => {
        const pywalColor = pywalColors[template[key]];
        return pywalColor !== customColors[key];
      });
    }

    this.setThemes(pywalColors, filteredCustomColors);
    Messenger.UI.sendCustomColors(filteredCustomColors);
  }

  private applyDuckDuckGoTheme() {
    const colorscheme = this.state.getColorscheme();

    if (colorscheme) {
      Messenger.DDG.setTheme(colorscheme.hash, colorscheme.duckduckgo);
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
      Messenger.DDG.resetTheme();
    }

    Messenger.UI.sendOption(option, enabled);
    this.state.setDDGThemeEnabled(enabled);
  }

  private getDarkreaderScheme() {
    let darkreaderScheme = this.state.getColorscheme().darkreader;

    if (!darkreaderScheme) {
      // When updating from an addon version that does not support darkreader,
      // the darkreader scheme will not be generated yet.
      darkreaderScheme = this.updateThemeForCurrentMode().darkreader;
    }

    return darkreaderScheme;
  }

  private setDarkreaderEnabled({ option, enabled }: IOptionSetData) {
    const isApplied = this.state.getApplied();

    this.state.setDarkreaderEnabled(enabled);
    Messenger.UI.sendOption(option, enabled);

    if (!isApplied) {
      // The darkreader scheme will be applied when the user fetches pywal colors
      return;
    }

    if (enabled) {
      // TODO: We should probably disable the Duckduckgo integration when activating darkreader
      const darkreaderScheme = this.getDarkreaderScheme();
      this.darkreaderMessenger.requestThemeSet(darkreaderScheme);
    } else {
      this.darkreaderMessenger.requestThemeReset();
    }
  }

  private setDDGTheme() {
    const isDDGEnabled = this.state.getDDGThemeEnabled();

    if (isDDGEnabled) {
      this.applyDuckDuckGoTheme();
    } else {
      Messenger.DDG.resetTheme();
    }
  }

  private setCustomCSSEnabled({ option, enabled }: IOptionSetData) {
    if (Object.values(CSSTargets).includes(<CSSTargets>option)) {
      this.nativeMessenger.requestCssEnabled(option, enabled);
    } else {
      const action = enabled ? 'enable' : 'disable';
      Messenger.UI.sendNotification('Custom CSS', `Could not ${action} CSS target "${option}". Invalid target`, true);
      Messenger.UI.sendOption(option, !enabled);
    }
  }

  private setCssFontSize(value: number) {
    if (typeof value === 'number' && value !== undefined && value >= 10 && value <= 20) {
      // Currently, only userChrome uses the custom font size feature
      this.nativeMessenger.requestFontSizeSet(CSSTargets.UserChrome, value);
    } else {
      Messenger.UI.sendNotification('Font size error', 'Invalid size or not set', true);
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
    Messenger.UI.sendTemplateThemeMode(this.state.getTemplateThemeMode());
    Messenger.UI.sendDebuggingOutput(`Theme update triggered by automatic theme mode. Is day: ${isDay}`);
  }

  private updateThemeForCurrentMode() {
    const template = this.state.getTemplate();
    const pywalColors = this.state.getPywalColors();
    const customColors = this.state.getCustomColors();

    Messenger.UI.sendPaletteTemplate(template.palette);
    Messenger.UI.sendThemeTemplate(template.browser);
    Messenger.UI.sendCustomColors(customColors);

    if (pywalColors) {
      return this.setThemes(pywalColors, customColors);
    }

    return null;
  }

  private async setThemeMode(mode: ThemeModes) {
    const currentMode = this.state.getThemeMode();
    const previousTemplateMode = this.state.getTemplateThemeMode();

    if (currentMode === mode) {
      return;
    }

    /**
     * TODO: Change 'setThemeMode' behaviour to allow use without 'await'
     *
     * Doing it this way is not clean and can easily cause bugs, since forgetting
     * to await the promise will give us an invalid template mode.
     *
     * We could return the updated template mode when the state has been updated, e.g:
     * const { templateMode } = await this.state.updateThemeMode(mode);
     */
    await this.state.setThemeMode(mode);

    const newTemplateMode = this.state.getTemplateThemeMode();
    const isDarkreaderEnabled = this.state.getDarkreaderEnabled();

    // No need to update the theme if the currently applied theme mode
    // matches the one that will be set by auto-mode.
    if (previousTemplateMode !== newTemplateMode) {
      this.updateThemeForCurrentMode();
    }

    if (mode === ThemeModes.Auto) {
      if (this.state.getApplied()) {
        this.startAutoThemeMode();
      }

      Messenger.UI.sendTemplateThemeMode(newTemplateMode);
    } else {
      this.autoMode.stop();
    }

    if (isDarkreaderEnabled) {
      this.darkreaderMessenger.requestThemeModeSet(newTemplateMode);
    }

    Messenger.UI.sendThemeMode(mode, newTemplateMode);
  }

  private setPaletteTemplate(template: IPaletteTemplate) {
    let updatedTemplate: IPaletteTemplate = template;

    if (updatedTemplate === null) {
      updatedTemplate = this.getDefaultTemplate().palette;
    }

    this.state.setPaletteTemplate(updatedTemplate);
    this.applyUpdatedPaletteTemplate(updatedTemplate);

    Messenger.UI.sendPaletteTemplate(updatedTemplate);
  }

  private setThemeTemplate(template: IThemeTemplate) {
    const palette = this.state.getPalette();
    let updatedTemplate = template;

    if (updatedTemplate === null) {
      updatedTemplate = this.getDefaultTemplate().browser;
    }

    if (palette !== null) {
      // Generate a new browser theme only based on the current palette and the new template
      const browserTheme = Generators.browser(palette, updatedTemplate);
      this.setBrowserTheme(browserTheme);
      this.state.setBrowserTheme(browserTheme);
    }

    this.state.setThemeTemplate(updatedTemplate);

    Messenger.UI.sendThemeTemplate(updatedTemplate);
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
      Messenger.UI.sendAutoTimeStart(value);
    } else {
      this.state.setAutoTimeEnd(value);
      this.autoMode.setEndTime(value, isApplied);
      Messenger.UI.sendAutoTimeEnd(value);
    }

    Messenger.UI.sendNotification('Auto mode', 'Light theme interval was updated successfully');
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

  private onDarkreaderError(message: string) {
    Messenger.UI.sendDebuggingOutput(message, true);
  }

  private nativeAppConnected() {
    this.state.setConnected(true);
  }

  private nativeAppDisconnected() {
    this.state.setConnected(false);

    Messenger.UI.sendDebuggingOutput('Disconnected from native app', true);
    Messenger.UI.sendDebuggingInfo({ connected: false, version: this.state.getVersion() });
  }

  private async onPywalColorsFetchSuccess(pywalColors: IPywalColors) {
    const pywalPalette = Generators.pywalPalette(pywalColors);
    Messenger.UI.sendDebuggingOutput('Pywal colors were fetched from daemon and applied successfully');
    Messenger.UI.sendPywalColors(pywalPalette);

    // We must make sure to reset all custom colors for both theme modes or
    // previously selected custom colors will still be active on theme mode switch,
    // even after a Fetch.
    await this.state.resetAllCustomColors();

    this.setThemes(pywalPalette);

    if (this.state.getThemeMode() === ThemeModes.Auto) {
      this.startAutoThemeMode();
    }
  }

  private onPywalColorsFetchFailed(error: string) {
    Messenger.UI.sendNotification('Pywal colors', error, true);
  }

  private cssToggleSuccess(target: CSSTargets) {
    const newState = !this.state.getCssEnabled(target);
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

    Messenger.UI.sendOption(target, newState);
    Messenger.UI.sendNotification('Restart needed', notificationMessage);
  }

  private cssToggleFailed(target: string, error: string) {
    const currentState = this.state.getCssEnabled(target);

    Messenger.UI.sendOption(target, currentState);
    Messenger.UI.sendNotification('Custom CSS', error);
  }

  private cssFontSizeSetSuccess(size: number) {
    this.state.setCssFontSize(size);

    Messenger.UI.sendNotification('Restart needed', 'Updated base font size successfully');
    Messenger.UI.sendFontSize(size);
  }

  private cssFontSizeSetFailed(error: string) {
    Messenger.UI.sendNotification('Font size', error, false);
  }

  public async start() {
    this.settingsPage = new ExtensionPage(EXTENSION_PAGES.SETTINGS);
    this.updatePage = new ExtensionPage(EXTENSION_PAGES.UPDATE);

    this.stateLoadPromise = this.state.load();
    await this.stateLoadPromise;
    this.stateLoadPromise = null;

    const savedColorscheme = this.state.getColorscheme();
    const currentThemeMode = this.state.getThemeMode();
    const isDarkreaderEnabled = this.state.getDarkreaderEnabled();

    // Run this after creating the extension pages so that the themes can be
    // set if the pages were reopened on launch.
    if (savedColorscheme !== null) {
      if (currentThemeMode === ThemeModes.Auto) {
        this.startAutoThemeMode();
      }

      this.setSavedColorscheme(savedColorscheme);
    }

    this.nativeMessenger.connect();

    if (isDarkreaderEnabled) {
      this.darkreaderMessenger.connect();
    }
  }
}
