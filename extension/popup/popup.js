const DEFAULT_BACKGROUND = '#000000';
const DEFAULT_FOREGROUND = '#ffffff';
const DEFAULT_BACKGROUND_LIGHT = '#222222';

const updateButton = document.getElementById('update');
const resetButton = document.getElementById('reset');
const enableCssButton = document.getElementById('enableCustomCss');
const disableCssButton = document.getElementById('disableCustomCss');
const outputArea = document.getElementById('output');
const enableNoScrollbar = document.getElementById('enableNoScrollbar');
const disableNoScrollbar = document.getElementById('disableNoScrollbar');
const colorpickers = Array.from(document.getElementsByClassName('colorpicker'));

function getExtensionColorsFromTheme(theme) {
    if (theme.colors) {
        return {
            background: theme.colors.frame,
            foreground: theme.colors.tab_selected,
            backgroundLight: theme.colors.button_background_hover
        };
    }

    return {
        background: DEFAULT_BACKGROUND,
        foreground: DEFAULT_FOREGROUND,
        backgroundLight: DEFAULT_BACKGROUND_LIGHT
    };
}

function setExtensionTheme(colors) {
    document.documentElement.style.setProperty('--background', colors.background);
    document.documentElement.style.setProperty('--background-light', colors.backgroundLight);
    document.documentElement.style.setProperty('--foreground', colors.foreground);
}

function output(message) {
    outputArea.value += message + '\n';
}

// Sends action to background script to disable/enable custom CSS
function doCustomCssAction(action) {
    browser.runtime.sendMessage({ action })
    output('Restart is required for custom CSS to take effect.');
}

function onCustomColorChanged(e) {
    console.log('asdasd');
    browser.runtime.sendMessage({
        action: 'customColor',
        type: e.target.getAttribute('data-type'),
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

enableCssButton.addEventListener('click', () => {
    doCustomCssAction('enableCustomCss');
});

disableCssButton.addEventListener('click', () => {
    doCustomCssAction('disableCustomCss');
});

enableNoScrollbar.addEventListener('click', () => {
    doCustomCssAction('enableNoScrollbar');
});

disableNoScrollbar.addEventListener('click', () => {
    doCustomCssAction('disableNoScrollbar');
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
        colorpicker.value = colors[colorpicker.getAttribute('data-type')];
    });
}

// Update the colors of the extension to match the theme
updateExtensionTheme();


