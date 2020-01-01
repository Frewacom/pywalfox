const DEFAULT_BACKGROUND = '#000000';
const DEFAULT_FOREGROUND = '#ffffff';
const DEFAULT_BACKGROUND_LIGHT = '#222222';

const restartBanner = document.getElementById('banner');
const updateButton = document.getElementById('update');
const resetButton = document.getElementById('reset');
const outputArea = document.getElementById('output');

const cssButtons = Array.from(document.getElementsByClassName('css-btn'));
const colorpickers = Array.from(document.getElementsByClassName('colorpicker'));

var restartBannerTimeout = null;

function getExtensionColorsFromTheme(theme) {
    return {
        background: theme.colors ? theme.colors.frame : DEFAULT_BACKGROUND,
        foreground: theme.colors ? theme.colors.tab_selected : DEFAULT_FOREGROUND,
        backgroundLight: theme.colors ? theme.colors.button_background_hover : DEFAULT_BACKGROUND_LIGHT
    };
}

function setExtensionTheme(extensionColors) {
    document.documentElement.style.setProperty('--background', extensionColors.background);
    document.documentElement.style.setProperty('--background-light', extensionColors.backgroundLight);
    document.documentElement.style.setProperty('--foreground', extensionColors.foreground);
}

function showRestartBanner() {
    if (restartBannerTimeout === null) {
        banner.classList.add('show');
        restartBannerTimeout = setTimeout(() => {
            banner.classList.remove('show');
            restartBannerTimeout = null;
        }, 3000);
    }
}

function output(message) {
    outputArea.value += message + '\n';
}

// Sends action to background script to disable/enable custom CSS
function doCustomCssAction(e) {
    showRestartBanner();
    browser.runtime.sendMessage({ action: e.target.getAttribute('data-action') });
}

function onCustomColorChanged(e) {
    browser.runtime.sendMessage({
        action: 'customColor',
        type: e.target.getAttribute('data-action'),
        value: e.target.value
    });
}

updateButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'update' });
});

resetButton.addEventListener('click', () => {
    updateExtensionTheme();
    browser.runtime.sendMessage({ action: 'reset' });
});

cssButtons.forEach((cssButton) => {
    cssButton.addEventListener('click', doCustomCssAction);
});

colorpickers.forEach((colorpicker) => {
    colorpicker.addEventListener('change', onCustomColorChanged);
});

// Watch for theme updates
browser.theme.onUpdated.addListener(async ({ theme, windowId }) => {
    const sidebarWindow = await browser.windows.getCurrent();
    if (!windowId || windowId == sidebarWindow.id) {
        output('Theme was updated');
        updateExtensionTheme();
    }
});

// Listen for messages from background script
browser.runtime.onMessage.addListener((response) => {
    if (response.action == 'output') {
        output(response.message);
    }
});

// Sets the theme of the extension to match the one in the browser
async function updateExtensionTheme() {
    const theme = await browser.theme.getCurrent();
    const colors = getExtensionColorsFromTheme(theme);
    setExtensionTheme(colors);

    // Set the default values for the color pickers
    colorpickers.forEach((colorpicker) => {
        colorpicker.value = colors[colorpicker.getAttribute('data-action')];
    });
}

// Update the colors of the extension to match the theme
updateExtensionTheme();

