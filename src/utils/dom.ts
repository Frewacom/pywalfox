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

export function setOpen(element: HTMLElement) {
  setAttribute(element, 'open', true);
}

export function setClosed(element: HTMLElement) {
  setAttribute(element, 'open', false);
}

export function setSelected(element: HTMLElement) {
  setAttribute(element, 'selected', true);
}

export function setDeselected(element: HTMLElement) {
  setAttribute(element, 'selected', false);
}

export function setLoading(element: HTMLElement) {
  setAttribute(element, 'loading', true);
}

export function setLoaded(element: HTMLElement) {
  setAttribute(element, 'loading', false);
}

export function toggleSelected(element: HTMLElement) {
  toggleAttribute(element, 'selected');
}

export function toggleOpen(element: HTMLElement) {
  toggleAttribute(element, 'open');
}

export function debounce<F extends (...params: any[]) => void>(fn: F, delay: number) {
  let timeoutID: number = null;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => fn.apply(this, args), delay);
  } as F;
}
