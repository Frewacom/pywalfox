const updateButton = document.getElementById('update');
const resetButton = document.getElementById('reset');
const enableCssButton = document.getElementById('enableCustomCss');
const disableCssButton = document.getElementById('disableCustomCss');
const outputArea = document.getElementById('output');
const enableNoScrollbar = document.getElementById('enableNoScrollbar');
const disableNoScrollbar = document.getElementById('disableNoScrollbar');
const customColorBg = document.getElementById('customColorBg');
const customColorFg = document.getElementById('customColorFg');
const customColorBgLight = document.getElementById('customColorBgLight');

function setExtensionTheme(theme) {
    document.documentElement.style.setProperty('--background', theme.colors.frame);
    document.documentElement.style.setProperty('--background-light', theme.colors.button_background_hover);
    document.documentElement.style.setProperty('--foreground', theme.colors.tab_selected);
}

function output(message) {
    outputArea.value += message + '\n';
}

// Sends action to background script to disable/enable custom CSS
function doCustomCssAction(action) {
    browser.runtime.sendMessage({ action })
    output('Restart is required for custom CSS to take effect.');
}

function onCustomColorChanged(type, newValue) {
    browser.runtime.sendMessage({ action: 'customColor', type: type, value: newValue });
}

updateButton.addEventListener('click', () => {
    browser.runtime.sendMessage({action: 'update'})
});

resetButton.addEventListener('click', () => {
    output('Resetting to default theme.');
    browser.storage.local.set({ isApplied: false });

    // https://bugzilla.mozilla.org/show_bug.cgi?id=1415267
    // It is a known bug that the reset doesnt respect default theme
    browser.theme.reset();
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

customColorBg.addEventListener('change', (e) => onCustomColorChanged('background', e.target.value));
customColorFg.addEventListener('change', (e) => onCustomColorChanged('forground', e.target.value));
customColorBgLight.addEventListener('change', (e) => onCustomColorChanged('background-light', e.target.value));

// Watch for theme updates
browser.theme.onUpdated.addListener(async ({ theme, windowId }) => {
    const sidebarWindow = await browser.windows.getCurrent();
    /*
        Only update theme if it applies to the window the sidebar is in.
        If a windowId is passed during an update, it means that the theme is applied to that specific window.
        Otherwise, the theme is applied globally to all windows.
    */

    // browser.storage.local.set({ isApplied: false });

    console.log('theme saved');
    if (!windowId || windowId == sidebarWindow.id) {
        setExtensionTheme(theme);
    }
});

// Listen for messages from background script
browser.runtime.onMessage.addListener((response) => {
    if (response.action == 'output') {
        output(response.message);
    }
});

// Sets the theme of the extension to match the one in the browser
async function setInitialStyle() {
    const theme = await browser.theme.getCurrent();
    setExtensionTheme(theme);

    // Set the default values for the color pickers
    customColorBg.value = theme.colors.frame;
    customColorBgLight.value = theme.colors.button_background_hover;
    customColorFg.value = theme.colors.tab_selected;
}

// Update the colors of the extension to match the theme
setInitialStyle();


