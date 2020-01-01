/*
On startup, connect to the "ping_pong" app.
*/
var port = browser.runtime.connectNative("pywalfox");

function createThemeFromColorscheme(colors) {
    const theme = {
        colors: {
            icons: colors.foreground,
            icons_attention: colors.accentSecondaryLight,
            frame: colors.background,
            tab_text: colors.background,
            tab_loading: colors.accentPrimaryLight,
            tab_background_text: colors.text,
            tab_selected: colors.foreground,
            tab_line: colors.foreground,
            tab_background_separator: colors.background,
            toolbar: colors.background,
            toolbar_field: colors.background,
            toolbar_field_focus: colors.background,
            toolbar_field_text: colors.text,
            toolbar_field_text_focus: colors.text,
            toolbar_field_border: colors.background,
            toolbar_field_border_focus: colors.background,
            toolbar_field_separator: colors.background,
            toolbar_field_highlight: colors.accentSecondaryLight,
            toolbar_field_highlight_text: colors.text,
            toolbar_bottom_separator: colors.background,
            toolbar_top_separator: colors.background,
            toolbar_vertical_separator: colors.backgroundLight,
            ntp_background: colors.background,
            ntp_text: colors.foreground,
            popup: colors.background,
            popup_border: colors.background,
            popup_text: colors.foreground,
            popup_highlight: colors.accent_secondary,
            popup_highlight_text: colors.text,
            sidebar: colors.background,
            sidebar_border: colors.background,
            sidebar_text: colors.foreground,
            sidebar_highlight: colors.accentPrimaryLight,
            sidebar_highlight_text: colors.text,
            bookmark_text: colors.text,
            button_background_hover: colors.backgroundLight,
            button_background_active: colors.backgroundLight,
        }
    };

    return theme;
}

function createColorscheme()

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

function setCustomColor(type, value) {
    //browser.storage.local.set({ type: value });
    console.log(`Updating: ${type} to ${value}`);
}

/*
Listen for messages from the app.
*/
port.onMessage.addListener((response) => {
    if (response.key == 'colorscheme') {
        if (response.success) {
            const colorscheme = createColorscheme(response.data);
            const theme = createThemeFromColorscheme(colorscheme);
            browser.theme.update(theme);
            browser.storage.local.set({ isApplied: true });
            output('Fetched and applied colorscheme successfully.')
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

browser.runtime.onMessage.addListener((message) => {
    if (message.action == 'update') {
        port.postMessage('update');
    } else if (message.action == 'enableCustomCss') {
        port.postMessage('enableCustomCss');
    } else if (message.action == 'disableCustomCss') {
        port.postMessage('disableCustomCss');
    } else if (message.action == 'enableNoScrollbar') {
        port.postMessage('enableNoScrollbar');
    } else if (message.action == 'disableNoScrollbar') {
        port.postMessage('disableNoScrollbar');
    } else if (message.action == 'customColor') {
        setCustomColor(message.type, message.value);
    }
});

async function applyThemeOnStartup() {
    const state = await browser.storage.local.get('isApplied');
    if (state.isApplied) {
        port.postMessage('update');
    }
}

applyThemeOnStartup();
