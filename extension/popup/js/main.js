// Main settings page
const versionLabel = document.getElementById('version');
const restartBanner = document.getElementById('banner');
const updateButton = document.getElementById('update');
const resetButton = document.getElementById('reset');
const outputToggle = document.getElementById('output-toggle');
const outputArea = document.getElementById('output');

// Custom theme template
const customTemplateEditButton = document.getElementById('custom-template-edit-button');
const customTemplateContainer = document.getElementById('custom-template-container');

// Colorpicker dialog
const colorpickerDialogOverlay = document.getElementById('overlay');
const colorpickerDialog = document.getElementById('colorpicker-dialog');
const colorpickerDialogInput = document.getElementById('colorpicker-dialog-input');
const colorpickerDialogInputContainer = document.getElementById('colorpicker-dialog-input-container');
const colorpickerDialogDiscard = document.getElementById('colorpicker-dialog-discard');

const toggleButtons = Array.from(document.getElementsByClassName('toggle'));
const colorPreviews = Array.from(document.getElementsByClassName('colorpicker-dialog-open'));
const pywalColorPreviews = Array.from(document.getElementsByClassName('pywal-color'));

var restartBannerTimeout = null;
var currentDialogTarget = undefined;
var currentDialogEditColor = undefined;
var currentDialogSelectedColor = undefined;
var currentDialogHighlightedColorPreview = undefined;
var currentDialogResetColor = undefined;

// Notification-like message
function showBanner(message) {
    if (restartBannerTimeout === null) {
        banner.innerText = message;
        banner.classList.add('show');
        restartBannerTimeout = setTimeout(() => {
            banner.classList.remove('show');
            restartBannerTimeout = null;
        }, 3000);
    }
}

// Print message to the debugging output
function output(message) {
    outputArea.value += message + '\n';
    outputArea.scrollTop = outputArea.scrollHeight; // Scrolls to bottom of textarea
}

async function toggleOption(e) {
    const action = e.target.getAttribute('data-action');
    const state = await browser.storage.local.get(action);
    let updatedValue = state[action] ? false : true;

    if (action === 'customCssEnabled' || action === 'noScrollbarEnabled') {
        showBanner('Restart needed for custom CSS to take effect!');
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

function showDialogOverlay() {
    colorpickerDialogOverlay.style.display = 'flex';
}

function hideDialogOverlay() {
    colorpickerDialogOverlay.style.display = 'none';
}

function highlightCurrentColorInDialog(currentColor) {
    let foundKey = undefined;
    const keysToSearch = [
        'background',
        'backgroundLight',
        'color0',
        'color1',
        'color2',
        'color3',
        'color4',
        'color5',
        'color6',
        'color7'
    ];

    for (const key of keysToSearch) {
        if (pywalColors[key] === currentColor && key !== 'text') {
            foundKey = key;
        }
    }

    if (foundKey) {
        const colorPreviewElement = document.querySelector(`.pywal-color[data-id=${foundKey}]`);
        if (colorPreviewElement) {
            colorPreviewElement.classList.add('selected');
            currentDialogHighlightedColorPreview = colorPreviewElement;
        } else {
            console.log('Could not find and highlight current selected color preview');
        }
    } else {
        colorpickerDialogInputContainer.classList.add('selected');
        currentDialogHighlightedColorPreview = colorpickerDialogInputContainer;
    }
}

function setCurrentHighlightedColorInDialog(newTarget) {
    currentDialogHighlightedColorPreview.classList.remove('selected');
    newTarget.classList.add('selected');
    currentDialogHighlightedColorPreview = newTarget;
}

function openColorpickerDialog(e) {
    const targetColor = e.target.getAttribute('data-color-key');
    const currentColor = currentExtensionColors[targetColor];

    if (currentDialogTarget === undefined) {
        colorpickerDialog.style.display = 'flex';
    } else {
        currentDialogTarget.classList.remove('selected');
    }

    showDialogOverlay();

    currentDialogTarget = e.target;
    currentDialogEditColor = targetColor;
    currentDialogResetColor = currentColor;

    if (currentDialogHighlightedColorPreview) {
        currentDialogHighlightedColorPreview.classList.remove('selected');
    }

    highlightCurrentColorInDialog(currentColor);
    currentDialogTarget.classList.add('selected');
    colorpickerDialogInput.setAttribute('data-color', targetColor);
    colorpickerDialogInput.value = currentColor;
}

function closeDialog(dialog) {
    currentDialogHighlightedColorPreview.classList.remove('selected');
    currentDialogTarget.classList.remove('selected');
    currentDialogTarget = undefined;
    currentDialogEditColor = undefined;
    currentDialogResetColor = undefined;
    currentDialogSelectedColor = undefined;
    hideDialogOverlay();
    dialog.style.display = 'none';
}

function onSetPywalColorAsCustomColor(e) {
    const newColor = getPywalColorById(e.target.getAttribute('data-id'));
    currentDialogSelectedColor = newColor;
    colorpickerDialogInput.value = newColor;
    setCurrentHighlightedColorInDialog(e.target);
    setCustomColor(currentDialogEditColor, newColor, false);
}

function onCustomColorInputChanged(e) {
    const newColor = e.target.value;
    currentDialogSelectedColor = newColor;
    setCurrentHighlightedColorInDialog(colorpickerDialogInputContainer);
    setCustomColor(currentDialogEditColor, newColor, false);
}

function hasADifferentColorBeenChosen() {
    if (currentDialogSelectedColor !== undefined && currentDialogSelectedColor !== currentDialogResetColor) {
        return true;
    }

    return false;
}

async function onColorpickerDialogClose(e) {
    if (hasADifferentColorBeenChosen()) {
        const state = await browser.storage.local.get('pywalColors');
        pywalColors = state.pywalColors;
        sendMessageToTabs({ action: 'updateDDGTheme' });
    }

    closeDialog(colorpickerDialog);
}

function onColorpickerDialogDiscard(e) {
    if (hasADifferentColorBeenChosen()) {
        currentDialogHighlightedColorPreview.classList.remove('selected');
        highlightCurrentColorInDialog(currentDialogResetColor);
        setCustomColor(currentDialogEditColor, currentDialogResetColor, false);
    }
}

function setPywalColorPreviews() {
    pywalColorPreviews.forEach((preview) => {
        const id = preview.getAttribute('data-id');
        preview.style.backgroundColor = getPywalColorById(id);
        preview.addEventListener('click', onSetPywalColorAsCustomColor);
    });
}

function updateInterface(colors) {
    // Set the default values for the color pickers
    colorPreviews.forEach((preview) => {
        preview.style.backgroundColor = colors[preview.getAttribute('data-color-key')];
    });

    // Update the background color of previews in the color picker
    setPywalColorPreviews();

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
}


updateButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'update' });
});

resetButton.addEventListener('click', async () => {
    loadExtension().then(updateInterface);
    browser.runtime.sendMessage({ action: 'reset' });
});

outputToggle.addEventListener('click', () => {
    document.body.classList.toggle('output-open');
    if (outputToggle.innerText === 'Show debugging output') {
        outputToggle.innerText = 'Hide debugging output';
    } else {
        outputToggle.innerText = 'Show debugging output';
    }
});

customTemplateEditButton.addEventListener('click', () => {
    window.location = 'template.html';
});

toggleButtons.forEach((toggleButton) => {
    toggleButton.addEventListener('click', toggleOption);
});

colorPreviews.forEach((preview) => {
    preview.addEventListener('click', openColorpickerDialog);
});

colorpickerDialogInput.addEventListener('change', onCustomColorInputChanged);
colorpickerDialogOverlay.addEventListener('click', onColorpickerDialogClose);
colorpickerDialogDiscard.addEventListener('click', onColorpickerDialogDiscard);

// Listen for messages from background script
browser.runtime.onMessage.addListener((response) => {
    if (response.action == 'output') {
        output(response.message);
    }
});

setVersionLabel(versionLabel);
setupListeners(updateInterface);

