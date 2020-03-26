// Get the theme name of the current theme in DuckDuckGo
function getCurrentTheme() {
    // DuckDuckGo stores the current theme in the variable/cookie 'ae'
    return window.wrappedJSObject.DDG.settings.get('kae');
}

async function resetTheme() {
    const state = await browser.storage.local.get('ddgResetTheme');

    // Use function implemented by DuckDuckGo to reset theme
    window.wrappedJSObject.DDG.settings.setTheme(state.ddgResetTheme);

    browser.storage.local.remove('ddgResetTheme');
    location.reload();
}

async function applyTheme(reload=false) {
    const colorscheme = await createColorscheme();
    if (colorscheme) {
        colorscheme.forEach((property) => {
            document.cookie = property;
        });
    }

    if (reload) { location.reload(); }
}

// Creates the colorscheme that can be applied to DuckDuckGo
async function createColorscheme() {
    const savedColors = await browser.storage.local.get();
    if (Object.keys(savedColors).length > 0) {
        // We only want to override the colors, no other settings like font size, etc
        return [
            `7=${savedColors.themeBackground}`,                                     // Background
            `j=${savedColors.themeBackground}`,                                     // Header background
            `9=${savedColors.themeText}`,                                           // Result link title
            `aa=${changeColorBrightness(savedColors.themeAccentPrimary, 0.8)}`,     // Result visited link title
            `x=${changeColorBrightness(savedColors.themeAccentSecondary, 0.7)}`,    // Result link url
            `8=f8f8f2`,                                                             // Result description
            `21=${savedColors.themeBackgroundLight}`,                               // Result hover, dropdown and module background
            'ae=pywalfox',                                                          // What theme to use/theme name
            //"a=p",        // Font, default is Proxima Nova
            //"s=m",        // Font size, default is Large
            //"w=n",        // Page width, default is Normal
            //"m=l",        // Results alignment, default is Left
            //"o=s",        // Header behaviour, default is On & Dynamic
            //"u=-1",       // Result title underline, default is Off
            //"af=1",       // Result full URLs, default is On
            //"ai=1",       // Result URLs above snippet, default is On
            //"f=1",        // Site icons, default is On
            //"t=p",        // Unknown
            //"y=44475a",   // Unknown
        ];
    }

    return false;
}

async function setTheme() {
    const state = await browser.storage.local.get(['ddgThemeEnabled', 'ddgResetTheme']);
    if (state.ddgThemeEnabled) {
        applyTheme();
    } else {
        if (state.ddgResetTheme !== undefined) {
            resetTheme();
        }
    }
}

// Listen to messages from the background script/settings page
browser.runtime.onMessage.addListener(async (message) => {
    if (message.action == 'updateDDGTheme') {
        applyTheme(true);
    } else if (message.action == 'resetDDGTheme') {
        resetTheme();
    } else if (message.action == 'ddgThemeEnabled') {
        if (message.enabled) {
            const theme = getCurrentTheme();
            if (theme == 'pywalfox') {
                // If pywalfox is the current theme when enabling the theme,
                // reset to Dark theme on disable
                browser.storage.local.set({ ddgResetTheme: 'd' });
            } else {
                browser.storage.local.set({ ddgResetTheme: theme });
            }
            applyTheme(true);
        } else {
            resetTheme();
        }
    }
});

console.log('Pywalfox content script loaded');

// Apply the theme, if enabled
setTheme();

