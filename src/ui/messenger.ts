import { EXTENSION_MESSAGES } from '../config/general';

import {
  IPalette,
  IOptionSetData,
  IPaletteTemplate,
  IThemeTemplate,
  ITimeIntervalEndpoint,
  ThemeModes,
} from '../definitions';

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
