import { CSSTargets } from '@definitions';

export const STATE_VERSION = 1.0;

export const RESPONSE_TIMEOUT_MS = 3000;
export const MIN_REQUIRED_DAEMON_VERSION = 2.7;
export const DEFAULT_CSS_FONT_SIZE = 13;
export const PYWAL_PALETTE_LENGTH = 20;
export const AUTO_MODE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const NOTIFICATION_TIMEOUT = 5000;
export const MAX_SIMULTANEOUS_NOTIFICATIONS = 3;

export const ENABLED_BODY_CLASS = 'applied';
export const EXTENSION_THEME_SELCTOR = 'body,body.light,body.dark';
export const INJECT_URL_PATTERN = ['*://*.duckduckgo.com/*'];
export const DARKREADER_CONNECTION_ID = 'addon@darkreader.org';

// TODO: Move constants into an enum for better type validation
export const EXTENSION_PAGES = {
  UPDATE: 'ui/update.html',
  SETTINGS: 'ui/settings.html',
};

export const EXTERNAL_MESSAGES = {
  COLORSCHEME: 'colors',
  DISABLED: 'disabled',
};

export const EXTENSION_MESSAGES = {
  INITIAL_DATA_GET: 'initial:data:get',
  INITIAL_DATA_SET: 'initial:data:set',
  THEME_SET: 'theme:set',
  THEME_FETCH: 'theme:fetch',
  THEME_DISABLE: 'theme:disable',
  THEME_MODE_SET: 'theme:mode:set',
  TEMPLATE_THEME_MODE_GET: 'template:theme:mode:get',
  TEMPLATE_THEME_MODE_SET: 'template:theme:mode:set',
  PALETTE_COLOR_SET: 'palette:color:set',
  PALETTE_TEMPLATE_SET: 'palette:template:set',
  BROWSER_THEME_TEMPLATE_SET: 'browser:template:set',
  CUSTOM_COLORS_SET: 'custom:colors:set',
  OPTION_SET: 'option:set',
  FONT_SIZE_SET: 'font:size:set',
  AUTO_TIME_START: 'auto:time:start',
  AUTO_TIME_END: 'auto:time:end',
  NOTIFCATION: 'notification',
  UPDATE_PAGE_MUTE: 'update:page:mute',
  CSS_ENABLE_SUCCESS: 'css:enable:success',
  CSS_ENABLE_FAILED: 'css:enable:failed',
  CSS_DISABLE_SUCCESS: 'css:disable:success',
  CSS_DISABLE_FAILED: 'css:disable:failed',
  DEBUGGING_INFO_SET: 'debugging:info:set',
  DEBUGGING_OUTPUT: 'debugging:output',
  DDG_THEME_GET: 'ddg:theme:get',
  DDG_THEME_SET: 'ddg:theme:set',
  DDG_THEME_RESET: 'ddg:theme:reset',
};

export const EXTENSION_COMMANDS = {
  FETCH_THEME: 'fetch_pywal_colors',
  DISABLE_THEME: 'disable_theme',
  ENABLE_DARK_MODE: 'enable_dark_mode',
  ENABLE_LIGHT_MODE: 'enable_light_mode',
  ENABLE_AUTO_MODE: 'enable_auto_mode',
};

export const EXTENSION_OPTIONS = {
  AUTO_TIME_START: 'intervalStart',
  AUTO_TIME_END: 'intervalEnd',
  FONT_SIZE: 'fontSize',
  USER_CHROME: CSSTargets.UserChrome,
  USER_CONTENT: CSSTargets.UserContent,
  DUCKDUCKGO: 'duckduckgo',
  DARKREADER: 'darkreader',
  FETCH_ON_STARTUP: 'fetchOnStartup',
  SYNC_SETTINGS: 'syncSettings',
};

export const NATIVE_MESSAGES = {
  VERSION: 'debug:version',
  OUTPUT: 'debug:output',
  PYWAL_COLORS: 'action:colors',
  INVALID_ACTION: 'action:invalid',
  CSS_ENABLE: 'css:enable',
  CSS_DISABLE: 'css:disable',
  CSS_FONT_SIZE: 'css:font:size',
};

export const DARKREADER_MESSAGES = {
  THEME: 'setTheme',
  CHANGE_SETTINGS: 'changeSettings',
  RESET: 'resetSettings',
};
