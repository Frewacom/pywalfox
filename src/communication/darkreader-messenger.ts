import {
  IDarkreaderScheme,
  IDarkreaderThemeMode,
  IDarkreaderMessage,
  IDarkreaderErrorCallback,
  ITemplateThemeMode,
  ThemeModes,
} from '@definitions';

import { DARKREADER_CONNECTION_ID, DARKREADER_MESSAGES } from '@config/general';

export default class DarkreaderMessenger {
  public isConnected: boolean;

  private port: browser.runtime.Port;
  private errorCallback: IDarkreaderErrorCallback;

  constructor(callback: IDarkreaderErrorCallback) {
    this.errorCallback = callback;
  }

  private onDisconnect({ error }: browser.runtime.Port) {
    if (error) {
      this.errorCallback(`Disconnected from darkreader: ${error}`);
    }

    this.isConnected = false;
  }

  private setupListeners() {
    this.port.onDisconnect.addListener(this.onDisconnect.bind(this));
  }

  private connectIfNotConnected() {
    if (!this.isConnected) {
      this.connect();
    }
  }

  private sendMessage(message: IDarkreaderMessage) {
    if (!this.isConnected) {
      this.connectIfNotConnected();
    }

    this.port.postMessage(message);
  }

  public connect() {
    this.port = browser.runtime.connect(DARKREADER_CONNECTION_ID);
    this.isConnected = true;

    this.setupListeners();
  }

  public requestThemeSet(scheme: IDarkreaderScheme) {
    this.sendMessage({ type: DARKREADER_MESSAGES.THEME, data: scheme });
  }

  public requestThemeModeSet(mode: ITemplateThemeMode) {
    const data: IDarkreaderThemeMode = {
      mode: mode === ThemeModes.Dark ? 1 : 0,
    };

    this.sendMessage({ type: DARKREADER_MESSAGES.THEME, data });
  }

  public requestThemeReset() {
    // TODO: Not implemented in the current Darkreader API
    //this.sendMessage({ type: DARKREADER_MESSAGES.RESET });
  }
}
