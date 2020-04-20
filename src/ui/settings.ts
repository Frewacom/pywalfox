const settingCardHeaders = document.querySelectorAll('.setting-card-header');
const colorButtons = document.querySelectorAll('button[data-color]');

const colorpicker = document.getElementById('colorpicker');

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
  toggleOpen(<HTMLElement>header.parentNode);
}

function onColorClicked(e: Event) {
  const target = e.target;
  const dialogOpen = isOpen(colorpicker);
  if (dialogOpen) {
  } else {
    open(colorpicker);
  }
}

settingCardHeaders.forEach((header) => {
  header.addEventListener('click', () => onSettingCardClicked(header));
});

colorButtons.forEach((button) => {
  button.addEventListener('click', onColorClicked);
});
