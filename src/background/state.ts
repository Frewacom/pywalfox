import {
  IPywalHash,
  IPywalColors,
  ICustomColors,
  ITheme,
  IUserTheme,
  IUserThemeTemplate,
  IBrowserTheme,
  IThemeTemplate,
  ITimeIntervalEndpoint,
  IExtensionState,
  IExtensionOptions,
  IOptionSetData,
  ITemplateThemeMode,
  CSSTargets,
  ThemeModes,
} from '@definitions';

import { STATE_VERSION, DEFAULT_CSS_FONT_SIZE } from '@config/general';
import { DEFAULT_THEME_DARK, DEFAULT_THEME_LIGHT } from '@config/default-themes';

import merge from 'deepmerge';

export default class State {
  private initialState: IExtensionState;
  public currentState: IExtensionState;

  constructor() {
    this.initialState = {
      version: 0.0,
      stateVersion: 0.0,
      connected: false,
      updateMuted: false,
      mode: ThemeModes.Dark,
      isDay: false,
      isApplied: false,
      pywalColors: null,
      pywalHash: null,
      generatedTheme: null,
      globalTemplates: {
        [ThemeModes.Light]: DEFAULT_THEME_LIGHT,
        [ThemeModes.Dark]: DEFAULT_THEME_DARK,
      },
      userThemes: {},
      options: {
        userChrome: false,
        userContent: false,
        fontSize: DEFAULT_CSS_FONT_SIZE,
        duckduckgo: false,
        darkreader: false,
        fetchOnStartup: false,
        intervalStart: { hour: 10, minute: 0, stringFormat: '10:00' },
        intervalEnd: { hour: 19, minute: 0, stringFormat: '19:00' },
      },
    };

    browser.storage.onChanged.addListener(this.onStateChanged.bind(this));
  }

  private onStateChanged(changes: browser.storage.StorageChange, areaName: string) {
    console.debug(`[${areaName}] State change:`, changes);
  }

  private async set(newState: {}) {
    Object.assign(this.currentState, newState);
    await browser.storage.local.set(newState);
  }

  private updateGlobalTemplate(data: Partial<IThemeTemplate>) {
    const currentThemeMode = this.getTemplateThemeMode();
    const globalTemplate = this.currentState.globalTemplates[currentThemeMode] || {};
    const updatedTemplate = merge(globalTemplate, data);

    return this.set({
      globalTemplates: {
        [currentThemeMode]: updatedTemplate,
      },
    });
  }

  private updateGeneratedTheme(data: Partial<ITheme>) {
    const generatedTheme = this.currentState.generatedTheme || {};
    const updatedTheme = merge(generatedTheme, data);

    return this.set({
      generatedTheme: updatedTheme,
    });
  }

  private updateGeneratedTemplate(data: Partial<IThemeTemplate>) {
    const { generatedTheme } = this.currentState;

    if (!generatedTheme) {
      return;
    }

    const updatedTemplate = merge(generatedTheme.template, data);
    return this.updateGeneratedTheme({ template: updatedTemplate });
  }

  private updateCurrentTheme(data: Partial<IUserTheme>, shouldMerge = true) {
    const pywalHash = this.getPywalHash();
    const currentThemeMode = this.getTemplateThemeMode();

    if (pywalHash === null) {
      return;
    }

    const currentTheme = this.currentState.userThemes[pywalHash] || {};
    let updatedTheme: IUserTheme = {};

    if (shouldMerge) {
      updatedTheme = merge(currentTheme, {
        [currentThemeMode]: data,
      });
    } else {
      updatedTheme[currentThemeMode] = Object.assign({}, currentTheme[currentThemeMode], data);
    }

    return this.set({
      userThemes: {
        ...this.currentState.userThemes,
        [pywalHash]: updatedTheme,
      },
    });
  }

  private updateOptions(option: Partial<IExtensionOptions>) {
    const updatedOptions = merge(this.currentState.options, option);

    return this.set({
      options: updatedOptions,
    });
  }

  public getInitialData() {
    return {
      debuggingInfo: this.getDebuggingInfo(),
      isApplied: this.getApplied(),
      pywalColors: this.getPywalColors(),
      template: this.getGeneratedTemplate(),
      userTheme: this.getUserTheme(),
      themeMode: this.getThemeMode(),
      templateThemeMode: this.getTemplateThemeMode(),
      options: this.getOptionsData(),
    };
  }

  public getDebuggingInfo() {
    return {
      version: this.getVersion(),
      connected: this.getConnected(),
    };
  }

  public getApplied() {
    return this.currentState.isApplied;
  }

  public getVersion() {
    return this.currentState.version;
  }

  public getConnected() {
    return this.currentState.connected;
  }

  public getUpdateMuted() {
    return this.currentState.updateMuted;
  }

  public getGeneratedTemplate() {
    const { generatedTheme } = this.currentState;

    if (!generatedTheme) {
      return this.currentState.globalTemplates[this.getTemplateThemeMode()];
    }

    return generatedTheme.template;
  }

  public getIsDay() {
    return this.currentState.isDay;
  }

  public getThemeMode() {
    return this.currentState.mode;
  }

  public getTemplateThemeMode() {
    let themeMode = this.getThemeMode();

    if (themeMode === ThemeModes.Auto) {
      themeMode = this.getIsDay() ? ThemeModes.Light : ThemeModes.Dark;
    }

    return <ITemplateThemeMode>themeMode;
  }

  public getPywalColors() {
    return this.currentState.pywalColors;
  }

  public getPywalHash() {
    return this.currentState.pywalHash;
  }

  public getGlobalTemplate() {
    const currentThemeMode = this.getTemplateThemeMode();
    const { globalTemplates } = this.currentState;

    if (!globalTemplates) {
      return currentThemeMode === ThemeModes.Dark ? DEFAULT_THEME_DARK : DEFAULT_THEME_LIGHT;
    }

    return globalTemplates[currentThemeMode];
  }

  public getGeneratedTheme() {
    return this.currentState.generatedTheme;
  }

  public getDuckduckgoEnabled() {
    return this.currentState.options.duckduckgo;
  }

  public getDarkreaderEnabled() {
    return this.currentState.options.darkreader;
  }

  public getFetchOnStartupEnabled() {
    return this.currentState.options.fetchOnStartup;
  }

  public getCssFontSize() {
    return this.currentState.options.fontSize;
  }

  public getCssEnabled(target: CSSTargets) {
    return this.currentState.options[target];
  }

  public getInterval() {
    const { intervalStart, intervalEnd } = this.currentState.options;
    return {
      intervalStart,
      intervalEnd,
    };
  }

  public getOptionsData() {
    const data: IOptionSetData[] = [];

    Object.keys(this.currentState.options).forEach((key) => {
      const value = this.currentState.options[key];

      if (typeof value === 'boolean') {
        data.push({ option: key, enabled: value });
      } else {
        data.push({ option: key, enabled: true, value });
      }
    });

    return data;
  }

  public getUserTheme() {
    const pywalHash = this.getPywalHash();
    const savedTheme = this.currentState.userThemes[pywalHash];
    const currentThemeMode = this.getTemplateThemeMode();

    if (!pywalHash || !savedTheme || !savedTheme[currentThemeMode]) {
      return {};
    }

    return savedTheme[currentThemeMode];
  }

  public setGlobalTemplate(data: Partial<IThemeTemplate>) {
    return this.updateGlobalTemplate(data);
  }

  public setGeneratedTemplate(template: Partial<IThemeTemplate>) {
    return this.updateGeneratedTemplate(template);
  }

  public setBrowserTheme(browser: IBrowserTheme) {
    return this.updateGeneratedTheme({ browser });
  }

  public setUserTemplate(userTemplate: Partial<IUserThemeTemplate>) {
    return this.updateCurrentTheme({ userTemplate });
  }

  public setCustomColors(customColors: ICustomColors) {
    return this.updateCurrentTheme({ customColors });
  }

  // Replaces the current custom colors with 'customColors'
  public replaceCustomColors(customColors: ICustomColors) {
    return this.updateCurrentTheme({ customColors }, false);
  }

  public setVersion(version: number) {
    return this.set({ version });
  }

  public setConnected(connected: boolean) {
    return this.set({ connected });
  }

  public setUpdateMuted(muted: boolean) {
    return this.set({ updateMuted: muted });
  }

  public setApplied(isApplied: boolean) {
    return this.set({ isApplied });
  }

  public setPywalColors(pywalColors: IPywalColors) {
    return this.set({ pywalColors });
  }

  public setPywalHash(pywalHash: IPywalHash) {
    return this.set({ pywalHash });
  }

  public setThemeMode(mode: ThemeModes) {
    return this.set({ mode });
  }

  public setIsDay(isDay: boolean) {
    return this.set({ isDay });
  }

  public setGeneratedTheme(generatedTheme: ITheme) {
    return this.set({ generatedTheme });
  }

  public setDuckduckgoEnabled(duckduckgo: boolean) {
    return this.updateOptions({ duckduckgo });
  }

  public setDarkreaderEnabled(darkreader: boolean) {
    return this.updateOptions({ darkreader });
  }

  public setFetchOnStartupEnabled(fetchOnStartup: boolean) {
    return this.updateOptions({ fetchOnStartup });
  }

  public setIntervalStart(intervalStart: ITimeIntervalEndpoint) {
    return this.updateOptions({ intervalStart });
  }

  public setIntervalEnd(intervalEnd: ITimeIntervalEndpoint) {
    return this.updateOptions({ intervalEnd });
  }

  public setCssEnabled(target: CSSTargets, enabled: boolean) {
    return this.updateOptions({ [target]: enabled });
  }

  public setCssFontSize(fontSize: number) {
    return this.updateOptions({ fontSize });
  }

  public resetCustomColors() {
    return this.setCustomColors(null);
  }

  public resetGeneratedTheme() {
    return this.setGeneratedTheme(null);
  }

  public async load() {
    const { stateVersion } = await browser.storage.local.get('stateVersion');

    // TODO: Move migrations to separate function/file
    if (!stateVersion) {
      // Migrating from <= 2.0.4
      const previousState = await browser.storage.local.get();

      // No need to migrate if there is no previous state
      if (Object.keys(previousState).length != 0) {
        const migratedState: unknown = {};

        console.info(`[state] State is outdated, starting migration to state version: ${STATE_VERSION}`);

        if (previousState.hasOwnProperty('options')) {
          const {
            userChrome,
            userContent,
            fontSize,
            duckduckgo,
            autoTimeStart,
            autoTimeEnd,
          } = previousState.options;

          migratedState['options'] = {
            userChrome: userChrome || this.initialState.options.userChrome,
            userContent: userContent || this.initialState.options.userContent,
            fontSize: fontSize || this.initialState.options.fontSize,
            duckduckgo: duckduckgo || this.initialState.options.duckduckgo,
            intervalStart: autoTimeStart || this.initialState.options.intervalStart,
            intervalEnd: autoTimeEnd || this.initialState.options.intervalEnd,
          };
        }

        if (previousState.hasOwnProperty('theme')) {
          const { isApplied, mode } = previousState.theme;

          migratedState['isApplied'] = isApplied || this.initialState.isApplied;
          migratedState['mode'] = mode || this.initialState.mode;

          if (previousState.theme.hasOwnProperty('templates')) {
            const { dark, light } = previousState.theme.templates;

            migratedState['globalTemplates'] = {
              [ThemeModes.Dark]: dark || this.initialState.globalTemplates.dark,
              [ThemeModes.Light]: light || this.initialState.globalTemplates.light,
            };

            // The duckduckgo template structure has been changed in version >= 2.0.5
            // It might already have the correct template type if 'dark' or 'light' is
            // undefined, but it is easier to it like this.
            migratedState['globalTemplates'][ThemeModes.Dark].duckduckgo =
              this.initialState.globalTemplates.dark.duckduckgo;

            migratedState['globalTemplates'][ThemeModes.Light].duckduckgo =
              this.initialState.globalTemplates.light.duckduckgo;
          }
        }

        console.info('[state] Applying migrated state', migratedState);

        // Can't use 'this.set(..)' here, since 'this.currentState' is not defined
        await browser.storage.local.clear();
        await browser.storage.local.set(migratedState);
      } else {
        // Save the initial state if no state is present
        await browser.storage.local.set(this.initialState);
      }
    } else if (stateVersion !== STATE_VERSION) {
      console.info('[state] Invalid state version detected, but no migration exists');
    }

    this.currentState = await browser.storage.local.get(this.initialState) as IExtensionState;

    return this.set({ stateVersion: STATE_VERSION });
  }

  public dump() {
    console.debug('[state]', this.currentState);
  }
}
