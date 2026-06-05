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

export function registerContentScript() {
  return browser.contentScripts.register({
    matches: WEBSITE_INJECT_URL_PATTERN,
    js: [{ file: 'dist/website.js' }],
    runAt: 'document_start',
  });
}

export async function injectScript(tabId: number) {
  try {
    // 'document_idle' ensures the script actually runs on already-loaded tabs.
    // 'document_start' is silently skipped by Firefox for tabs past that phase.
    await browser.tabs.executeScript(tabId, {
      file: 'dist/website.js',
      runAt: 'document_idle',
    });
    return true;
  } catch (_) {
    return false;
  }
}

export async function injectScriptAndSetTheme(tabId: number, css: IExtensionTheme) {
  // executeScript is awaited before sending the theme message so that the
  // content script's onMessage listener is guaranteed to be registered before
  // WEBSITE_THEME_SET arrives. Sending the message before the script finishes
  // executing is a race that causes the message to be silently dropped.
  const injected = await injectScript(tabId);
  if (injected) {
    sendMessageToTab(tabId, { action: EXTENSION_MESSAGES.WEBSITE_THEME_SET, data: css });
  }
  return injected;
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
