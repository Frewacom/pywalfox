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
  ISyncExtensionState,
  ILocalExtensionState,
  IExtensionOptions,
  IOptionSetData,
  ITemplateThemeMode,
  CSSTargets,
  ThemeModes,
} from '@definitions';

import { STATE_VERSION, DEFAULT_CSS_FONT_SIZE } from '@config/general';
import { DEFAULT_THEME_DARK, DEFAULT_THEME_LIGHT } from '@config/default-themes';

import Migrations from './migrations';

import merge from 'deepmerge';

export default class State {
  private initialLocalState: ILocalExtensionState;
  private currentLocalState: ILocalExtensionState;
  private initialSyncState: ISyncExtensionState;
  private currentSyncState: ISyncExtensionState;
  private shouldSync: boolean;

  constructor() {
    this.initialLocalState = {
      version: 0.0,
      connected: false,
      updateMuted: false,
      mode: ThemeModes.Dark,
      isDay: false,
      isApplied: false,
      pywalColors: null,
      pywalHash: null,
      generatedTheme: null,
    };

    this.initialSyncState = {
      stateVersion: 0.0,
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
        fetchOnStartup: true,
        syncSettings: true,
        intervalStart: { hour: 10, minute: 0, stringFormat: '10:00' },
        intervalEnd: { hour: 19, minute: 0, stringFormat: '19:00' },
      },
    };

    this.shouldSync = false;

    browser.storage.onChanged.addListener(this.onStateChanged.bind(this));
  }

  private onStateChanged(changes: browser.storage.StorageChange, areaName: string) {
    console.debug(`[${areaName}] State change:`, changes);
  }

  private getSyncStore() {
    if (this.shouldSync) {
      return browser.storage.sync;
    }

    return browser.storage.local;
  }

  private async set(newState: {}) {
    Object.assign(this.currentLocalState, newState);
    await browser.storage.local.set(newState);
  }

  private async setSync(newState: {}) {
    Object.assign(this.currentSyncState, newState);
    await this.getSyncStore().set(newState);
  }

  private updateGeneratedTheme(data: Partial<ITheme>) {
    const generatedTheme = this.currentLocalState.generatedTheme || {};
    const updatedTheme = merge(generatedTheme, data);

    return this.set({
      generatedTheme: updatedTheme,
    });
  }

  private updateGeneratedTemplate(data: Partial<IThemeTemplate>) {
    const { generatedTheme } = this.currentLocalState;

    if (!generatedTheme) {
      return;
    }

    const updatedTemplate = merge(generatedTheme.template, data);
    return this.updateGeneratedTheme({ template: updatedTemplate });
  }

  private updateGlobalTemplate(data: Partial<IThemeTemplate>) {
    const currentThemeMode = this.getTemplateThemeMode();
    const globalTemplate = this.currentSyncState.globalTemplates[currentThemeMode] || {};
    const updatedTemplate = merge(globalTemplate, data);

    return this.setSync({
      globalTemplates: {
        [currentThemeMode]: updatedTemplate,
      },
    });
  }

  private updateCurrentTheme(data: Partial<IUserTheme>, shouldMerge = true) {
    const pywalHash = this.getPywalHash();
    const currentThemeMode = this.getTemplateThemeMode();

    if (pywalHash === null) {
      return;
    }

    const currentTheme = this.currentSyncState.userThemes[pywalHash] || {};
    let updatedTheme: IUserTheme = {};

    if (shouldMerge) {
      updatedTheme = merge(currentTheme, {
        [currentThemeMode]: data,
      });
    } else {
      updatedTheme[currentThemeMode] = Object.assign({}, currentTheme[currentThemeMode], data);
    }

    return this.setSync({
      userThemes: {
        ...this.currentSyncState.userThemes,
        [pywalHash]: updatedTheme,
      },
    });
  }

  private updateOptions(option: Partial<IExtensionOptions>) {
    const updatedOptions = merge(this.currentSyncState.options, option);

    return this.setSync({
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
    return this.currentLocalState.isApplied;
  }

  public getVersion() {
    return this.currentLocalState.version;
  }

  public getConnected() {
    return this.currentLocalState.connected;
  }

  public getUpdateMuted() {
    return this.currentLocalState.updateMuted;
  }

  public getGeneratedTemplate() {
    const { generatedTheme } = this.currentLocalState;

    if (!generatedTheme) {
      return this.currentSyncState.globalTemplates[this.getTemplateThemeMode()];
    }

    return generatedTheme.template;
  }

  public getIsDay() {
    return this.currentLocalState.isDay;
  }

  public getThemeMode() {
    return this.currentLocalState.mode;
  }

  public getTemplateThemeMode() {
    let themeMode = this.getThemeMode();

    if (themeMode === ThemeModes.Auto) {
      themeMode = this.getIsDay() ? ThemeModes.Light : ThemeModes.Dark;
    }

    return <ITemplateThemeMode>themeMode;
  }

  public getPywalColors() {
    return this.currentLocalState.pywalColors;
  }

  public getPywalHash() {
    return this.currentLocalState.pywalHash;
  }

  public getGlobalTemplate() {
    const currentThemeMode = this.getTemplateThemeMode();
    const { globalTemplates } = this.currentSyncState;

    if (!globalTemplates) {
      return currentThemeMode === ThemeModes.Dark ? DEFAULT_THEME_DARK : DEFAULT_THEME_LIGHT;
    }

    return globalTemplates[currentThemeMode];
  }

  public getGeneratedTheme() {
    return this.currentLocalState.generatedTheme;
  }

  public getDuckduckgoEnabled() {
    return this.currentSyncState.options.duckduckgo;
  }

  public getDarkreaderEnabled() {
    return this.currentSyncState.options.darkreader;
  }

  public getFetchOnStartupEnabled() {
    return this.currentSyncState.options.fetchOnStartup;
  }

  public getCssFontSize() {
    return this.currentSyncState.options.fontSize;
  }

  public getCssEnabled(target: CSSTargets) {
    return this.currentSyncState.options[target];
  }

  public getInterval() {
    const { intervalStart, intervalEnd } = this.currentSyncState.options;
    return {
      intervalStart,
      intervalEnd,
    };
  }

  public getOptionsData() {
    const data: IOptionSetData[] = [];

    Object.keys(this.currentSyncState.options).forEach((key) => {
      const value = this.currentSyncState.options[key];

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
    const savedTheme = this.currentSyncState.userThemes[pywalHash];
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

  public setSyncSettingsEnabled(syncSettings: boolean) {
    const previousSyncStore = this.getSyncStore();
    this.shouldSync = syncSettings;

    // Transfer the synchronized state between local- and sync storage areas
    // based on the value of 'syncSettings'
    Migrations.transferSyncState(previousSyncStore, this.getSyncStore(), this.currentSyncState);

    return this.updateOptions({ syncSettings });
  }

  public resetCustomColors() {
    return this.setCustomColors(null);
  }

  public resetGeneratedTheme() {
    return this.setGeneratedTheme(null);
  }

  public async load() {
    const { stateVersion: syncStateVersion } = await browser.storage.sync.get('stateVersion');
    const { stateVersion: localStateVersion } = await browser.storage.local.get('stateVersion');
    let stateVersion: number = syncStateVersion;

    if (syncStateVersion === undefined || syncStateVersion === null) {
      // If 'stateVersion' is not present in sync storage, we assume that
      // syncing is disabled and load all state from local
      this.shouldSync = false;
      stateVersion = localStateVersion;
      console.log('[state] Loaded sync state from browser.storage.local');
    } else {
      this.shouldSync = true;
      console.log('[state] Loaded sync state from browser.storage.sync');
    }

    const syncStore = this.getSyncStore();

    await Migrations.applyMigration(stateVersion, this.initialSyncState, syncStore);

    this.currentLocalState = <ILocalExtensionState>await browser.storage.local.get(
      this.initialLocalState
    );

    this.currentSyncState = <ISyncExtensionState>await syncStore.get(
      this.initialSyncState
    );

    await this.setSync({ stateVersion: STATE_VERSION });
  }
}
