import { EXTENSION_MESSAGES, INJECT_URL_PATTERN } from '../config/general';
import { IDuckDuckGoTheme, IExtensionMessage } from '../definitions';

async function sendMessage(message: IExtensionMessage) {
  const tabs = await browser.tabs.query({ url: INJECT_URL_PATTERN });
  for (const tab of tabs) {
    browser.tabs.sendMessage(tab.id, message);
  }
}

export function requestTheme() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.DDG_THEME_GET });
}

export function setTheme(theme: IDuckDuckGoTheme) {
  sendMessage({ action: EXTENSION_MESSAGES.DDG_THEME_SET, data: theme });
}

export function resetTheme() {
  sendMessage({ action: EXTENSION_MESSAGES.DDG_THEME_RESET});
}
