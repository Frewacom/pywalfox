import {
  IPywalColors,
  IColorschemeTemplate,
  ThemeModes,
  IOptionSetData
} from '../definitions';
import { EXTENSION_MESSAGES } from '../config';

export function sendDebuggingOutput(message: string, error?: boolean) {
  error === true ? console.error(message) : console.log(message);
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.DEBUGGING_OUTPUT, data: message });
}

export function sendDebuggingInfo(info: { connected: boolean, version: number }) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.DEBUGGING_INFO_SET, data: info });
}

export function sendNotification(message: string) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.NOTIFCATION, data: message });
}

export function sendPywalColors(pywalColors: IPywalColors) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.PYWAL_COLORS_SET, data: pywalColors });
}

export function sendTemplate(template: IColorschemeTemplate) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.TEMPLATE_SET, data: template });
}

export function sendThemeMode(mode: ThemeModes) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.THEME_MODE_SET, data: mode });
}

export function sendOptionSet(option: string, enabled: boolean) {
  const optionData: IOptionSetData = { option, enabled };
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.OPTION_SET, data: optionData });
}

