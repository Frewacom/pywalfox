const DEFAULT_BACKGROUND = '#000000';
const DEFAULT_FOREGROUND = '#ffffff';
const DEFAULT_BACKGROUND_LIGHT = '#222222';
const DEFAULT_ACCENT_PRIMARY = '#222222';
const DEFAULT_ACCENT_SECONDARY = '#222222';

const versionLabel = document.getElementById('version');
const restartBanner = document.getElementById('banner');
const updateButton = document.getElementById('update');
const resetButton = document.getElementById('reset');
const outputArea = document.getElementById('output');

const toggleButtons = Array.from(document.getElementsByClassName('toggle'));
const colorpickers = Array.from(document.getElementsByClassName('colorpicker'));

var restartBannerTimeout = null;

function getExtensionColorsFromTheme(theme) {
    return {
        background: theme.colors ? theme.colors.frame : DEFAULT_BACKGROUND,
        foreground: theme.colors ? theme.colors.tab_selected : DEFAULT_FOREGROUND,
        backgroundLight: theme.colors ? theme.colors.button_background_hover : DEFAULT_BACKGROUND_LIGHT,
        accentPrimary: theme.colors ? theme.colors.tab_loading : DEFAULT_ACCENT_PRIMARY,
        accentSecondary: theme.colors ? theme.colors.popup_highlight : DEFAULT_ACCENT_SECONDARY
    };
}

function setExtensionTheme(extensionColors) {
    document.documentElement.style.setProperty('--background', extensionColors.background);
    document.documentElement.style.setProperty('--background-light', extensionColors.backgroundLight);
    document.documentElement.style.setProperty('--foreground', extensionColors.foreground);
    document.documentElement.style.setProperty('--accent-primary', extensionColors.accentPrimary);
    document.documentElement.style.setProperty('--accent-secondary', extensionColors.accentSecondary);
}

function showBanner(message) {
    if (restartBannerTimeout === null) {
        banner.innerHTML = message;
        banner.classList.add('show');
        restartBannerTimeout = setTimeout(() => {
            banner.classList.remove('show');
            restartBannerTimeout = null;
        }, 3000);
    }
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
        if (updatedValue == false) { showBanner('Select a random theme in DuckDuckGo settings to fully disable!'); }
        sendMessageToTabs({ action: action, enabled: updatedValue });
    }

    browser.storage.local.set({ [action]: updatedValue });

    e.target.innerHTML = updatedValue ? 'On' : 'Off';
    e.target.classList.toggle('enabled');
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
    onExtensionLoad();
    browser.runtime.sendMessage({ action: 'reset' });
});

toggleButtons.forEach((toggleButton) => {
    toggleButton.addEventListener('click', toggleOption);
});

colorpickers.forEach((colorpicker) => {
    colorpicker.addEventListener('change', onCustomColorChanged);
});

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
    setExtensionTheme(colors);

    // Set the default values for the color pickers
    colorpickers.forEach((colorpicker) => {
        colorpicker.value = colors[colorpicker.getAttribute('data-action')];
    });

    toggleButtons.forEach(async (toggleButton) => {
        const action = toggleButton.getAttribute('data-action');
        const state = await browser.storage.local.get(action);
        if (state[action] == true) {
            toggleButton.classList.add('enabled');
            toggleButton.innerHTML = 'On';
        }
    });
}

// Updates extension colors, updates the current value of settings, etc
onExtensionLoad();

versionLabel.innerHTML = `v${browser.runtime.getManifest().version}`;



