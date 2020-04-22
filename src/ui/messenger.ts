import { EXTENSION_MESSAGES } from '../config';

export function requestPywalColors() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.PYWAL_COLORS_GET });
}

export function requestTemplate() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.TEMPLATE_GET });
}

export function requestFetch() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.THEME_FETCH });
}

export function requestDisable() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.THEME_DISABLE });
}
