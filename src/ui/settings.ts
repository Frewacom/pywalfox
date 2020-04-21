import './colorpicker';

const colorButtons: NodeListOf<Element> = document.querySelectorAll('button[data-color]');
const settingCardHeaders: NodeListOf<Element> = document.querySelectorAll('.setting-card-header');

let selectedColor: Element = null;

function isOpen(element: Element) {
  const attr = element.getAttribute('open');
  return attr === '';
}

function open(element: Element) {
  element.setAttribute('open', '');
}

function close(element: Element) {
  element.removeAttribute('open');
}

function toggleOpen(element: Element) {
  isOpen(element) ? close(element) : open(element);
}

function onSettingCardClicked(header: Element) {
  toggleOpen(<Element>header.parentNode);
}

function onColorClicked(e: Event) {
  const target = <Element>e.target;
  const dialogOpen = isOpen(colorpicker);

  if (!dialogOpen) {
    open(colorpicker);
  }

  if (selectedColor !== null) {
    close(selectedColor);
  }

  open(target);
  selectedColor = target;
}

colorButtons.forEach((button: Element) => button.addEventListener('click', onColorClicked));
settingCardHeaders.forEach((header: Element) => header.addEventListener('click', () => onSettingCardClicked(header)));

