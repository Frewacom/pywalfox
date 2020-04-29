import { EXTENSION_MESSAGES } from '../config';
import { IDuckDuckGoTheme, IExtensionMessage } from '../definitions';
import { requestTheme } from '../communication/duckduckgo';

function getCurrentTheme() {
  return window.wrappedJSObject.DDG.settings.get('kae');
}

function resetTheme() {
  console.debug('Resetting theme');
  // TODO: We could send the reset theme from the background script based on the current theme mode
  window.wrappedJSObject.DDG.settings.setTheme('d');
}

function applyTheme(theme: IDuckDuckGoTheme) {
  console.debug('Applying Pywalfox theme');
  for (const color of theme) {
    window.wrappedJSObject.DDG.settings.set(color.id, color.value);
  }
}

function onMessage(message: IExtensionMessage) {
  switch (message.action) {
    case EXTENSION_MESSAGES.DDG_THEME_SET:
      const theme = message.data;
      theme && applyTheme(theme);
      break;
    case EXTENSION_MESSAGES.DDG_THEME_RESET:
      if (getCurrentTheme() === 'pywalfox') {
        resetTheme();
      }
    default:
      console.error(`Received unhandled action: ${message.action}`);
  }
}

browser.runtime.onMessage.addListener(onMessage);
requestTheme();

console.debug('Pywalfox content script loaded');






