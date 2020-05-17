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
  IThemeModeSetData,
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

export function sendThemeMode(mode: ThemeModes, updateSelected: boolean) {
  const themeModeData: IThemeModeSetData = { mode, updateSelected };
  sendMessage({ action: EXTENSION_MESSAGES.THEME_MODE_SET, data: themeModeData });
}

export function sendOption(option: string, enabled: boolean) {
  const optionData: IOptionSetData = { option, enabled };
  sendMessage({ action: EXTENSION_MESSAGES.OPTION_SET, data: optionData });
}

export function sendFontSize(size: number) {
  sendMessage({ action: EXTENSION_MESSAGES.FONT_SIZE_SET, data: size });
}

export function sendPaletteTemplate(template: IPaletteTemplate) {
  sendMessage({ action: EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET, data: template });
}

export function sendThemeTemplate(template: IThemeTemplate) {
  sendMessage({ action: EXTENSION_MESSAGES.THEME_TEMPLATE_SET, data: template });
}

export function sendCustomColors(customColors: Partial<IPalette>) {
  sendMessage({ action: EXTENSION_MESSAGES.CUSTOM_COLORS_SET, data: customColors });
}
