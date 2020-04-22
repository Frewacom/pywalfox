import { DEFAULT_THEME_TEMPLATE_DARK } from '../config';
import {
  IPywalColors,
  IExtensionTheme,
  IDuckDuckGoTheme,
  IColorscheme,
  IColorschemeTemplate,
  ThemeTypes
} from '../definitions';

export interface IExtensionState {
  version: number,
  enabled: boolean;
  connected: boolean;
  theme: {
    type: ThemeTypes;
    isApplied: boolean;
    customTemplateEnabled: boolean;
    pywalColors: IPywalColors;
    colorscheme: IColorscheme;
    extension: IExtensionTheme;
    ddg: IDuckDuckGoTheme;
    template: IColorschemeTemplate;
  };
  options: {
    css: {
      userChrome: boolean;
      userContent: boolean;
      fontSize: number;
    },
    ddgEnabled: boolean;
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
        type: ThemeTypes.Dark,
        isApplied: false,
        customTemplateEnabled: false,
        pywalColors: null,
        colorscheme: null,
        extension: null,
        ddg: null,
        template: DEFAULT_THEME_TEMPLATE_DARK,
      },
      options: {
        css: {
          userChrome: false,
          userContent: false,
          fontSize: 11,
        },
        ddgEnabled: false,
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

  public getTemplateEnabled() {
    return this.currentState.theme.customTemplateEnabled;
  }

  public getTemplate() {
    return this.currentState.theme.template;
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

  public getDuckDuckGoTheme() {
    return this.currentState.theme.ddg;
  }

  public getDuckDuckGoThemeEnabled() {
    return this.currentState.options.ddgTheme;
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
        isApplied,
        ...this.currentState.theme,
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
        pywalColors: pywalColors,
        colorscheme: colorscheme,
        extension: extensionTheme,
        ddg: ddgTheme,
        ...this.currentState.theme,
      }
    });
  }

  public setCssEnabled(target: string, enabled: boolean) {
    this.set({
      options: {
        css: {
          ...this.currentState.css,
          [target]: enabled,
        }
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
