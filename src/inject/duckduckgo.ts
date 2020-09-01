import {
  IDuckDuckGoTheme,
  IExtensionMessage,
  DuckDuckGoColorKeys,
  DuckDuckGoThemeKeys,
  DuckDuckGoSettingKeys,
  IDuckDuckGoThemeSetData,
} from '@definitions';

import { EXTENSION_MESSAGES } from '@config/general';
import { requestTheme } from '@communication/content-scripts/duckduckgo';

function getTheme() {
  return window.wrappedJSObject.DDG.settings.get(DuckDuckGoSettingKeys.ThemeId);
}

function getHash() {
  return window.localStorage.getItem('hash');
}

function setHash(hash: string) {
  window.localStorage.setItem('hash', hash);
}

function onResetTheme() {
  if (getTheme() !== DuckDuckGoThemeKeys.Pywalfox) {
    return;
  }

  // TODO: We could send the reset theme from the background script based on the current theme mode
  window.wrappedJSObject.DDG.settings.setTheme(DuckDuckGoThemeKeys.Dark);
  setHash('');
}

function applyTheme(hash: string, theme: IDuckDuckGoTheme) {
  Object.keys(theme).forEach((key: DuckDuckGoColorKeys) => {
    window.wrappedJSObject.DDG.settings.set(key, theme[key]);
  });

  window.wrappedJSObject.DDG.settings.set(
    DuckDuckGoSettingKeys.ThemeId,
    DuckDuckGoThemeKeys.Pywalfox,
  );

  setHash(hash);
}

function onThemeSet(data: IDuckDuckGoThemeSetData) {
  const { hash, theme } = data;
  const currentHash = getHash();
  const currentTheme = getTheme();

  if (currentTheme !== DuckDuckGoThemeKeys.Pywalfox || currentHash !== hash) {
    applyTheme(hash, theme);
  }
}

function onMessage({ action, data }: IExtensionMessage) {
  switch (action) {
    case EXTENSION_MESSAGES.DDG_THEME_SET:
      onThemeSet(data);
      break;
    case EXTENSION_MESSAGES.DDG_THEME_RESET:
      onResetTheme();
      break;
    default:
      break;
  }
}

browser.runtime.onMessage.addListener(onMessage);
requestTheme();

console.log('Pywalfox content script loaded');
