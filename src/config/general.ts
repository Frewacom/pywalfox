import { CSSTargets } from '../definitions';

export const MIN_REQUIRED_DAEMON_VERSION = 2.0;
export const DEFAULT_CSS_FONT_SIZE = 14;
export const PYWAL_PALETTE_LENGTH = 20;

export const NOTIFICATION_TIMEOUT = 5000;
export const MAX_SIMULTANEOUS_NOTIFICATIONS = 3;

export const ENABLED_BODY_CLASS = 'applied';
export const DUCKDUCKGO_THEME_ID = 'pywalfox';
export const INJECT_URL_PATTERN = [ '*://*.duckduckgo.com/*' ];

export const EXTENSION_PAGES = {
  UPDATE: 'dist/update.html',
  SETTINGS: 'dist/settings.html',
};

export const EXTERNAL_MESSAGES = {
  COLORSCHEME: 'colors',
  DISABLED: 'disabled'
};

export const EXTENSION_MESSAGES = {
  INITIAL_DATA_GET: 'initial:data:get',
  INITIAL_DATA_SET: 'initial:data:set',
  THEME_FETCH: 'theme:fetch',
  THEME_DISABLE: 'theme:disable',
  THEME_MODE_SET: 'theme:mode:set',
  PALETTE_COLOR_SET: 'palette:color:set',
  TEMPLATE_SET: 'template:set',
  PALETTE_TEMPLATE_SET: 'palette:template:set',
  THEME_TEMPLATE_SET: 'theme:template:set',
  PYWAL_COLORS_SET: 'pywal:colors:set',
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

export const EXTENSION_OPTIONS = {
  AUTO_TIME_START: 'autoTimeStart',
  AUTO_TIME_END: 'autoTimeEnd',
  FONT_SIZE: 'fontSize',
  USER_CHROME: CSSTargets.UserChrome,
  USER_CONTENT: CSSTargets.UserContent,
  DUCKDUCKGO: 'duckduckgo',
};
