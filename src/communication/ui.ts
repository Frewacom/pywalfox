import { IPywalColors, IColorschemeTemplate } from '../definitions';
import { EXTENSION_MESSAGES } from '../config';

export function sendDebuggingOutput(message: string) {
  browser.runtime.sendMessage({ action: EXTENSION_MESSAGES.OUTPUT, data: message });
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
