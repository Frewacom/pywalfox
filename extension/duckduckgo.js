const THEME_COLOR_KEYS = [
    'themeBackground',
    'themeForeground',
    'themeBackgroundLight',
    'themeAccentPrimary',
    'themeAccentSecondary',
    'themeText'
];

function resetTheme() {
    const cookie = [
        'aq=-1',
        'ax=v188-4',
        '5=2',
        's=m',
        'w=n',
        'u=-1',
        'y=44475a',
        'ae=d'
    ];

    cookie.forEach((property) => {
        document.cookie = property;
    });
}

async function applyTheme() {
    const colorscheme = await createColorscheme();
    if (colorscheme) {
        colorscheme.forEach((property) => {
            document.cookie = property;
        });
    }
}

async function createColorscheme() {
    const savedColors = await browser.storage.local.get();
    if (Object.keys(savedColors).length > 0) {
        return [
            `7=${savedColors.themeBackground}`, // Background
            `8=f8f8f2`,
            `9=${savedColors.themeText}`, // Link title
            "ae=t",
            "t=p",
            "s=m",
            "w=n",
            "m=l",
            "o=s",
            `j=${savedColors.themeBackground}`,
            "a=p",
            `aa=${savedColors.themeAccentPrimary}`, // Clicked link title
            "u=-1",
            `x=${savedColors.themeAccentSecondary}`, // Link url
            "y=44475a",
            "af=1",
            "ai=1",
            "f=1",
            `21=${savedColors.themeBackgroundLight}` // Result hover
        ];
    }

    return false;
}

async function setTheme() {
    const state = await browser.storage.local.get('ddgThemeEnabled');
    if (state.ddgThemeEnabled) {
        applyTheme();
    } else {
        resetTheme();
    }
}

browser.runtime.onMessage.addListener(async (message) => {
    console.log('Message recieved');
    if (message.action == 'updateDDGTheme' || message.action == 'ddgThemeEnabled') {
        await setTheme();
        location.reload()
    }
});

setTheme();

console.log('Pywalfox content script loaded');

