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
  ISyncExtensionState,
  ISyncExtensionOptions,
  ILocalExtensionState,
  ILocalExtensionOptions,
  IOptionSetData,
  ITemplateThemeMode,
  CSSTargets,
  ThemeModes,
} from '@definitions';

import { STATE_VERSION, DEFAULT_CSS_FONT_SIZE } from '@config/general';
import { DEFAULT_THEME_DARK, DEFAULT_THEME_LIGHT } from '@config/default-themes';

import Migrations from './migrations';

import merge from 'deepmerge';
import typeOf from 'just-typeof';

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
      localOptions: {
        userChrome: false,
        userContent: false,
        fontSize: DEFAULT_CSS_FONT_SIZE,
      },
    };

    this.initialSyncState = {
      stateVersion: 0.0,
      globalTemplates: {
        [ThemeModes.Light]: DEFAULT_THEME_LIGHT,
        [ThemeModes.Dark]: DEFAULT_THEME_DARK,
      },
      userThemes: {},
      syncOptions: {
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

  private async saveState<T>(
    store: browser.storage.StorageArea,
    newState: Partial<T>,
    currentState: T,
  ) {
    const changes: Partial<T> = {};
    Object.keys(newState).forEach((key) => {
      const newValue = newState[key];
      const currentValue = currentState[key];
      const valueType = typeOf(newValue);

      if (valueType === 'object' && newValue !== null && currentValue !== null) {
        changes[key] = merge(currentValue, newValue);
      } else {
        changes[key] = newValue;
      }

      currentState[key] = changes[key];
    });

    await store.set(changes);
  }

  private async set(newState: {}) {
    this.saveState(
      browser.storage.local,
      newState,
      this.currentLocalState,
    );
  }

  private async setSync(newState: {}) {
    this.saveState(
      this.getSyncStore(),
      newState,
      this.currentSyncState,
    );
  }

  private updateGeneratedTheme(data: Partial<ITheme>) {
    return this.set({ generatedTheme: data });
  }

  private updateGeneratedTemplate(data: Partial<IThemeTemplate>) {
    const { generatedTheme } = this.currentLocalState;

    if (!generatedTheme) {
      return;
    }

    return this.set({
      generatedTheme: {
        template: data
      },
    });
  }

  private updateGlobalTemplate(data: Partial<IThemeTemplate>) {
    const currentThemeMode = this.getTemplateThemeMode();

    return this.setSync({
      globalTemplates: {
        [currentThemeMode]: data,
      },
    });
  }

  private updateCurrentTheme(data: Partial<IUserTheme>) {
    const pywalHash = this.getPywalHash();

    if (pywalHash === null) {
      return;
    }

    const currentThemeMode = this.getTemplateThemeMode();

    return this.setSync({
      userThemes: {
        [pywalHash]: {
          [currentThemeMode]: data,
        },
      },
    });
  }

  private updateLocalOptions(option: Partial<ILocalExtensionOptions>) {
    return this.set({ localOptions: option });
  }

  private updateSyncOptions(option: Partial<ISyncExtensionOptions>) {
    return this.setSync({ syncOptions: option });
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
    return this.currentSyncState.syncOptions.duckduckgo;
  }

  public getDarkreaderEnabled() {
    return this.currentSyncState.syncOptions.darkreader;
  }

  public getFetchOnStartupEnabled() {
    return this.currentSyncState.syncOptions.fetchOnStartup;
  }

  public getCssFontSize() {
    return this.currentLocalState.localOptions.fontSize;
  }

  public getCssEnabled(target: CSSTargets) {
    return this.currentLocalState.localOptions[target];
  }

  public getInterval() {
    const { intervalStart, intervalEnd } = this.currentSyncState.syncOptions;
    return {
      intervalStart,
      intervalEnd,
    };
  }

  public getOptionsData() {
    const data: IOptionSetData[] = [];

    Object.keys(this.currentSyncState.syncOptions).forEach((key) => {
      const value = this.currentSyncState.syncOptions[key];

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

  public async replaceCustomColors(customColors: ICustomColors) {
    await this.setCustomColors(null);
    await this.setCustomColors(customColors);
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
    return this.updateSyncOptions({ duckduckgo });
  }

  public setDarkreaderEnabled(darkreader: boolean) {
    return this.updateSyncOptions({ darkreader });
  }

  public setFetchOnStartupEnabled(fetchOnStartup: boolean) {
    return this.updateSyncOptions({ fetchOnStartup });
  }

  public setIntervalStart(intervalStart: ITimeIntervalEndpoint) {
    return this.updateSyncOptions({ intervalStart });
  }

  public setIntervalEnd(intervalEnd: ITimeIntervalEndpoint) {
    return this.updateSyncOptions({ intervalEnd });
  }

  public setCssEnabled(target: CSSTargets, enabled: boolean) {
    return this.updateLocalOptions({ [target]: enabled });
  }

  public setCssFontSize(fontSize: number) {
    return this.updateLocalOptions({ fontSize });
  }

  public setSyncSettingsEnabled(syncSettings: boolean) {
    const previousSyncStore = this.getSyncStore();
    this.shouldSync = syncSettings;

    // Transfer the synchronized state between local- and sync storage areas
    // based on the value of 'syncSettings'
    Migrations.transferSyncState(previousSyncStore, this.getSyncStore(), this.currentSyncState);

    return this.updateSyncOptions({ syncSettings });
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
      console.log('[state] Loading sync state from browser.storage.local');
    } else {
      this.shouldSync = true;
      console.log('[state] Loading sync state from browser.storage.sync');
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
