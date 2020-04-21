export function isOpen(element: Element) {
  const attr = element.getAttribute('open');
  return attr === '';
}

export function open(element: Element) {
  element.setAttribute('open', '');
}

export function close(element: Element) {
  element.removeAttribute('open');
}

export function toggleOpen(element: Element) {
  isOpen(element) ? close(element) : open(element);
}

export function select(element: Element) {
  element.setAttribute('selected', '');
}

export function deselect(element: Element) {
  element.removeAttribute('selected');
}
