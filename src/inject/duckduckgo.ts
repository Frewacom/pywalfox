import { IColorscheme } from '../colorscheme';

/**
 * Implements the interface for a DuckDuckGo theme cookie.
 *
 * @remarks
 * DuckDuckGo uses cookies to store the colors of the theme.
 * To set a custom theme that is consistent, we simply overwrite the cookies
 * with our own values.
 */
interface IDuckDuckGoThemeCookie {
  id: string;
  value: string;
}

/**
 * Gets the currently selected theme in DuckDuckGo.
 *
 * @returns {string} the id of the current theme
 */
function getCurrentTheme() {
  return window.wrappedJSObject.DDG.settings.get('kae');
}

/**
 * Creates the colorscheme for DuckDuckGo based on the current colorscheme.
 *
 * @param colorscheme - the colors to be used when creating the theme
 *
 * @returns {IDuckDuckGoThemeCookie[]} The cookies used to set the DuckDuckGo theme
 */
function createTheme(colorscheme: IColorscheme) {
  return [
      { id: '7', value: colorscheme.background },       // Background
      { id: 'j', value: colorscheme.background },       // Header background
      { id: '9', value: colorscheme.text },             // Result link title
      { id: 'aa', value: colorscheme.accentPrimary },   // Result visited link title
      { id: 'x', value: colorscheme.accentSecondary },  // Result link url
      { id: '8', value: 'f8f8f8' },                     // Result description
      { id: '21', value: colorscheme.backgroundLight }, // Result hover, dropdown, etc.
      { id: 'ae', value: 'pywalfox' },                  // The theme name
  ];
}

/**
 * Disables the Pywalfox theme and reapplies the DuckDuckGo theme that was
 * selected when first applying the Pywalfox theme.
 */
function resetTheme() {
  const resetTheme = 'd'
  window.wrappedJSObject.DDG.settings.setTheme(resetTheme);
}

/**
 * Enables the pywalfox theme by setting the cookies.
 *
 * @param theme - the theme cookies
 */
function applyTheme(theme: IDuckDuckGoThemeCookie[]) {
  theme.forEach(({ id, value }) => {
    document.cookie = `${id}=${value}`;
  });

  location.reload();
}

/**
 * Checks if the Pywalfox theme is enabled and applies the theme.
 */
function applyThemeIfEnabled() {
  const currentTheme = getCurrentTheme();
  if (currentTheme == 'pywalfox') {
    console.log('Applying theme');
  }
}

console.log('Pywalfox content script loaded');

applyThemeIfEnabled();


