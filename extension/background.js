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
    await browser.storage.local.set({ [type]: value });
    output(`Set custom color "${type}" to ${value}`);
}

async function sendMessageToTabs(data) {
    const tabs = await browser.tabs.query({});

    for (const tab of tabs) {
        browser.tabs.sendMessage(tab.id, data);
    }
}

async function getSavedCustomColors() {
    return await browser.storage.local.get(CUSTOM_COLOR_KEYS);
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
    pywalColors = colors;
    const colorscheme = await createColorschemeFromPywal(colors);
    const theme = createThemeFromColorscheme(colorscheme);
    await saveThemeColors(colorscheme);

    browser.theme.update(theme);
    if (ddgReload) {
        sendMessageToTabs({ action: 'updateDDGTheme' });
    }
    browser.storage.local.set({ isApplied: true, pywalColors });
}

function output(message) {
    browser.runtime.sendMessage({ action: 'output', message });
}

function changeState(response, storageKey, value) {
    if (response.success) {
        browser.storage.local.set({
            [storageKey]: value
        });
        output(response.data);
    } else {
        output(response.error);
    }
}

function resetCustomColors() {
    browser.storage.local.remove(CUSTOM_COLOR_KEYS);
}

function resetThemeColors() {
    browser.storage.local.remove(THEME_COLOR_KEYS);
}

function resetToDefaultTheme() {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1415267
    // It is a known bug that the reset doesnt respect default theme
    browser.theme.reset();
    resetThemeColors();
    resetCustomColors();
    browser.storage.local.set({ isApplied: false });
    output('Reset to default theme');
}

function onSettingsPageClosed(tabId, removeInfo) {
    if (tabId == settingsPageTabId) {
        browser.tabs.onRemoved.removeListener(onSettingsPageClosed);
        settingsPageTabListener = null;
        settingsPageTabId = null;
    }
}

// Listen for errors with connection to native app
port.onDisconnect.addListener((p) => {
    if (p.error) {
        output(`Disconnected from native app: ${p}`);
    }
});

// Listen for messages from the app.
port.onMessage.addListener(async (response) => {
    if (response.key == 'colors') {
        if (response.success) {
            setTheme(response.data);
        } else {
            output(response.error);
        }
    } else if (response.key == 'enableCustomCss') {
        changeState(response, 'customCssOn', true);
    } else if (response.key == 'disableCustomCss') {
        changeState(response, 'customCssOn', false);
    } else if (response.key == 'enableNoScrollbar') {
        changeState(response, 'noScrollbar', true);
    } else if (response.key == 'disableNoScrollbar') {
        changeState(response, 'noScrollbar', false);
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
        if (message.enabled) {
            port.postMessage('enableCustomCss');
        } else {
            port.postMessage('disableCustomCss');
        }
    } else if (message.action == 'noScrollbarEnabled') {
        if (message.enabled) {
            port.postMessage('enableNoScrollbar');
        } else {
            port.postMessage('disableNoScrollbar');
        }
    } else if (message.action == 'ddgThemeEnabled') {
        browser.storage.local.set({ [message.action]: message.enabled });
    } else if (message.action == 'customColor') {
        saveCustomColor(message.type, message.value);
        // Use the colors from pywal that we have already fetched and update the theme,
        // replacing the default value for 'message.type' with the custom color
        setTheme(pywalColors, message.ddgReload);
    }
});

browser.browserAction.onClicked.addListener(async () => {
    if (settingsPageTabId === null) {
        let tab = await browser.tabs.create({ url: 'popup/main.html' });
        settingsPageTabId = tab.id;
        settingsPageTabListener = browser.tabs.onRemoved.addListener(onSettingsPageClosed);
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
