import { IColorscheme } from './colorscheme';

export enum ThemeTypes {
  Dark,
  Light,
  Auto
}

export interface IExtensionState {
  version: number,
  enabled: boolean;
  connected: boolean;
  colorscheme: IColorscheme;
  theme: {
    isApplied: boolean;
    type: ThemeTypes;
    extension: IColorscheme;
    browser: browser._manifest.ThemeType;
    template: {
      enabled: boolean;
      keys: {};
    };
  };
  options: {
    css: {
      userChrome: boolean;
      userContent: boolean;
      fontSize: number;
    },
    duckDuckGoTheme: boolean;
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
      colorscheme: null,
      theme: {
        isApplied: false,
        type: ThemeTypes.Dark,
        extension: null,
        browser: null,
        template: {
          enabled: false,
          keys: null,
        },
      },
      options: {
        css: {
          userChrome: false,
          userContent: false,
          fontSize: 11,
        },
        duckDuckGoTheme: false,
      }
    };
  }

  private async set(newState: {}) {
    Object.assign(this.currentState, newState);
    await browser.storage.local.set(newState);
  }

  public getApplied() {
    return this.currentState.isApplied;
  }

  public getColorscheme() {
    return this.currentState.theme.colorscheme;
  }

  public getBrowserTheme() {
    return this.currentState.theme.browser;
  }

  public setVersion(version: number) {
    return this.set({ version });
  }

  public setConnected(connected: boolean) {
    return this.set({ connected });
  }

  public setApplied(isApplied: boolean) {
    return this.set({ theme: { isApplied } });
  }

  public setColorscheme(colorscheme: IColorscheme) {
    return this.set({ theme: { colorscheme } });
  }

  public async load() {
    this.currentState = await browser.storage.local.get(this.initialState);
  }
}
