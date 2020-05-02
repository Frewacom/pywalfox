import { EXTENSION_MESSAGES } from '../config';
import { ThemeModes, IOptionSetData, IPaletteColorData } from '../definitions';

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

export function requestThemeMode() {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.THEME_MODE_GET });
}

export function requestThemeModeSet(mode: ThemeModes) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.THEME_MODE_SET, data: mode });
}

export function requestPaletteColorSet(id: string, color: string) {
  const paletteColorData: IPaletteColorData = { [id]: color };
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.PALETTE_COLOR_SET, data: paletteColorData });
}

export function requestOptionSet(option: string, enabled: boolean) {
  const optionData: IOptionSetData = { option, enabled };
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.OPTION_SET, data: optionData });
}

export function requestFontSizeSet(size: number) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.FONT_SIZE_SET, data: size });
}


