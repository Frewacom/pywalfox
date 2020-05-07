import { EXTENSION_MESSAGES, DUCKDUCKGO_THEME_ID } from '../config/general';
import { IDuckDuckGoTheme, IExtensionMessage } from '../definitions';
import { requestTheme } from '../communication/duckduckgo';

function getCurrentTheme() {
  return window.wrappedJSObject.DDG.settings.get('kae');
}

function getHash() {
  return window.localStorage.getItem('hash');
}

function setHash(hash: string) {
  window.localStorage.setItem('hash', hash);
}

function resetTheme() {
  // TODO: We could send the reset theme from the background script based on the current theme mode
  console.log('Resetting theme');
  window.wrappedJSObject.DDG.settings.setTheme('d');
  setHash('');
}

function applyTheme(theme: IDuckDuckGoTheme) {
  console.log('Applying Pywalfox theme');
  for (const color of theme.colors) {
    window.wrappedJSObject.DDG.settings.set(color.id, color.value);
  }

  setHash(theme.hash);
}

function onMessage(message: IExtensionMessage) {
  const currentTheme = getCurrentTheme();
  switch (message.action) {
    case EXTENSION_MESSAGES.DDG_THEME_SET:
      const theme = message.data;
      const hash = getHash();
      if (currentTheme !== DUCKDUCKGO_THEME_ID || hash !== theme.hash) {
        applyTheme(theme);
      }
      break;
    case EXTENSION_MESSAGES.DDG_THEME_RESET:
      if (currentTheme === DUCKDUCKGO_THEME_ID) {
        resetTheme();
      }
      break;
    default:
      console.error(`Received unhandled action: ${message.action}`);
  }
}

browser.runtime.onMessage.addListener(onMessage);
requestTheme();

console.log('Pywalfox content script loaded');






