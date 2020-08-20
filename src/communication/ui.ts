import {
  IPalette,
  IInitialData,
  IPywalColors,
  IColorschemeTemplate,
  ITimeIntervalEndpoint,
  IPaletteTemplate,
  IThemeTemplate,
  ThemeModes,
  IDebuggingInfoData,
  IOptionSetData,
  INotificationData,
} from '@definitions';

import { EXTENSION_MESSAGES, EXTENSION_OPTIONS } from '@config/general';

function sendMessage(data: any) {
  // Mute errors from sending messages to non-existing listeners
  browser.runtime.sendMessage(data).catch(() => {});
}

export function sendInitialData(data: IInitialData) {
  sendMessage({ action: EXTENSION_MESSAGES.INITIAL_DATA_SET, data });
}

export function sendDebuggingOutput(message: string, error = false) {
  error === true ? console.error(message) : console.log(message);
  sendMessage({ action: EXTENSION_MESSAGES.DEBUGGING_OUTPUT, data: message });
}

export function sendDebuggingInfo(info: IDebuggingInfoData) {
  sendMessage({ action: EXTENSION_MESSAGES.DEBUGGING_INFO_SET, data: info });
}

export function sendNotification(title: string, message: string, error = false) {
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

export function sendTemplateThemeMode(mode: ThemeModes) {
  sendMessage({ action: EXTENSION_MESSAGES.TEMPLATE_THEME_MODE_SET, data: mode });
}

export function sendOption(option: string, enabled: boolean, value?: any) {
  const optionData: IOptionSetData = { option, enabled, value };
  sendMessage({ action: EXTENSION_MESSAGES.OPTION_SET, data: optionData });
}

export function sendFontSize(size: number) {
  sendOption(EXTENSION_OPTIONS.FONT_SIZE, true, size);
}

export function sendAutoTimeStart(start: ITimeIntervalEndpoint) {
  sendOption(EXTENSION_OPTIONS.AUTO_TIME_START, true, start);
}

export function sendAutoTimeEnd(end: ITimeIntervalEndpoint) {
  sendOption(EXTENSION_OPTIONS.AUTO_TIME_END, true, end);
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

export function requestInitialData() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.INITIAL_DATA_GET });
}

export function requestFetch() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.THEME_FETCH });
}

export function requestDisable() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.THEME_DISABLE });
}

export function requestThemeModeSet(mode: ThemeModes) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.THEME_MODE_SET, data: mode });
}

export function requestTemplateThemeMode() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.TEMPLATE_THEME_MODE_GET });
}

export function requestPaletteColorSet(id: string, color: string) {
  const paletteColorData: Partial<IPalette> = { [id]: color };
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.PALETTE_COLOR_SET, data: paletteColorData });
}

export function requestFontSizeSet(option: string, size: number) {
  requestOptionSet(option, true, size);
}

export function requestAutoTimeSet(option: string, time: ITimeIntervalEndpoint) {
  requestOptionSet(option, true, time);
}

export function requestOptionSet(option: string, enabled: boolean, value?: any) {
  const optionData: IOptionSetData = { option, enabled, value };
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.OPTION_SET, data: optionData });
}

export function requestThemeTemplateSet(template: IThemeTemplate) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.THEME_TEMPLATE_SET, data: template });
}

export function requestThemeTemplateReset() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.THEME_TEMPLATE_SET, data: null });
}

export function requestPaletteTemplateSet(template: IPaletteTemplate) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET, data: template });
}

export function requestPaletteTemplateReset() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET, data: null });
}

export function requestUpdatePageMute() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.UPDATE_PAGE_MUTE });
}
