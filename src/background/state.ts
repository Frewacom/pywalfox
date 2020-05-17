import { DEFAULT_CSS_FONT_SIZE } from '../config/general';
import { DEFAULT_THEME_DARK, DEFAULT_THEME_LIGHT } from '../config/default-themes';

import {
  IPalette,
  IPywalColors,
  IColorscheme,
  IBrowserTheme,
  IExtensionTheme,
  IDuckDuckGoTheme,
  ICustomColors,
  IColorschemeTemplates,
  IPaletteTemplate,
  IThemeTemplate,
  IOptionSetData,
  ThemeModes,
} from '../definitions';

export interface IExtensionState {
  version: number,
  enabled: boolean;
  connected: boolean;
  updateMuted: boolean;
  theme: {
    mode: ThemeModes;
    isDay: boolean;
    isApplied: boolean;
    pywalColors: IPywalColors;
    colorscheme: IColorscheme;
    extension: IExtensionTheme;
    duckduckgo: IDuckDuckGoTheme;
    customColors: ICustomColors;
    templates: IColorschemeTemplates;
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
      enabled: false, // TODO: Is this state variable really needed, or is 'isApplied' sufficent?
      connected: false,
      updateMuted: false,
      theme: {
        mode: ThemeModes.Dark,
        isDay: false,
        isApplied: false,
        pywalColors: null,
        colorscheme: null,
        extension: null,
        duckduckgo: null,
        customColors: {
          [ThemeModes.Light]: {},
          [ThemeModes.Dark]: {},
        },
        templates: {
          [ThemeModes.Light]: DEFAULT_THEME_LIGHT,
          [ThemeModes.Dark]: DEFAULT_THEME_DARK,
        },
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

  private getProperty(object: { [key: string]: any }, property: string) {
    if (object) {
      if (object.hasOwnProperty(property)) {
        return object[property];
      }
    }

    return null;
  }

  public getInitialData() {
    return {
      pywalColors: this.getPywalColors(),
      template: this.getTemplate(),
      customColors: this.getCustomColors(),
      themeMode: this.getThemeMode(),
      debuggingInfo: this.getDebuggingInfo(),
      enabled: this.getEnabled(),
      options: this.getOptionsData(),
      fontSize: this.getCssFontSize(),
    };
  }

  public getDebuggingInfo() {
    return {
      connected: this.currentState.connected,
      version: this.currentState.version
    };
  }

  public getEnabled() {
    return this.currentState.enabled;
  }

  public getApplied() {
    return this.currentState.theme.isApplied;
  }

  public getVersion() {
    return this.currentState.version;
  }

  public getUpdateMuted() {
    return this.currentState.updateMuted;
  }

  public getTemplate() {
    return this.getProperty(this.currentState.theme.templates, this.getTemplateThemeMode());
  }

  public getIsDay() {
    return this.currentState.theme.isDay;
  }

  public getThemeMode() {
    return this.currentState.theme.mode;
  }

  public getTemplateThemeMode() {
    const themeMode = this.getThemeMode();

    if (themeMode === ThemeModes.Auto) {
      return this.getIsDay() ? ThemeModes.Light : ThemeModes.Dark;
    }

    return themeMode;
  }

  public getPywalColors() {
    return this.currentState.theme.pywalColors;
  }

  public getCustomColors() {
    return this.currentState.theme.customColors[this.getTemplateThemeMode()];
  }

  public getColorscheme() {
    return this.currentState.theme.colorscheme;
  }

  public getBrowserTheme() {
    return this.getProperty(this.getColorscheme(), 'browser');
  }

  public getPalette() {
    return this.getProperty(this.getColorscheme(), 'palette');
  }

  public getExtensionTheme() {
    return this.currentState.theme.extension;
  }

  public getDDGTheme() {
    return this.currentState.theme.duckduckgo;
  }

  public getDDGThemeEnabled() {
    return this.currentState.options.duckduckgo;
  }

  public getCssEnabled(target: string) {
    return this.getProperty(this.currentState.options, target);
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
      },
    });
  }

  public setUpdateMuted(muted: boolean) {
    return this.set({ updateMuted: muted });
  }

  public setCustomColors(customColors: Partial<IPalette>) {
    const currentThemeMode = this.getTemplateThemeMode();

    return this.set({
      theme: {
        ...this.currentState.theme,
        customColors: {
          ...this.currentState.theme.customColors,
          [currentThemeMode]: customColors,
        },
      },
    });
  }

  public setPaletteTemplate(template: IPaletteTemplate) {
    const currentThemeMode = this.getTemplateThemeMode();

    return this.set({
      theme: {
        ...this.currentState.theme,
        templates: {
          ...this.currentState.theme.templates,
          [currentThemeMode]: {
            ...this.currentState.theme.templates[currentThemeMode],
            palette: template,
          },
        },
      },
    });
  }

  public setThemeTemplate(template: IThemeTemplate) {
    const currentThemeMode = this.getTemplateThemeMode();

    return this.set({
      theme: {
        ...this.currentState.theme,
        templates: {
          ...this.currentState.theme.templates,
          [currentThemeMode]: {
            ...this.currentState.theme.templates[currentThemeMode],
            browser: template,
          },
        },
      },
    });
  }

  public setBrowserTheme(browserTheme: IBrowserTheme) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        colorscheme: {
          ...this.currentState.theme.colorscheme,
          browser: browserTheme,
        },
      },
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
        duckduckgo: ddgTheme,
      },
    });
  }

  public setCssEnabled(target: string, enabled: boolean) {
    return this.set({
      options: {
        ...this.currentState.options,
        [target]: enabled,
      },
    });
  }

  public setCssFontSize(size: number) {
    return this.set({
      options: {
        ...this.currentState.options,
        fontSize: size,
      }
    });
  }

  public setThemeMode(mode: ThemeModes) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        mode,
      },
    });
  }

  public setIsDay(isDay: boolean) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        isDay,
      },
    });
  }

  public setDDGThemeEnabled(enabled: boolean) {
    return this.set({
      options: {
        ...this.currentState.options,
        duckduckgo: enabled,
      },
    });
  }

  public async load() {
    this.currentState = await browser.storage.local.get(this.initialState);
}

  public dump() {
    console.log(this.currentState);
  }
}
