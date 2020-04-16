import { IBrowserTheme, IExtensionTheme, IDuckDuckGoTheme, IColorscheme } from './colorscheme';

export enum ThemeTypes {
  Dark,
  Light,
  Auto
}

export interface IExtensionState {
  version: number,
  enabled: boolean;
  connected: boolean;
  theme: {
    isApplied: boolean;
    type: ThemeTypes;
    colorscheme: IColorscheme,
    extension: IExtensionTheme;
    browser: IBrowserTheme;
    ddg: IDuckDuckGoTheme;
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
        isApplied: false,
        type: ThemeTypes.Dark,
        colorscheme: null,
        extension: null,
        browser: null,
        ddg: null,
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
        ddgEnabled: false,
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
    return this.currentState.theme.generated;
  }

  public getBrowserTheme() {
    return this.currentState.theme.browser;
  }

  public getExtensionTheme() {
    return this.currentState.theme.extension;
  }

  public getDuckDuckGoTheme() {
    if (this.currentState.options.ddgEnabled) {
      return this.currentState.theme.ddg;
    }

    return null;
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

  public setTheme(colorscheme: IColorscheme, browserTheme: IBrowserTheme, extensionTheme: IExtensionTheme) {
    return this.set({
      theme: {
        colorscheme: colorscheme,
        browser: browserTheme,
        extension: extensionTheme
      }
    });
  }

  public setCssEnabled(target: string, enabled: boolean) {
    this.set({
      options: {
        css: {
          [target]: enabled
        }
      }
    });
  }

  public async load() {
    this.currentState = await browser.storage.local.get(this.initialState);
  }
}
