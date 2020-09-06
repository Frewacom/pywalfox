import {
  IPywalHash,
  IPywalColors,
  ICustomColors,
  ITheme,
  IUserTheme,
  IBrowserTheme,
  IBrowserThemeTemplate,
  IPaletteTemplate,
  IThemeTemplate,
  IDuckDuckGoThemeTemplate,
  ITimeIntervalEndpoint,
  IExtensionState,
  IExtensionOptions,
  IOptionSetData,
  ITemplateThemeMode,
  CSSTargets,
  ThemeModes,
} from '@definitions';

import { DEFAULT_CSS_FONT_SIZE } from '@config/general';
import { DEFAULT_THEME_DARK, DEFAULT_THEME_LIGHT } from '@config/default-themes';

export default class State {
  private initialState: IExtensionState;
  public currentState: IExtensionState;

  constructor() {
    this.initialState = {
      version: 0.0,
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
        intervalStart: { hour: 10, minute: 0, stringFormat: '10:00' },
        intervalEnd: { hour: 19, minute: 0, stringFormat: '19:00' },
      },
    };
  }

  private async set(newState: {}) {
    Object.assign(this.currentState, newState);
    await browser.storage.local.set(newState);
  }

  private updateGlobalTemplate(data: Partial<IThemeTemplate>) {
    const currentThemeMode = this.getTemplateThemeMode();

    return this.set({
      globalTemplates: {
        [currentThemeMode]: {
          ...this.currentState.globalTemplates[currentThemeMode],
          ...data,
        },
      },
    });
  }

  private updateGeneratedTheme(data: Partial<ITheme>) {
    return this.set({
      generatedTheme: {
        ...this.currentState.generatedTheme,
        ...data,
      }
    });
  }

  private updateGeneratedTemplate(data: Partial<IThemeTemplate>) {
    return this.set({
      generatedTheme: {
        ...this.currentState.generatedTheme,
        template: {
          ...this.currentState.generatedTheme.template,
          ...data,
        },
      },
    });
  }

  // TODO: Setting a template, e.g. 'browser' overwrites all other defined templates
  private updateCurrentTheme(data: Partial<IUserTheme>) {
    const pywalHash = this.getPywalHash();
    const currentThemeMode = this.getTemplateThemeMode();
    const savedTheme = Object.assign({}, this.currentState.userThemes[pywalHash]);

    if (Object.keys(savedTheme).length === 0) {
      savedTheme[currentThemeMode] = data;
    } else {
      savedTheme[currentThemeMode] = {
        ...savedTheme[currentThemeMode],
        ...data,
      };
    }

    return this.set({
      userThemes: {
        ...this.currentState.userThemes,
        [pywalHash]: savedTheme,
      },
    });
  }

  private updateOptions(option: Partial<IExtensionOptions>) {
    return this.set({
      options: {
        ...this.currentState.options,
        ...option,
      },
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
    const currentThemeMode = this.getTemplateThemeMode();
    const generatedTemplate = this.currentState.generatedTheme.template;

    if (generatedTemplate) {
      return generatedTemplate;
    }

    return this.currentState.globalTemplates[currentThemeMode];
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
    return this.currentState.globalTemplates[currentThemeMode];
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

  public getCssEnabled(target: CSSTargets) {
    return this.currentState.options[target];
  }

  public getCssFontSize() {
    return this.currentState.options.fontSize;
  }

  public getInterval() {
    const { intervalStart, intervalEnd } = this.currentState.options;
    return {
      start: intervalStart,
      end: intervalEnd,
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

  public setTemplate(userTemplate: Partial<IThemeTemplate>) {
    return this.updateCurrentTheme({ userTemplate });
  }

  public setCustomColors(customColors: ICustomColors) {
    return this.updateCurrentTheme({ customColors });
  }

  public setBrowserTheme(browser: IBrowserTheme) {
    return this.updateGeneratedTheme({ browser });
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

  public setCssEnabled(target: CSSTargets, enabled: boolean) {
    return this.updateOptions({ [target]: enabled });
  }

  public setCssFontSize(fontSize: number) {
    return this.updateOptions({ fontSize });
  }

  public setIntervalStart(intervalStart: ITimeIntervalEndpoint) {
    return this.updateOptions({ intervalStart });
  }

  public setIntervalEnd(intervalEnd: ITimeIntervalEndpoint) {
    return this.updateOptions({ intervalEnd });
  }

  public resetCustomColors() {
    return this.setCustomColors(null);
  }

  public resetGeneratedTheme() {
    return this.setGeneratedTheme(null);
  }

  public async load() {
    this.currentState = <IExtensionState>await browser.storage.local.get(this.initialState);

    // Make sure default state is present in storage
    await browser.storage.local.set(this.currentState);

    this.dump();
  }

  public dump() {
    console.log(this.currentState);
  }
}
