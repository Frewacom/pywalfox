import {
  IExtensionMessage,
  IExtensionTheme,
} from '@definitions';

import { EXTENSION_MESSAGES } from '@config/general';

const STYLE_ID = 'pywalfox-theme-variables';
const pywalfoxWindow = window as Window & { pywalfoxWebsiteThemeLoaded?: boolean };

function getStyleElement() {
  let element = document.getElementById(STYLE_ID) as HTMLStyleElement;

  if (!element) {
    element = document.createElement('style');
    element.id = STYLE_ID;
    document.documentElement.appendChild(element);
  }

  return element;
}

function setTheme(css: IExtensionTheme) {
  if (!css) {
    resetTheme();
    return;
  }

  getStyleElement().textContent = css;
}

function resetTheme() {
  document.getElementById(STYLE_ID)?.remove();
}

function onMessage({ action, data }: IExtensionMessage) {
  switch (action) {
    case EXTENSION_MESSAGES.WEBSITE_THEME_SET:
      setTheme(data);
      break;
    case EXTENSION_MESSAGES.WEBSITE_THEME_RESET:
      resetTheme();
      break;
    default:
      break;
  }
}

if (!pywalfoxWindow.pywalfoxWebsiteThemeLoaded) {
  pywalfoxWindow.pywalfoxWebsiteThemeLoaded = true;
  browser.runtime.onMessage.addListener(onMessage);
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.WEBSITE_THEME_GET }).catch(() => {});
}
