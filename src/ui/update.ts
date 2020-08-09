import { setVersionLabel } from './utils';
import { EXTENSION_MESSAGES } from '../config/general';
import { IExtensionMessage, ThemeModes } from '../definitions';
import { requestUpdatePageMute, requestTemplateThemeMode } from './messenger';

const versionLabel = <HTMLSpanElement>document.getElementById('version');
const disableButton = <HTMLButtonElement>document.getElementById('disable-button');
let currentThemeMode: ThemeModes = null;

function handleExtensionMessage({ action, data }: IExtensionMessage) {
  switch (action) {
    case EXTENSION_MESSAGES.THEME_MODE_SET: /* fallthrough */
    case EXTENSION_MESSAGES.TEMPLATE_THEME_MODE_SET:
      setThemeMode(data);
      break;
  }
}

function setThemeMode(mode: ThemeModes) {
  if (mode !== ThemeModes.Auto) {
    if (currentThemeMode !== null) {
      document.body.classList.remove(currentThemeMode);
    }

    document.body.classList.add(mode);
    currentThemeMode = mode;
  }
}

disableButton.addEventListener('click', requestUpdatePageMute);
browser.runtime.onMessage.addListener(handleExtensionMessage);

requestTemplateThemeMode();
setVersionLabel(versionLabel);
