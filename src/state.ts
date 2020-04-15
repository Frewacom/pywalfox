import { IBrowserTheme, IColorscheme } from './colorscheme';

export enum ThemeType {
  Dark,
  Light,
  Auto
}

export interface IExtensionState {
  version: string,
  enabled: boolean;
  connected: boolean;
  colorscheme: IColorscheme;
  options: {
    css: {
      userChrome: boolean;
      userContent: boolean;
      fontSize: number;
    },
    template: {
      enabled: boolean;
      theme: IBrowserTheme;
    },
    theme: ThemeType,
    duckDuckGoTheme: boolean;
  };
}

export class State {
  private initialState: IExtensionState;
  private currentState: { [key: string]: any };

  constructor() {
    this.initialState = {
      version: "",
      enabled: false,
      connected: false,
      colorscheme: null,
      options: {
        css: {
          userChrome: false,
          userContent: false,
          fontSize: 11,
        },
        template: {
          enabled: false,
          theme: null
        },
        theme: ThemeType.Dark,
        duckDuckGoTheme: false,
      }
    };
  }

  private async setState(key: string, value: any) {
    this.currentState[key] = value;
    await browser.storage.local.set({ [key]: value });
  }

  public async setVersion(version: string) {
    await this.setState('version', version);
  }

  public async load() {
    this.currentState = await browser.storage.local.get(this.initialState);
    console.log(this.currentState);
  }
}
