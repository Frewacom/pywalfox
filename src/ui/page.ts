import { setVersionLabel } from '@utils/dom';
import { EXTENSION_MESSAGES } from '@config/general';
import { IExtensionMessage, IExtensionMessageCallback, ThemeModes } from '@definitions';
import { requestTemplateThemeMode } from '@communication/content-scripts/ui';

let currentThemeMode: ThemeModes = null;
let messageCallback: IExtensionMessageCallback = null;

function handleExtensionMessage(message: IExtensionMessage) {
  const { action, data } = message;

  switch (action) {
    case EXTENSION_MESSAGES.THEME_MODE_SET: /* fallthrough */
    case EXTENSION_MESSAGES.TEMPLATE_THEME_MODE_SET:
      setThemeMode(data.mode);
      break;
    default:
      break;
  }

  messageCallback && messageCallback(message);
}

function setThemeMode(mode: ThemeModes) {
  if (mode === ThemeModes.Auto) {
    return;
  }

  if (currentThemeMode !== null) {
    document.body.classList.remove(currentThemeMode);
  }

  document.body.classList.add(mode);
  currentThemeMode = mode;
}

export default function initializeExtensionPage(
  versionLabel: HTMLElement,
  callback: IExtensionMessageCallback,
) {
  if (callback) {
    messageCallback = callback;
  }

  if (versionLabel) {
    setVersionLabel(versionLabel);
  }

  browser.runtime.onMessage.addListener(handleExtensionMessage);
  requestTemplateThemeMode();
}
