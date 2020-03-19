// The keys in which custom colors will be stored
const CUSTOM_COLOR_KEYS = [
    'background',
    'foreground',
    'backgroundLight',
    'accentPrimary',
    'accentSecondary',
    'text'
];

const THEME_COLOR_KEYS = [
    'themeBackground',
    'themeForeground',
    'themeBackgroundLight',
    'themeAccentPrimary',
    'themeAccentSecondary',
    'themeText'
];

// On startup, connect to the "ping_pong" app.
const port = browser.runtime.connectNative("pywalfox");

var pywalColors = {};
var settingsPageTabId = null;
var settingsPageTabListener = null;

function createThemeFromColorscheme(colorscheme) {
    return {
        colors: {
            icons: colorscheme.accentPrimary,
            icons_attention: colorscheme.accentSecondary,
            frame: colorscheme.background,
            tab_text: colorscheme.background,
            tab_loading: colorscheme.accentPrimary,
            tab_background_text: colorscheme.text,
            tab_selected: colorscheme.foreground,
            tab_line: colorscheme.foreground,
            tab_background_separator: colorscheme.background,
            toolbar: colorscheme.background,
            toolbar_field: colorscheme.background,
            toolbar_field_focus: colorscheme.background,
            toolbar_field_text: colorscheme.text,
            toolbar_field_text_focus: colorscheme.text,
            toolbar_field_border: colorscheme.background,
            toolbar_field_border_focus: colorscheme.background,
            toolbar_field_separator: colorscheme.background,
            toolbar_field_highlight: colorscheme.accentPrimary,
            toolbar_field_highlight_text: colorscheme.text,
            toolbar_bottom_separator: colorscheme.background,
            toolbar_top_separator: colorscheme.background,
            toolbar_vertical_separator: colorscheme.backgroundLight,
            ntp_background: colorscheme.background,
            ntp_text: colorscheme.foreground,
            popup: colorscheme.background,
            popup_border: colorscheme.backgroundLight,
            popup_text: colorscheme.foreground,
            popup_highlight: colorscheme.accentSecondary,
            popup_highlight_text: colorscheme.text,
            sidebar: colorscheme.background,
            sidebar_border: colorscheme.backgroundLight,
            sidebar_text: colorscheme.foreground,
            sidebar_highlight: colorscheme.accentPrimary,
            sidebar_highlight_text: colorscheme.text,
            bookmark_text: colorscheme.text,
            button_background_hover: colorscheme.backgroundLight,
            button_background_active: colorscheme.backgroundLight,
        }
    };
}

function setState(storageKey, value) {
    browser.storage.local.set({
        [storageKey]: value
    });
}

function ifSet(value, fallback) {
    if (value) {
        return value;
    }

    return fallback;
}

// Save the colors of the current pywal theme so that they can be
// accessed from the duckduckgo script, for example
function saveThemeColors(colorscheme) {
    browser.storage.local.set({
        themeBackground: colorscheme.background,
        themeForeground: colorscheme.foreground,
        themeBackgroundLight: colorscheme.backgroundLight,
        themeAccentPrimary: colorscheme.accentPrimary,
        themeAccentSecondary: colorscheme.accentSecondary,
        themeText: colorscheme.text
    });
}

async function saveCustomColor(type, value) {
    setState(type, value);
    output(`Set custom color "${type}" to ${value}`);
}

async function getSavedCustomColors() {
    return await browser.storage.local.get(CUSTOM_COLOR_KEYS);
}

function resetCustomColors() {
    browser.storage.local.remove(CUSTOM_COLOR_KEYS);
}

function resetThemeColors() {
    browser.storage.local.remove(THEME_COLOR_KEYS);
}

async function createColorschemeFromPywal(colors) {
    const savedColors = await getSavedCustomColors();

    return {
        background: ifSet(savedColors.background, colors.background),
        foreground: ifSet(savedColors.foreground, colors.color15),
        accentPrimary: ifSet(savedColors.accentPrimary, colors.color1),
        accentSecondary: ifSet(savedColors.accentSecondary, colors.color2),
        text: ifSet(savedColors.text, colors.text),
        backgroundLight: ifSet(savedColors.backgroundLight, colors.backgroundLight),
    };
}

async function setTheme(colors, ddgReload) {
    const colorscheme = await createColorschemeFromPywal(colors);
    const theme = createThemeFromColorscheme(colorscheme);

    await saveThemeColors(colorscheme);
    pywalColors = colors;

    browser.theme.update(theme);
    browser.storage.local.set({ isApplied: true, pywalColors });

    // We dont want to reload DuckDuckGo if we are just trying out different
    // colors using the color picker
    if (ddgReload) {
        sendMessageToTabs({ action: 'updateDDGTheme' });
    }
}

async function sendMessageToTabs(data) {
    const tabs = await browser.tabs.query({});

    for (const tab of tabs) {
        browser.tabs.sendMessage(tab.id, data);
    }
}

function setStateOnSuccess(response, storageKey, value) {
    if (response.success) {
        setState(storageKey, value);
        output(response.data);
    } else {
        output(response.error);
    }
}

function resetToDefaultTheme() {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1415267
    // It is a known bug that the reset doesnt always respect default theme
    browser.theme.reset();
    resetThemeColors();
    resetCustomColors();
    setState('isApplied', false);
    output('Reset to default theme');
}

function setSettingsPageClosed() {
    browser.tabs.onRemoved.removeListener(onSettingsPageClosed);
    browser.tabs.onUpdated.removeListener(onSettingsPageClosed);
    settingsPageTabId = null;
}

// When the Settings tab is either closed
function onSettingsPageClosed(tabId, removeInfo) {
    if (tabId == settingsPageTabId) {
        setSettingsPageClosed();
    }
}

// When the Settings tab changes title (URL has changed)
function onSettingsPageUpdated(tabId, changeInfo, tab) {
    if (changeInfo.title !== 'Pywalfox Settings') {
        setSettingsPageClosed();
    }
}

// Sends a message to be displayed in the Settings page
function output(message) {
    browser.runtime.sendMessage({ action: 'output', message });
}

// Listen for errors with connection to native app
port.onDisconnect.addListener((port) => {
    if (port.error) {
        output(`Disconnected from native app: ${port.error}`);
    }
});

// Listen for messages from the app.
port.onMessage.addListener(async (response) => {
    if (response.key == 'colors') {
        if (response.success) {
            setTheme(response.data, true);
        } else {
            output(response.error);
        }
    } else if (response.key == 'enableCustomCss') {
        setStateOnSuccess(response, 'customCssOn', true);
    } else if (response.key == 'disableCustomCss') {
        setStateOnSuccess(response, 'customCssOn', false);
    } else if (response.key == 'enableNoScrollbar') {
        setStateOnSuccess(response, 'noScrollbar', true);
    } else if (response.key == 'disableNoScrollbar') {
        setStateOnSuccess(response, 'noScrollbar', false);
    } else if (response.key == 'output') {
      output(response.data);
    }
});

// Listen for messages from the content script
browser.runtime.onMessage.addListener((message) => {
    if (message.action == 'update') {
        resetCustomColors();
        port.postMessage('update');
    } else if (message.action == 'reset') {
        resetToDefaultTheme();
    } else if (message.action == 'customCssEnabled') {
        port.postMessage(message.enabled ? 'enableCustomCss' : 'disableCustomCss');
    } else if (message.action == 'noScrollbarEnabled') {
        port.postMessage(message.enabled ? 'enableNoScrollbar' : 'disableNoScrollbar');
    } else if (message.action == 'ddgThemeEnabled') {
        setState(message.action, message.enabled);
    } else if (message.action == 'customColor') {
        saveCustomColor(message.type, message.value);
        setTheme(pywalColors, message.ddgReload);
    }
});

// When clicking the add-on icon
browser.browserAction.onClicked.addListener(async () => {
    if (settingsPageTabId === null) {
        let tab = await browser.tabs.create({ url: 'popup/main.html' });
        browser.tabs.onRemoved.addListener(onSettingsPageClosed);
        browser.tabs.onUpdated.addListener(onSettingsPageUpdated, { tabId: tab.id, properties: ['title'] });
        settingsPageTabId = tab.id;
    } else {
        let tab = await browser.tabs.get(settingsPageTabId);
        browser.windows.update(tab.windowId, { focused: true });
        browser.tabs.update(tab.id, { active: true });
    }
});

// Make sure to apply the theme when starting Firefox, if it is enabled
async function applyThemeOnStartup() {
    const state = await browser.storage.local.get('isApplied');
    if (state.isApplied) {
        port.postMessage('update');
    }
}

applyThemeOnStartup();
