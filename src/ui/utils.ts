export function isSet(attr: string, element: HTMLElement) {
  const value = element.getAttribute(attr);
  return value === '';
}

export function isOpen(element: HTMLElement) {
  return isSet('open', element);
}

export function open(element: HTMLElement) {
  element.setAttribute('open', '');
}

export function close(element: HTMLElement) {
  element.removeAttribute('open');
}

export function toggleOpen(element: HTMLElement) {
  isSet('open', element) ? close(element) : open(element);
}

export function select(element: HTMLElement) {
  element.setAttribute('selected', '');
}

export function deselect(element: HTMLElement) {
  element.removeAttribute('selected');
}

export function toggleSelected(element: HTMLElement) {
  isSet('selected', element) ? deselect(element) : select(element);
}
