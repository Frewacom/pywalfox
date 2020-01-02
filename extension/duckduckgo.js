const THEME_COLOR_KEYS = [
    'themeBackground',
    'themeForeground',
    'themeBackgroundLight',
    'themeAccentPrimary',
    'themeAccentSecondary',
    'themeText'
];

console.log('ello');

async function createColorscheme() {
    const savedColors = await browser.storage.local.get();
    console.log(savedColors);
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
    const colorscheme = await createColorscheme();
    console.log(colorscheme);
    if (colorscheme) {
        colorscheme.forEach((property) => {
            console.log('asdasd');
            document.cookie = property;
        });
    }
}

setTheme();


