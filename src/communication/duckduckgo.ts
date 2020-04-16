import { EXTENSION_MESSAGES } from '../config';
import { IDuckDuckGoTheme } from '../definitions';

export function requestTheme() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.DDG_THEME_GET });
}

export function setTheme(theme: IDuckDuckGoTheme) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.DDG_THEME_SET, data: theme });
}

export function resetTheme() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.DDG_THEME_RESET});
}
