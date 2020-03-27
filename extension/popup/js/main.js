// Main settings page
const versionLabel = document.getElementById('version');
const banner = document.getElementById('banner');
const updateButton = document.getElementById('update');
const resetButton = document.getElementById('reset');
const outputToggle = document.getElementById('output-toggle');
const outputArea = document.getElementById('output');

// Custom theme template
const customTemplateEditButton = document.getElementById('custom-template-edit-button');
const customTemplateContainer = document.getElementById('custom-template-container');

// Colorpicker dialog
const colorpicker = document.getElementById('colorpicker-dialog');
const colorpickerOverlay = document.getElementById('overlay');
const colorpickerCustomInput = document.getElementById('colorpicker-dialog-input');
const colorpickerCustomContainer = document.getElementById('colorpicker-dialog-input-container');
const colorpickerUndoButton = document.getElementById('colorpicker-dialog-discard');

const toggleButtons = Array.from(document.getElementsByClassName('toggle'));
const colorPreviews = Array.from(document.getElementsByClassName('colorpicker-dialog-open'));
const paletteColors = Array.from(document.getElementsByClassName('pywal-color'));

var selectedPreviewButton = undefined;
var selectedPaletteColor = undefined;

// Listen for messages from background script
browser.runtime.onMessage.addListener((response) => {
  if (response.action == 'output') {
    output(response.message);
  }
});

// Toggles options like custom CSS, DuckDuckGo-theme, etc and saves it to local storage
async function toggleOption(e) {
  const action = e.target.getAttribute('data-action');
  const state = await browser.storage.local.get(action);
  const updatedValue = state[action] ? false : true;

  if (action === 'customCssEnabled' || action === 'noScrollbarEnabled') {
    showBanner(banner, 'Restart needed for custom CSS to take effect!');
    browser.runtime.sendMessage({ action: action, enabled: updatedValue });
  } else if (action === 'ddgThemeEnabled') {
    sendMessageToTabs({ action: action, enabled: updatedValue });
  } else if (action === 'customTemplateEnabled') {
    if (updatedValue) {
      customTemplateContainer.classList.add('show');
    } else {
      customTemplateContainer.classList.remove('show');
    }
  }

  browser.storage.local.set({ [action]: updatedValue });

  e.target.innerText = updatedValue ? 'Yes' : 'No';
  e.target.classList.toggle('enabled');
}

// Hide/show the debugging output textarea
function toggleOutput() {
  document.body.classList.toggle('output-open');
  if (outputToggle.innerText === 'Show debugging output') {
    outputToggle.innerText = 'Hide debugging output';
  } else {
    outputToggle.innerText = 'Show debugging output';
  }
}

// Print message to the debugging output
function output(message) {
  outputArea.value += message + '\n';
  outputArea.scrollTop = outputArea.scrollHeight; // Scrolls to bottom of textarea
}

// Retreives the index of a color in the pywal palette
function getColorIndexFromPalette(color) {
  for (let key = 0; key < PYWAL_PALETTE_LENGTH; key++) {
    if (pywalColors[key] == color) {
      return key;
    }
  }

  return 'custom';
}

// Checks if the selected color in the colorpicker is different from the current color
// We need to check this because we don't want to update the theme for no reason
function colorHasChanged() {
  const selectedId = selectedPreviewButton.getAttribute('data-selected-id');
  const resetId = selectedPreviewButton.getAttribute('data-reset-id');
  return (selectedId !== null && selectedId !== resetId);
}

// Find and highlight a color in the colorpicker based on the currently selected index in the palette
function setInitialPaletteColor(selectedId) {
  if (selectedId == 'custom') {
    colorpickerCustomContainer.classList.add('selected');
    selectedPaletteColor = colorpickerCustomContainer;
  } else {
    const paletteColors = document.querySelector(`.pywal-color[data-id="${selectedId}"]`);
    if (paletteColors) {
      paletteColors.classList.add('selected');
      selectedPaletteColor = paletteColors;
    } else {
      console.log('Could not find and highlight current selected color preview');
    }
  }
}

// Updates the currently highlighted color in the colorpicker
function setSelectedPaletteColor(element) {
  selectedPaletteColor.classList.remove('selected');
  element.classList.add('selected');
  selectedPaletteColor = element;
}

function setPreviewBackground(newColor) {
  selectedPreviewButton.style.background = newColor;
}

// When one of the color preview buttons are pressed
function openColorpicker(e) {
  const colorKey = e.target.getAttribute('data-color-key');
  const targetKey = e.target.getAttribute('data-target-key');
  const selectedId = e.target.getAttribute('data-selected-id');
  const currentColor = currentExtensionColors[colorKey];

  if (selectedPreviewButton === undefined) {
    // The colorpicker is not open, so show it
    colorpicker.style.display = 'flex';
    colorpickerOverlay.style.display = 'flex';
  } else {
    // The colorpicker is already open, unselect the previous preview button
    selectedPreviewButton.classList.remove('selected');
  }

  if (selectedPaletteColor !== undefined) {
    selectedPaletteColor.classList.remove('selected');
  }

  e.target.setAttribute('data-reset-id', selectedId);
  e.target.classList.add('selected');
  selectedPreviewButton = e.target;

  colorpickerCustomInput.value = currentColor;
  colorpickerCustomInput.setAttribute('data-color', currentColor);

  setInitialPaletteColor(selectedId);
}

async function onPaletteColorChanged(e) {
  if (isThemeApplied) {
    const newId = e.target.getAttribute('data-id');
    const newColor = getPaletteColorById(newId);
    const colorKey = selectedPreviewButton.getAttribute('data-target-key');

    colorpickerCustomInput.value = newColor;
    selectedPreviewButton.setAttribute('data-selected-id', newId);

    setSelectedPaletteColor(e.target);
    setPreviewBackground(newColor);
    setCustomColor(colorKey, newColor, false);
  }
}

function onCustomColorChanged(e) {
  const newColor = e.target.value;
  const colorKey = selectedPreviewButton.getAttribute('data-target-key');
  setSelectedPaletteColor(colorpickerCustomContainer);
  setPreviewBackground(newColor);
  setCustomColor(colorKey, newColor, false);
}

function onColorpickerUndo(e) {
  if (colorHasChanged()) {
    const colorKey = selectedPreviewButton.getAttribute('data-color-key');
    const resetColor = selectedPreviewButton.getAttribute('data-reset-id');

    selectedPaletteColor.classList.remove('selected');
    setInitialPaletteColor(resetColor);
    setCustomColor(colorKey, resetColor, false);
  }
}

function closeColorpicker(colorpicker) {
  colorpicker.style.display = 'none';
  colorpickerOverlay.style.display = 'none';

  selectedPreviewButton.classList.remove('selected');
  selectedPaletteColor.classList.remove('selected');

  selectedPreviewButton = undefined;
  resetColor = undefined;
}

async function onColorpickerClose(e) {
  const hasChanged = colorHasChanged();
  const state = await browser.storage.local.get('ddgThemeEnabled');

  if (hasChanged && state.ddgThemeEnabled === true) {
    const state = await browser.storage.local.get('pywalColors');
    pywalColors = state.pywalColors;
    sendMessageToTabs({ action: 'updateDDGTheme' });
  }

  closeColorpicker(colorpicker);
}

async function updateInterface(colors) {
  colorPreviews.forEach((preview) => {
    const colorKey = preview.getAttribute('data-color-key');
    const color = colors[colorKey];
    const id = getColorIndexFromPalette(color);

    preview.setAttribute('data-selected-id', id);
    preview.style.backgroundColor = colors[preview.getAttribute('data-color-key')];

    if (selectedPreviewButton !== undefined && !colorHasChanged()) {
      preview.setAttribute('data-reset-id', id);
    }
  });

  toggleButtons.forEach(async (toggleButton) => {
    const action = toggleButton.getAttribute('data-action');
    const state = await browser.storage.local.get(action);
    if (state[action] === true) {
      toggleButton.classList.add('enabled');
      toggleButton.innerText = 'Yes';

      // Show the Edit template button
      if (action === 'customTemplateEnabled') {
        customTemplateContainer.classList.add('show')
      }
    }
  });

  paletteColors.forEach((color) => {
    setPaletteColor(color);
    color.addEventListener('click', onPaletteColorChanged);
  });

  if (selectedPreviewButton !== undefined) {
    selectedPaletteColor.classList.remove('selected');
    setInitialPaletteColor(selectedPreviewButton.getAttribute('data-selected-id'));
  }
}

// Setup event listeners for buttons and inputs
function initialize() {
  outputToggle.addEventListener('click', toggleOutput);
  colorpickerCustomInput.addEventListener('change', onCustomColorChanged);
  colorpickerOverlay.addEventListener('click', onColorpickerClose);
  colorpickerUndoButton.addEventListener('click', onColorpickerUndo);
  colorPreviews.forEach((elem) => { elem.addEventListener('click', openColorpicker) });
  toggleButtons.forEach((elem) => { elem.addEventListener('click', toggleOption) });
  customTemplateEditButton.addEventListener('click', () => { window.location = 'template.html' });

  setVersionLabel(versionLabel);
  setupListeners(updateInterface);
}

initialize();

