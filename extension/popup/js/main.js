const versionLabel = document.getElementById('version');
const banner = document.getElementById('banner');
const updateButton = document.getElementById('update');
const resetButton = document.getElementById('reset');
const outputToggle = document.getElementById('output-toggle');
const outputArea = document.getElementById('output');

const customTemplateEditButton = document.getElementById('custom-template-edit-button');
const customTemplateContainer = document.getElementById('custom-template-container');

const colorpicker = document.getElementById('colorpicker-dialog');
const colorpickerOverlay = document.getElementById('overlay');
const colorpickerCustomInput = document.getElementById('colorpicker-dialog-input');
const colorpickerCustomContainer = document.getElementById('colorpicker-dialog-input-container');
const colorpickerUndoButton = document.getElementById('colorpicker-dialog-discard');

const toggleButtons = Array.from(document.getElementsByClassName('toggle'));
const colorPreviews = Array.from(document.getElementsByClassName('colorpicker-dialog-open'));
const paletteColors = Array.from(document.getElementsByClassName('pywal-color'));

var selectedColorButton = undefined;
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
  const target = e.target.getAttribute('data-target');
  const state = await browser.storage.local.get(target);
  const updatedValue = state[target] ? false : true;

  if (action === 'toggleCustomCss') {
    showBanner(banner, 'Restart needed for custom CSS to take effect!');
    browser.runtime.sendMessage({ action, target, enabled: updatedValue });
  } else if (action === 'toggleDDGTheme') {
    sendMessageToTabs({ action: target, enabled: updatedValue });
  } else if (action === 'toggleCustomTemplate') {
    if (updatedValue) {
      customTemplateContainer.classList.add('show');
    } else {
      customTemplateContainer.classList.remove('show');
    }
  }

  browser.storage.local.set({ [target]: updatedValue });

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
  const selectedId = selectedColorButton.getAttribute('data-selected-id');
  const resetId = selectedColorButton.getAttribute('data-reset-id');
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
  selectedColorButton.style.background = newColor;
}

// When one of the color preview buttons are pressed
function openColorpicker(e) {
  const colorKey = e.target.getAttribute('data-color-key');
  const targetKey = e.target.getAttribute('data-target-key');
  const selectedId = e.target.getAttribute('data-selected-id');
  const currentColor = currentExtensionColors[colorKey];

  if (selectedColorButton === undefined) {
    // The colorpicker is not open, so show it
    colorpicker.style.display = 'flex';
    colorpickerOverlay.style.display = 'flex';
  } else {
    // The colorpicker is already open, unselect the previous preview button
    selectedColorButton.classList.remove('selected');
  }

  selectedColorButton = e.target;

  if (selectedPaletteColor !== undefined) {
    selectedPaletteColor.classList.remove('selected');
  }

  selectedColorButton.setAttribute('data-reset-id', selectedId);
  selectedColorButton.classList.add('selected');

  if (selectedId == 'custom') {
    selectedColorButton.setAttribute('data-reset-custom-color', selectedColorButton.style.backgroundColor);
  }

  colorpickerCustomInput.value = currentColor;
  colorpickerCustomInput.setAttribute('data-color', currentColor);

  setInitialPaletteColor(selectedId);
}

async function onPaletteColorChanged(e) {
  if (isThemeApplied) {
    const newId = e.target.getAttribute('data-id');
    const newColor = getPaletteColorById(newId);
    const targetKey = selectedColorButton.getAttribute('data-target-key');

    colorpickerCustomInput.value = newColor;
    selectedColorButton.setAttribute('data-selected-id', newId);

    setSelectedPaletteColor(e.target);
    setPreviewBackground(newColor);
    setCustomColor(targetKey, newColor, false);
  }
}

function onCustomColorChanged(e) {
  const newColor = e.target.value;
  const targetKey = selectedColorButton.getAttribute('data-target-key');
  setSelectedPaletteColor(colorpickerCustomContainer);
  setPreviewBackground(newColor);
  setCustomColor(targetKey, newColor, false);
}

function onColorpickerUndo(e) {
  if (colorHasChanged()) {
    const targetKey = selectedColorButton.getAttribute('data-target-key');
    const resetId = selectedColorButton.getAttribute('data-reset-id');
    let color;

    // We store custom colors differently than colors from the palette
    if (resetId == 'custom') {
      color = selectedColorButton.getAttribute('data-reset-custom-color');
    } else {
      color = getPaletteColorById(resetId);
    }

    setCustomColor(targetKey, color, false);
    selectedPaletteColor.classList.remove('selected');
    setInitialPaletteColor(resetId);
  }
}

function closeColorpicker(colorpicker) {
  colorpicker.style.display = 'none';
  colorpickerOverlay.style.display = 'none';

  selectedColorButton.classList.remove('selected');
  selectedPaletteColor.classList.remove('selected');

  selectedColorButton = undefined;
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

    if (selectedColorButton !== undefined && !colorHasChanged()) {
      preview.setAttribute('data-reset-id', id);
    }
  });

  toggleButtons.forEach(async (toggleButton) => {
    const target = toggleButton.getAttribute('data-target');
    const state = await browser.storage.local.get(target);
    if (state[target] === true) {
      toggleButton.classList.add('enabled');
      toggleButton.innerText = 'Yes';

      // Show the Edit template button
      if (target === 'customTemplateEnabled') {
        customTemplateContainer.classList.add('show')
      }
    }
  });

  paletteColors.forEach((color) => {
    setPaletteColor(color);
    color.addEventListener('click', onPaletteColorChanged);
  });

  if (selectedColorButton !== undefined) {
    selectedPaletteColor.classList.remove('selected');
    setInitialPaletteColor(selectedColorButton.getAttribute('data-selected-id'));
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

