export const MIN_REQUIRED_DAEMON_VERSION = 2.0;
export const PYWAL_PALETTE_LENGTH = 18;
export const INJECT_URL_PATTERN = [ "*://*.duckduckgo.com/*" ];

export const DEFAULT_COLORSCHEME = {
  background: "#252525",
  foreground: "#ffffff",
  backgroundLight: "#444444",
  accentPrimary: "#0284f7",
  accentSecondary: "#0284f7",
  text: "#ffffff"
};

export const DEFAULT_THEME_TEMPLATE = {
  accentPrimary: 1,
  accentSecondary: 2,
  background: 0,
  foreground: 15,
  text: 16,
  backgroundLight: 17
};

export const EXTERNAL_MESSAGES = {
  COLORSCHEME: "colors",
  DISABLED: "disabled"
};

export const EXTENSION_MESSAGES = {
  OUTPUT: "output",
  THEME: "theme",
  NOTIFCATION: "notification",
  CSS_ENABLE: "css:enable",
  CSS_DISABLE: "css:disable",
  CSS_ENABLE_SUCCESS: "css:enable:success",
  CSS_ENABLE_FAILED: "css:enable:failed",
  CSS_DISABLE_SUCCESS: "css:disable:success",
  CSS_DISABLE_FAILED: "css:disable:failed",
};

export const MESSAGES = {
  VERSION: "debug:version",
  OUTPUT: "debug:output",
  COLORSCHEME: "action:colors",
  INVALID_ACTION: "action:invalid",
  CSS_ENABLE: "css:enable",
  CSS_DISABLE: "css:disable"
};
