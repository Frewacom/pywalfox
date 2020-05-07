import { EXTENSION_MESSAGES } from '../config/general';

import {
  IInitialData,
  IPywalColors,
  IColorschemeTemplate,
  ThemeModes,
  IDebuggingInfoData,
  IOptionSetData,
  INotificationData,
} from '../definitions';

export function sendInitialData(data: IInitialData) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.INITIAL_DATA_SET, data });
}

export function sendDebuggingOutput(message: string, error=false) {
  error === true ? console.error(message) : console.log(message);
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.DEBUGGING_OUTPUT, data: message });
}

export function sendDebuggingInfo(info: IDebuggingInfoData) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.DEBUGGING_INFO_SET, data: info });
}

export function sendNotification(title: string, message: string, error=false) {
  const notificationData: INotificationData = { title, message, error };
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.NOTIFCATION, data: notificationData });
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

export function sendFontSizeSet(size: number) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.FONT_SIZE_SET, data: size });
}

export function sendPaletteTemplateSet(template: IColorschemeTemplate) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET, data: template });
}

