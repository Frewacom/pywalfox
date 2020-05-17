import { EXTENSION_MESSAGES } from '../config/general';

import {
  IPalette,
  IOptionSetData,
  IPaletteTemplate,
  IThemeTemplate,
  ThemeModes,
} from '../definitions';

export function requestInitialData() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.INITIAL_DATA_GET });
}

export function requestDebuggingInfo() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.DEBUGGING_INFO_GET });
}

export function requestPywalColors() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.PYWAL_COLORS_GET });
}

export function requestTemplate() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.TEMPLATE_GET });
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

export function requestPaletteColorSet(id: string, color: string) {
  const paletteColorData: Partial<IPalette> = { [id]: color };
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.PALETTE_COLOR_SET, data: paletteColorData });
}

export function requestOptionSet(option: string, enabled: boolean, size?: number) {
  const optionData: IOptionSetData = { option, enabled, size };
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
