// Default colorscheme for the extension pages
const DEFAULT_COLORSCHEME = {
    BACKGROUND: '#252525',
    FOREGROUND: '#ffffff',
    BACKGROUND_LIGHT: '#444444',
    ACCENT_PRIMARY: '#0284f7',
    ACCENT_SECONDARY: '#0284f7',
    TEXT: '#ffffff'
};

// The default theme template
const DEFAULT_THEME_TEMPLATE = {
    accentPrimary: 1,
    accentSecondary: 2,
    background: 0,
    foreground: 15,
    text: 16,
    backgroundLight: 17
};

// The keys in which custom colors will be stored
const CUSTOM_COLOR_KEYS = [
    'background',
    'foreground',
    'backgroundLight',
    'accentPrimary',
    'accentSecondary',
    'text'
];

// The keys in which pywal colors will be stored
const THEME_COLOR_KEYS = [
    'themeBackground',
    'themeForeground',
    'themeBackgroundLight',
    'themeAccentPrimary',
    'themeAccentSecondary',
    'themeText'
];

const REQUIRED_DAEMON_VERSION = 1.0;

// The tab URLs to target when sending out messages
const TAB_MESSAGE_URL_PATTERNS = [ "*://*.duckduckgo.com/*" ];
