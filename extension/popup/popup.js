const DEFAULT_BACKGROUND = '#000000';
const DEFAULT_FOREGROUND = '#ffffff';
const DEFAULT_BACKGROUND_LIGHT = '#222222';
const DEFAULT_ACCENT_PRIMARY = '#222222';
const DEFAULT_ACCENT_SECONDARY = '#222222';
const DEFAULT_TEXT = '#ffffff';

const versionLabel = document.getElementById('version');
const restartBanner = document.getElementById('banner');
const updateButton = document.getElementById('update');
const resetButton = document.getElementById('reset');
const outputArea = document.getElementById('output');
const modalContainer = document.getElementById('modal-container');

// Colorpicker modal
const colorpickerModal = document.getElementById('cp-modal');
const colorpickerModalTitle = document.getElementById('cp-modal-name');
const colorpickerModalCustom = document.getElementById('cp-modal-colorpicker');
const colorpickerModalSave = document.getElementById('cp-modal-save');
const colorpickerModalCancel = document.getElementById('cp-modal-cancel');

const toggleButtons = Array.from(document.getElementsByClassName('toggle'));
const colorPreviews = Array.from(document.getElementsByClassName('cp-modal-open'));
const pywalColorPreviews = Array.from(document.getElementsByClassName('pywal-color'));

var restartBannerTimeout = null;
var currentModalEditColor = undefined;
var currentModalResetColor = undefined;
var currentExtensionColors = {};
var pywalColors = {};

function getExtensionColorsFromTheme(theme) {
    return {
        background: theme.colors ? theme.colors.frame : DEFAULT_BACKGROUND,
        foreground: theme.colors ? theme.colors.tab_selected : DEFAULT_FOREGROUND,
        backgroundLight: theme.colors ? theme.colors.button_background_hover : DEFAULT_BACKGROUND_LIGHT,
        accentPrimary: theme.colors ? theme.colors.tab_loading : DEFAULT_ACCENT_PRIMARY,
        accentSecondary: theme.colors ? theme.colors.popup_highlight : DEFAULT_ACCENT_SECONDARY,
        text: theme.colors ? theme.colors.toolbar_field_text : DEFAULT_TEXT
    };
}

function setExtensionTheme(extensionColors) {
    document.documentElement.style.setProperty('--background', extensionColors.background);
    document.documentElement.style.setProperty('--background-light', extensionColors.backgroundLight);
    document.documentElement.style.setProperty('--foreground', extensionColors.foreground);
    document.documentElement.style.setProperty('--accent-primary', extensionColors.accentPrimary);
    document.documentElement.style.setProperty('--accent-secondary', extensionColors.accentSecondary);
    document.documentElement.style.setProperty('--text-color', extensionColors.text);
}

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

function getPywalColorById(id) {
    return pywalColors[id];
}

function output(message) {
    outputArea.value += message + '\n';
    outputArea.scrollTop = outputArea.scrollHeight; // Scrolls to bottom of textarea
}

async function sendMessageToTabs(data) {
    const tabs = await browser.tabs.query({});

    for (const tab of tabs) {
        browser.tabs.sendMessage(tab.id, data);
    }
}

// Sends action to background script to disable/enable custom CSS
async function toggleOption(e) {
    const action = e.target.getAttribute('data-action');
    const state = await browser.storage.local.get(action);
    let updatedValue = state[action] ? false : true;

    if (action == 'customCssEnabled' || action == 'noScrollbarEnabled') {
        showBanner('Restart needed for custom CSS to take effect!');
        browser.runtime.sendMessage({ action: action, enabled: updatedValue });
    } else if (action == 'ddgThemeEnabled') {
        sendMessageToTabs({ action: action, enabled: updatedValue });
    }

    browser.storage.local.set({ [action]: updatedValue });

    e.target.innerText = updatedValue ? 'On' : 'Off';
    e.target.classList.toggle('enabled');
}

function setCustomColor(colorKey, color, ddgReload = true) {
    browser.runtime.sendMessage({
        action: 'customColor',
        type: colorKey,
        value: color,
        ddgReload: ddgReload
    });
}

function openModalOverlay() {
    modalContainer.style.display = 'flex';
}

function closeModalOverlay() {
    modalContainer.style.display = 'none';
}

function openColorpickerModal(e) {
    const targetColor = e.target.getAttribute('data-color-key');
    const currentColor = currentExtensionColors[targetColor];
    console.log(currentColor);
    openModalOverlay();

    currentModalEditColor = targetColor;
    currentModalResetColor = currentColor;

    colorpickerModalTitle.innerText = targetColor;
    colorpickerModalCustom.setAttribute('data-color', targetColor);
    colorpickerModalCustom.value = currentColor;
    colorpickerModal.style.display = 'flex';
}

function closeModal(modal) {
    closeModalOverlay();
    currentModalEditColor = undefined;
    currentModalResetColor = undefined;
    modal.style.display = 'none';
}

function updateColorPreviewInColorpickerModal(newColor) {
    colorpickerModalCustom.value = newColor;
}

function onSetPywalColorAsCustomColor(e) {
    const newColor = getPywalColorById(e.target.getAttribute('data-id'));
    setCustomColor(currentModalEditColor, newColor, false);
    updateColorPreviewInColorpickerModal(newColor);
}

function onCustomColorInputChanged(e) {
    const newColor = e.target.value;
    setCustomColor(currentModalEditColor, newColor, false);
    updateColorPreviewInColorpickerModal(newColor);
}

async function onColorpickerModalSave(e) {
    const state = await browser.storage.local.get('pywalColors');
    pywalColors = state.pywalColors;
    sendMessageToTabs({ action: 'updateDDGTheme' });
    closeModal(colorpickerModal);
}

function onColorpickerModalCancel(e) {
    setCustomColor(currentModalEditColor, currentModalResetColor, false);
    closeModal(colorpickerModal);
}

updateButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'update' });
});

resetButton.addEventListener('click', () => {
    onExtensionLoad();
    browser.runtime.sendMessage({ action: 'reset' });
});

toggleButtons.forEach((toggleButton) => {
    toggleButton.addEventListener('click', toggleOption);
});

colorPreviews.forEach((preview) => {
    preview.addEventListener('click', openColorpickerModal);
});

colorpickerModalCustom.addEventListener('change', onCustomColorInputChanged);
colorpickerModalSave.addEventListener('click', onColorpickerModalSave);
colorpickerModalCancel.addEventListener('click', onColorpickerModalCancel);

// Watch for theme updates
browser.theme.onUpdated.addListener(async ({ theme, windowId }) => {
    const sidebarWindow = await browser.windows.getCurrent();
    if (!windowId || windowId == sidebarWindow.id) {
        output('Theme was updated');
        onExtensionLoad();
    }
});

// Listen for messages from background script
browser.runtime.onMessage.addListener((response) => {
    if (response.action == 'output') {
        output(response.message);
    }
});

// Sets the theme of the extension to match the one in the browser
async function onExtensionLoad() {
    const theme = await browser.theme.getCurrent();
    const colors = getExtensionColorsFromTheme(theme);
    const gettingPywalColors = await browser.storage.local.get('pywalColors');
    setExtensionTheme(colors);

    currentExtensionColors = colors;
    pywalColors = gettingPywalColors.pywalColors;
    console.log(pywalColors);

    // Set the default values for the color pickers
    colorPreviews.forEach((preview) => {
        preview.style.backgroundColor = colors[preview.getAttribute('data-color-key')];
    });

    toggleButtons.forEach(async (toggleButton) => {
        const action = toggleButton.getAttribute('data-action');
        const state = await browser.storage.local.get(action);
        if (state[action] == true) {
            toggleButton.classList.add('enabled');
            toggleButton.innerText = 'On';
        }
    });
}

// Updates extension colors, updates the current value of settings, etc
onExtensionLoad().then(() => {
    pywalColorPreviews.forEach((preview) => {
        const id = preview.getAttribute('data-id');
        preview.style.backgroundColor = getPywalColorById(id);
        preview.addEventListener('click', onSetPywalColorAsCustomColor);
    });
});

versionLabel.innerText = `v${browser.runtime.getManifest().version}`;



