const versionLabel = document.getElementById('version');
const banner = document.getElementById('banner');
const palette = document.getElementById('palette');
const noPalette = document.getElementById('no-palette');
const colorPreviews = Array.from(document.getElementsByClassName('palette-color-preview'));
const templateColors = Array.from(document.getElementsByClassName('template-color'));
const templateSaveButton = document.getElementById('template-save-button');
const templateResetButton = document.getElementById('template-reset-button');

function handleTemplateColorChange(e) {
  const color = e.target.value;
  templateSaveButton.disabled = e.target.checkValidity() ? false : true;
}

function setSelectedTemplateColors(template) {
  templateColors.forEach((element) => {
    const target = element.getAttribute('data-target');
    element.value = template[target];
    element.addEventListener('input', handleTemplateColorChange);
  });
}

async function updateInterface(colors) {
  const isApplied = await isThemeApplied();
  if (isApplied) {
    palette.style.display = 'flex';
    noPalette.style.display = 'none';
    colorPreviews.forEach((preview) => {
      setColorPreviewBackground(preview);
    });
  } else {
    palette.style.display = 'none';
    noPalette.style.display = 'block';
  }
}

async function fetchSelectedTemplateColors() {
  const state = await browser.storage.local.get('customTemplate');
  console.log(state);
  let template = DEFAULT_THEME_TEMPLATE;

  if (state.hasOwnProperty('customTemplate')) {
    template = state.customTemplate;
  }

  setSelectedTemplateColors(template);
}

templateSaveButton.addEventListener('click', () => {
  let template = {};
  templateColors.forEach((element) => {
    if (element.checkValidity()) {
      template[element.getAttribute('data-target')] = Number(element.value);
      showBanner(banner, 'Template was saved successfully');
    } else {
      // Should never happen, since we check this in setSelectedTemplateColors
      showBanner(banner, 'The template contains invalid indexes. Template was not saved')
      return;
    }
  });

  browser.storage.local.set({ customTemplate: template });
});

templateResetButton.addEventListener('click', () => {
  browser.storage.local.remove('customTemplate');
  setSelectedTemplateColors(DEFAULT_THEME_TEMPLATE);
  showBanner(banner, 'Template was reset');
});

setVersionLabel(versionLabel);
setupListeners(updateInterface);
fetchSelectedTemplateColors();
