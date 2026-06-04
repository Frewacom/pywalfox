import {
  IExtensionMessage,
  IExtensionTheme,
} from '@definitions';

import {
  EXTENSION_MESSAGES,
  WEBSITE_INJECT_URL_PATTERN,
} from '@config/general';

export async function getWebsiteTabs() {
  return browser.tabs.query({ url: WEBSITE_INJECT_URL_PATTERN });
}

function sendMessageToTab(tabId: number, message: IExtensionMessage) {
  browser.tabs.sendMessage(tabId, message).catch(() => {});
}

function sendMessageToTabs(tabIds: number[], message: IExtensionMessage) {
  tabIds.forEach((tabId) => sendMessageToTab(tabId, message));
}

export function requestTheme() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.WEBSITE_THEME_GET }).catch(() => {});
}

export const checkWebsiteCssVariablesPermission = () => (
  browser.permissions.contains({ origins: ['<all_urls>'] })
);

export const removeWebsiteCssVariablesPermission = () => (
  browser.permissions.remove({ origins: ['<all_urls>'] }).catch(() => false)
);

export function registerContentScript() {
  return browser.contentScripts.register({
    matches: WEBSITE_INJECT_URL_PATTERN,
    js: [{ file: 'dist/website.js' }],
    runAt: 'document_start',
  });
}

export async function injectScript(tabId: number) {
  try {
    await browser.tabs.executeScript(tabId, {
      file: 'dist/website.js',
      runAt: 'document_start',
    });
    return true;
  } catch (_) {
    return false;
  }
}

export async function injectScripts() {
  const tabs = await getWebsiteTabs();
  const tabIds = tabs
    .map((tab) => tab.id)
    .filter((tabId): tabId is number => tabId !== undefined);
  const injectedTabIds = await Promise.all(tabIds.map(async (tabId) => (
    await injectScript(tabId) ? tabId : null
  )));

  return injectedTabIds.filter((tabId): tabId is number => tabId !== null);
}

export function setTheme(tabIds: number[], css: IExtensionTheme) {
  sendMessageToTabs(tabIds, { action: EXTENSION_MESSAGES.WEBSITE_THEME_SET, data: css });
}

export function setThemeForTab(tabId: number, css: IExtensionTheme) {
  sendMessageToTab(tabId, {
    action: EXTENSION_MESSAGES.WEBSITE_THEME_SET,
    data: css,
  });
}

export function resetTheme(tabIds: number[]) {
  sendMessageToTabs(tabIds, { action: EXTENSION_MESSAGES.WEBSITE_THEME_RESET });
}
