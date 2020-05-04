import { EXTENSION_MESSAGES, DUCKDUCKGO_THEME_ID } from '../config';
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
      const currentTheme = getCurrentTheme();
      if (!theme ) {
        if (currentTheme === DUCKDUCKGO_THEME_ID) {
          resetTheme();
        }
      } else {
        if (currentTheme !== DUCKDUCKGO_THEME_ID) {
          applyTheme(theme);
        }
      }
      break;
    case EXTENSION_MESSAGES.DDG_THEME_RESET:
      if (getCurrentTheme() === DUCKDUCKGO_THEME_ID) {
        resetTheme();
      }
      break;
    default:
      console.error(`Received unhandled action: ${message.action}`);
  }
}

requestTheme();
browser.runtime.onMessage.addListener(onMessage);
console.debug('Pywalfox content script loaded');






