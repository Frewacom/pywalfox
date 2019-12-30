function setExtensionTheme(theme) {
    document.body.style.backgroundColor = theme.colors.frame;
    document.body.style.color = theme.colors.toolbar_field_text;
}

// Watch for theme updates
browser.theme.onUpdated.addListener(async ({ theme, windowId }) => {
  const sidebarWindow = await browser.windows.getCurrent();
  /*
    Only update theme if it applies to the window the sidebar is in.
    If a windowId is passed during an update, it means that the theme is applied to that specific window.
    Otherwise, the theme is applied globally to all windows.
  */
  if (!windowId || windowId == sidebarWindow.id) {
    setExtensionTheme(theme);
  }
});

const updateButton = document.getElementById('update');
const resetButton = document.getElementById('reset');
const enableCssButton = document.getElementById('enableCustomCss');
const disableCssButton = document.getElementById('disableCustomCss');
const output = document.getElementById('output');

updateButton.addEventListener('click', () => {
    browser.runtime.sendMessage({action: 'update'})
});

resetButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'reset' })
});

enableCssButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'enableCustomCss' })
});

disableCssButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'disableCustomCss' })
});

browser.runtime.onMessage.addListener((response) => {
    if (response.action == 'output') {
        output.value += response.message;
    }
});

// Set the element style when the extension page loads
async function setInitialStyle() {
  const theme = await browser.theme.getCurrent();
  setExtensionTheme(theme);
}

setInitialStyle();
