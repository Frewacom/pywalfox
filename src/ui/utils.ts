import { ThemeModes, ITimeIntervalEndpoint } from '../definitions';

export function setVersionLabel(element: HTMLElement) {
  element.innerText = `v${browser.runtime.getManifest().version}`;
}

export function isSet(attr: string, element: HTMLElement) {
  const value = element.getAttribute(attr);
  return value === '';
}

export function isOpen(element: HTMLElement) {
  return isSet('open', element);
}

export function toggleAttribute(element: HTMLElement, attr: string) {
  const newState = isSet(attr, element) ? false : true;
  if (newState) {
    element.setAttribute(attr, '');
  } else {
    element.removeAttribute(attr);
  }
}

export function setAttribute(element: HTMLElement, attr: string, enabled: boolean) {
  if (enabled) {
    element.setAttribute(attr, '');
  } else {
    element.removeAttribute(attr);
  }
}

export function open(element: HTMLElement) {
  setAttribute(element, 'open', true);
}

export function close(element: HTMLElement) {
  setAttribute(element, 'open', false);
}

export function select(element: HTMLElement) {
  setAttribute(element, 'selected', true);
}

export function deselect(element: HTMLElement) {
  setAttribute(element, 'selected', false);
}

export function loading(element: HTMLElement) {
  setAttribute(element, 'loading', true);
}

export function loaded(element: HTMLElement) {
  setAttribute(element, 'loading', false);
}

export function toggleSelected(element: HTMLElement) {
  toggleAttribute(element, 'selected');
}

export function toggleOpen(element: HTMLElement) {
  toggleAttribute(element, 'open');
}

export function rgbToHex(rgb: string) {
  if (rgb[0] === '#' || !rgb) { return rgb; }
  const hex = rgb.substr(4, rgb.indexOf(')') - 4).split(',').map((color) => {
    let str = parseInt(color).toString(16);
    return str.length === 1 ? str = "0" + str : str;
  }).join('');
  return '#' + hex;
}

export function debounce<F extends (...params: any[]) => void>(fn: F, delay: number) {
  let timeoutID: number = null;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => fn.apply(this, args), delay);
  } as F;
}
