import { DEFAULT_THEME_TEMPLATE_DARK } from '../config';
import {
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
    colorscheme: IColorscheme,
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

  public getApplied() {
    return this.currentState.isApplied;
  }

  public getTemplateEnabled() {
    return this.currentState.theme.customTemplateEnabled;
  }

  public getTemplate() {
    return this.currentState.theme.template;
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

  public setApplied(isApplied: boolean) {
    return this.set({ theme: { isApplied } });
  }

  public setThemes(
    colorscheme: IColorscheme,
    extensionTheme: IExtensionTheme,
    ddgTheme: IDuckDuckGoTheme
  ) {
    return this.set({
      theme: {
        colorscheme: colorscheme,
        extension: extensionTheme,
        ddg: ddgTheme,
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
