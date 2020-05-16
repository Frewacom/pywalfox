import { EXTENSION_MESSAGES } from '../config/general';

import {
  IPalette,
  IInitialData,
  IPywalColors,
  IColorschemeTemplate,
  IPaletteTemplate,
  IThemeTemplate,
  ThemeModes,
  IDebuggingInfoData,
  IOptionSetData,
  INotificationData,
} from '../definitions';

function sendMessage(data: any) {
  // Mute errors from sending messages to non-existing listeners
  browser.runtime.sendMessage(data).catch(() => {});
}

export function sendInitialData(data: IInitialData) {
  sendMessage({ action: EXTENSION_MESSAGES.INITIAL_DATA_SET, data });
}

export function sendDebuggingOutput(message: string, error=false) {
  error === true ? console.error(message) : console.log(message);
  sendMessage({ action: EXTENSION_MESSAGES.DEBUGGING_OUTPUT, data: message });
}

export function sendDebuggingInfo(info: IDebuggingInfoData) {
  sendMessage({ action: EXTENSION_MESSAGES.DEBUGGING_INFO_SET, data: info });
}

export function sendNotification(title: string, message: string, error=false) {
  const notificationData: INotificationData = { title, message, error };
  sendMessage({ action: EXTENSION_MESSAGES.NOTIFCATION, data: notificationData });
}

export function sendPywalColors(pywalColors: IPywalColors) {
  sendMessage({ action: EXTENSION_MESSAGES.PYWAL_COLORS_SET, data: pywalColors });
}

export function sendTemplate(template: IColorschemeTemplate) {
  sendMessage({ action: EXTENSION_MESSAGES.TEMPLATE_SET, data: template });
}

export function sendThemeMode(mode: ThemeModes) {
  sendMessage({ action: EXTENSION_MESSAGES.THEME_MODE_SET, data: mode });
}

export function sendOptionSet(option: string, enabled: boolean) {
  const optionData: IOptionSetData = { option, enabled };
  sendMessage({ action: EXTENSION_MESSAGES.OPTION_SET, data: optionData });
}

export function sendFontSizeSet(size: number) {
  sendMessage({ action: EXTENSION_MESSAGES.FONT_SIZE_SET, data: size });
}

export function sendPaletteTemplateSet(template: IPaletteTemplate) {
  sendMessage({ action: EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET, data: template });
}

export function sendThemeTemplateSet(template: IThemeTemplate) {
  sendMessage({ action: EXTENSION_MESSAGES.THEME_TEMPLATE_SET, data: template });
}

export function sendCustomColors(customColors: Partial<IPalette>) {
  sendMessage({ action: EXTENSION_MESSAGES.CUSTOM_COLORS_SET, data: customColors });
}
