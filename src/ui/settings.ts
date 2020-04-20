const settingCardHeaders = Array.from(document.getElementsByClassName('setting-card-header'));

function onSettingCardClick(header) {
  const card = header.parentNode;
  const isOpen = card.getAttribute('open');
  isOpen === '' ? card.removeAttribute('open') : card.setAttribute('open', '');
}

settingCardHeaders.forEach((header) => {
  header.addEventListener('click', () => onSettingCardClick(header));
});
