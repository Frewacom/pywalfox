export const MIN_REQUIRED_DAEMON_VERSION = 2.0;
export const PYWAL_PALETTE_LENGTH = 18;
export const INJECT_URL_PATTERN = [ "*://*.duckduckgo.com/*" ];
export const SETTINGS_PAGE_URL = 'dist/settings.html';
export const UPDATE_PAGE_URL = 'update.html';

export const DEFAULT_PALETTE = {
  background: "#252525",
  foreground: "#ffffff",
  backgroundLight: "#444444",
  accentPrimary: "#0284f7",
  accentSecondary: "#0284f7",
  text: "#ffffff"
};

export const DEFAULT_THEME_TEMPLATE_DARK = {
  palette: {
    background: 0,
    backgroundLight: 17,
    foreground: 15,
    accentPrimary: 1,
    accentSecondary: 2,
    text: 16,
    /* icons: 1, */
    /* icons_attention: 2, */
    /* frame: 0, */
    /* tab_text: 0, */
    /* tab_loading: 1, */
    /* tab_background_text: 16, */
    /* tab_selected: 15, */
    /* tab_line: 15, */
    /* tab_background_separator: 0, */
    /* toolbar: 0, */
    /* toolbar_field: 0, */
    /* toolbar_field_focus: 0, */
    /* toolbar_field_text: 16, */
    /* toolbar_field_text_focus: 16, */
    /* toolbar_field_border: 0, */
    /* toolbar_field_border_focus: 0, */
    /* toolbar_field_separator: 0, */
    /* toolbar_field_highlight: 1, */
    /* toolbar_field_highlight_text: 16, */
    /* toolbar_bottom_separator: 0, */
    /* toolbar_top_separator: 0, */
    /* toolbar_vertical_separator: 17, */
    /* ntp_background: 0, */
    /* ntp_text: 15, */
    /* popup: 0, */
    /* popup_border: 17, */
    /* popup_text: 16, */
    /* popup_highlight: 2, */
    /* popup_highlight_text: 16, */
    /* sidebar: 0, */
    /* sidebar_border: 17, */
    /* sidebar_text: 15, */
    /* sidebar_highlight: 1, */
    /* sidebar_highlight_text: 16, */
    /* bookmark_text: 16, */
    /* button_background_hover: 17, */
    /* button_background_active: 17, */
  }
};

export const DEFAULT_THEME_TEMPLATE_LIGHT = {
  palette: {
    background: 16,
    backgroundLight: 15,
    foreground: 17,
    accentPrimary: 1,
    accentSecondary: 2,
    text: 0,
  }
}

// TODO: Convert these into enums
export const VALID_CSS_TARGETS = [
  "userChrome",
  "userContent"
];

export const EXTERNAL_MESSAGES = {
  COLORSCHEME: "colors",
  DISABLED: "disabled"
};

export const EXTENSION_MESSAGES = {
  DEBUGGING_INFO_GET: "debugging:info:get",
  DEBUGGING_INFO_SET: "debugging:info:set",
  DEBUGGING_OUTPUT: "debugging:output",
  THEME_FETCH: "theme:fetch",
  THEME_DISABLE: "theme:disable",
  THEME_SET: "theme:set",
  THEME_MODE_SET: "theme:mode:set",
  THEME_MODE_GET: "theme:mode:get",
  PALETTE_COLOR_SET: "palette:color:set",
  PALETTE_COLOR_GET: "palette:color:get",
  TEMPLATE_SET: "template:set",
  TEMPLATE_GET: "template:get",
  PYWAL_COLORS_GET: "pywal:colors:get",
  PYWAL_COLORS_SET: "pywal:colors:set",
  OPTION_GET: "option:get",
  OPTION_SET: "option:set",
  FONT_SIZE_SET: "font:size:set",
  FONT_SIZE_GET: "font:size:get",
  NOTIFCATION: "notification",
  CSS_ENABLE: "css:enable",
  CSS_DISABLE: "css:disable",
  CSS_ENABLE_SUCCESS: "css:enable:success",
  CSS_ENABLE_FAILED: "css:enable:failed",
  CSS_DISABLE_SUCCESS: "css:disable:success",
  CSS_DISABLE_FAILED: "css:disable:failed",
  DDG_THEME_GET: "ddg:theme:get",
  DDG_THEME_SET: "ddg:theme:set",
  DDG_THEME_RESET: "ddg:theme:reset",
};

export const EXTENSION_OPTIONS = {
  FONT_SIZE: "fontSize",
  USER_CHROME: "userChrome",
  USER_CONTENT: "userContent",
  DUCKDUCKGO: "duckduckgo",
};

export const MESSAGES = {
  VERSION: "debug:version",
  OUTPUT: "debug:output",
  COLORSCHEME: "action:colors",
  INVALID_ACTION: "action:invalid",
  CSS_ENABLE: "css:enable",
  CSS_DISABLE: "css:disable"
};

export const THEME_TEMPLATE_DATA = [
  { title: 'Icons', description: 'The color of toolbar icons, excluding those in the find toolbar.' },
  { title: 'Icons attention', description: 'The color of toolbar icons in attention state, e.g. the starred bookmark icon.' },
  { title: 'Frame', description: 'The color of the header area background.' },
  { title: 'Tab text', description: 'The text color for the selected tab.' },
  { title: 'Tab loading', description: 'The color of the tab loading indicator and the tab loading burst.' },
  { title: 'Tab background_text', description: 'The color of the text displayed in the inactive page tabs.' },
  { title: 'Tab selected', description: 'The background color of the selected tab.' },
  { title: 'Tab line', description: 'The color of the selected tab line.' },
  { title: 'Tab background_separator', description: 'The color of the vertical separator of the background tabs.' },
  { title: 'Toolbar', description: 'The background color for the navigation bar, the bookmarks bar, and the selected tab.' },
  { title: 'Toolbar field', description: 'The background color for fields in the toolbar, such as the URL bar.' },
  { title: 'Toolbar field focus', description: 'The focused background color for fields in the toolbar, such as the URL bar.' },
  { title: 'Toolbar field text', description: 'The color of text in fields in the toolbar, such as the URL bar.' },
  { title: 'Toolbar field text focus', description: 'The color of text in focused fields in the toolbar, such as the URL bar.' },
  { title: 'Toolbar field border', description: 'The border color for fields in the toolbar.' },
  { title: 'Toolbar field border focus', description: 'The focused border color for fields in the toolbar.' },
  { title: 'Toolbar field separator', description: 'The color of separators inside the URL bar.' },
  { title: 'Toolbar field highlight', description: 'The background color used to indicate the current selection of text in the URL bar.' },
  { title: 'Toolbar field highlight text', description: 'The color used to draw text that\'s currently selected in the URL bar.' },
  { title: 'Toolbar bottom_separator', description: 'The color of the line separating the bottom of the toolbar from the region below.' },
  { title: 'Toolbar top separator', description: 'The color of the line separating the top of the toolbar from the region above.' },
  { title: 'Toolbar vertical separator', description: 'The color of the separator next to the application menu icon.' },
  { title: 'New tab page background', description: 'The new tab page background color.' },
  { title: 'New tab page text', description: 'The new tab page text color.' },
  { title: 'Popup', description: 'The background color of popups (eg. url bar dropdown and arrow panels).' },
  { title: 'Popup border', description: 'The border color of popups.' },
  { title: 'Popup text', description: 'The text color of popups.' },
  { title: 'Popup highlight', description: 'The background color of items highlighted using the keyboard inside popups.' },
  { title: 'Popup highlight text', description: 'The text color of items highlighted inside popups.' },
  { title: 'Sidebar', description: 'The background color of the sidebar.' },
  { title: 'Sidebar border', description: 'The border and splitter color of the browser sidebar' },
  { title: 'Sidebar text', description: 'The text color of sidebars.' },
  { title: 'Sidebar highlight', description: 'The background color of highlighted rows in built-in sidebars' },
  { title: 'Sidebar highlight text', description: 'The text color of highlighted rows in sidebars.' },
  { title: 'Bookmark text', description: 'The color of text and icons in the bookmark and find bars.' },
  { title: 'Button background hover', description: 'The color of the background of the toolbar buttons on hover.' },
  { title: 'Button background active', description: 'The color of the background of the pressed toolbar buttons.' },
];
