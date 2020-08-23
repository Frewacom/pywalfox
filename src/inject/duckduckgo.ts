import {
  IDuckDuckGoTheme,
  IExtensionMessage,
  IDuckDuckGoThemeSetData,
} from '@definitions';

import { requestTheme } from '@communication/content-scripts/duckduckgo';
import { EXTENSION_MESSAGES, DUCKDUCKGO_THEME_ID } from '@config/general';

function getTheme() {
  return window.wrappedJSObject.DDG.settings.get('kae');
}

function getHash() {
  return window.localStorage.getItem('hash');
}

function setHash(hash: string) {
  window.localStorage.setItem('hash', hash);
}

function onResetTheme() {
  if (getTheme() !== DUCKDUCKGO_THEME_ID) {
    return;
  }

  // TODO: We could send the reset theme from the background script based on the current theme mode
  window.wrappedJSObject.DDG.settings.setTheme('d');
  setHash('');
}

function applyTheme(hash: string, theme: IDuckDuckGoTheme) {
  Object.keys(theme).forEach((key) => {
    window.wrappedJSObject.DDG.settings.set(key, theme[key]);
  });

  window.wrappedJSObject.DDG.settings.set('kae', DUCKDUCKGO_THEME_ID);

  setHash(hash);
}

function onThemeSet(data: IDuckDuckGoThemeSetData) {
  const { hash, theme } = data;
  const currentHash = getHash();
  const currentTheme = getTheme();

  if (currentTheme !== DUCKDUCKGO_THEME_ID || currentHash !== hash) {
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
