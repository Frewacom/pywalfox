import { DEFAULT_CSS_FONT_SIZE } from '../config/general';
import { DEFAULT_THEME_TEMPLATE_DARK, DEFAULT_THEME_TEMPLATE_LIGHT } from '../config/default-themes';

import {
  IPywalColors,
  IExtensionTheme,
  IDuckDuckGoTheme,
  IColorscheme,
  IColorschemeTemplate,
  ThemeModes,
  IOptionSetData,
} from '../definitions';

export interface IExtensionState {
  version: number,
  enabled: boolean;
  connected: boolean;
  theme: {
    mode: ThemeModes;
    isApplied: boolean;
    customTemplateEnabled: boolean;
    pywalColors: IPywalColors;
    colorscheme: IColorscheme;
    extension: IExtensionTheme;
    ddg: IDuckDuckGoTheme;
    template: IColorschemeTemplate;
  };
  options: {
    userChrome: boolean;
    userContent: boolean;
    fontSize: number;
    duckduckgo: boolean;
  };
}

export class State {
  private initialState: IExtensionState;
  public currentState: { [key: string]: any };

  constructor() {
    this.initialState = {
      version: 0.0,
      enabled: false,
      connected: false,
      theme: {
        mode: ThemeModes.Dark,
        isApplied: false,
        customTemplateEnabled: false,
        pywalColors: null,
        colorscheme: null,
        extension: null,
        ddg: null,
        template: DEFAULT_THEME_TEMPLATE_DARK,
      },
      options: {
        userChrome: false,
        userContent: false,
        fontSize: DEFAULT_CSS_FONT_SIZE,
        duckduckgo: false,
      }
    };
  }

  private async set(newState: {}) {
    Object.assign(this.currentState, newState);
    await browser.storage.local.set(newState);
  }

  public getEnabled() {
    return this.currentState.enabled;
  }

  public getApplied() {
    return this.currentState.isApplied;
  }

  public getDebuggingInfo() {
    return {
      connected: this.currentState.connected,
      version: this.currentState.version
    };
  }

  public getTemplateEnabled() {
    return this.currentState.theme.customTemplateEnabled;
  }

  public getTemplate() {
    const userTemplate = this.currentState.theme.template;

    if (userTemplate) {
      return userTemplate;
    }

    // TODO: Add case for Auto theme type
    const themeMode = this.currentState.theme.mode;
    return themeMode === ThemeModes.Dark ? DEFAULT_THEME_TEMPLATE_DARK : DEFAULT_THEME_TEMPLATE_LIGHT;
  }

  public getThemeMode() {
    return this.currentState.theme.mode;
  }

  public getPywalColors() {
    return this.currentState.theme.pywalColors;
  }

  public getColorscheme() {
    return this.currentState.theme.generated;
  }

  public getExtensionTheme() {
    return this.currentState.theme.extension;
  }

  public getDDGTheme() {
    return this.currentState.theme.ddg;
  }

  public getDDGThemeEnabled() {
    return this.currentState.options.duckduckgo;
  }

  public getCssEnabled(target: string) {
    if (this.currentState.options.hasOwnProperty(target)) {
      return this.currentState.options[target];
    }

    return false;
  }

  public getCssFontSize() {
    return this.currentState.options.fontSize;
  }

  public getOptionsData() {
    let data: IOptionSetData[] = [];
    for (const key in this.currentState.options) {
      const value = this.currentState.options[key];
      data.push({ option: key, enabled: value });
    }

    return data;
  }

  public setVersion(version: number) {
    return this.set({ version });
  }

  public setConnected(connected: boolean) {
    return this.set({ connected });
  }

  public setEnabled(enabled: boolean) {
    return this.set({ enabled });
  }

  public setApplied(isApplied: boolean) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        isApplied,
      }
    });
  }

  public setThemes(
    pywalColors: IPywalColors,
    colorscheme: IColorscheme,
    extensionTheme: IExtensionTheme,
    ddgTheme: IDuckDuckGoTheme
  ) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        pywalColors: pywalColors,
        colorscheme: colorscheme,
        extension: extensionTheme,
        ddg: ddgTheme,
      }
    });
  }

  public setCssEnabled(target: string, enabled: boolean) {
    this.set({
      options: {
        ...this.currentState.options,
        [target]: enabled,
      }
    });
  }

  public setCssFontSize(size: number) {
    this.set({
      options: {
        ...this.currentState.options,
        fontSize: size,
      }
    });
  }

  public setThemeMode(mode: ThemeModes) {
    // TODO: Apply the correct template based on the current mode
    this.set({
      theme: {
        ...this.currentState.theme,
        mode: mode,
        template: mode === ThemeModes.Dark ? DEFAULT_THEME_TEMPLATE_DARK : DEFAULT_THEME_TEMPLATE_LIGHT
      }
    });
  }

  public setDDGThemeEnabled(enabled: boolean) {
    this.set({
      options: {
        ...this.currentState.options,
        duckduckgo: enabled
      }
    });
  }

  public async load() {
    this.currentState = await browser.storage.local.get(this.initialState);
}

  /* Used for debugging. */
  public dump() {
    console.log(this.currentState);
  }
}
