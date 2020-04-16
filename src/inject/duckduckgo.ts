import { EXTENSION_MESSAGES } from '../config';
import { IDuckDuckGoTheme } from '../colorscheme';

function resetTheme() {
  console.debug('Resetting theme');
  window.wrappedJSObject.DDG.settings.setTheme('d');
}

function applyTheme(theme: IDuckDuckGoTheme) {
  console.debug('Applying Pywalfox theme');
  for (const color of theme) {
    window.wrappedJSObject.DDG.settings.set(`k${color.id}`, color.value, { saveToCookie: true });
  }
}

function load() {
  console.debug('Pywalfox content script loaded');
  browser.runtime.onMessage.addListener((message) => {
    switch (message.action) {
      case EXTENSION_MESSAGES.DDG_THEME_ENABLED:
        const theme = message.data;
        theme && applyTheme(theme);
        break;
      case EXTENSION_MESSAGES.DDG_THEME_DISABLED:
        resetTheme();
    }
  });
  browser.runtime.sendMessage(EXTENSION_MESSAGES.DDG_THEME_GET);
}

load();





