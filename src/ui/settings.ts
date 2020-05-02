import * as Utils from './utils';
import * as Messenger from './messenger';

import { Dialog } from './dialog';
import { Colorpicker } from './colorpicker';
import { Themepicker } from './themepicker';
import { IExtensionMessage, IColorschemeTemplate } from '../definitions';
import { EXTENSION_MESSAGES, EXTENSION_OPTIONS } from '../config';

const fetchButton: HTMLElement = document.getElementById('fetch');
const disableButton: HTMLElement = document.getElementById('disable');
const themeButton: HTMLElement = document.getElementById('theme-select');
const colorButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-color]');
const optionButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-option]');
const settingCardHeaders: NodeListOf<HTMLElement> = document.querySelectorAll('.setting-card-header');
const debuggingOutput: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById('debugging-output');
const debuggingConnected: HTMLElement = document.getElementById('debugging-connected');
const debuggingVersion: HTMLElement = document.getElementById('debugging-version');
const overlay: HTMLElement = document.getElementById('overlay');

const fontSizeSaveButton: HTMLElement = document.getElementById('font-size-save');
const fontSizeSaveInput: HTMLElement = document.getElementById('font-size-input');

const colorpicker = new Colorpicker();
const themepicker = new Themepicker();
let currentDialog: Dialog = null;
let template: IColorschemeTemplate = null;

const templateData = [
  { title: icons, description: 'The color of toolbar icons, excluding those in the find toolbar.' },
  { title: icons_attention, description: 'The color of toolbar icons in attention state such as the starred bookmark icon or finished download icon.' },
  { title: frame, description: 'The color of the header area background, displayed in the part of the header not covered or visible through the images specified in "theme_frame" and "additional_backgrounds".' },
  { title: tab_text, description: 'From Firefox 59, it represents the text color for the selected tab. If tab_line isn\'t specified, it also defines the color of the selected tab line.' },
  { title: tab_loading, description: 'The color of the tab loading indicator and the tab loading burst.' },
  { title: tab_background_text, description: 'The color of the text displayed in the inactive page tabs. If tab_text or bookmark_text isn\'t specified, applies to the active tab text.' },
  { title: tab_selected, description: 'The background color of the selected tab. When not in use selected tab color is set by frame and the frame_inactive.' },
  { title: tab_line, description: 'The color of the selected tab line.' },
  { title: tab_background_separator, description: 'The color of the vertical separator of the background tabs.' },
  { title: toolbar, description: 'The background color for the navigation bar, the bookmarks bar, and the selected tab. This also sets the background color of the "Find" bar.' },
  { title: toolbar_field, description: 'The background color for fields in the toolbar, such as the URL bar. This also sets the background color of the Find in page field.' },
  { title: toolbar_field_focus, description: 'The focused background color for fields in the toolbar, such as the URL bar.' },
  { title: toolbar_field_text, description: 'The color of text in fields in the toolbar, such as the URL bar. This also sets the color of text in the Find in page field.' },
  { title: toolbar_field_text_focus, description: 'The color of text in focused fields in the toolbar, such as the URL bar.' },
  { title: toolbar_field_border, description: 'The border color for fields in the toolbar. This also sets the border color of the Find in page field.' },
  { title: toolbar_field_border_focus, description: 'The focused border color for fields in the toolbar.' },
  { title: toolbar_field_separator, description: 'The color of separators inside the URL bar. In Firefox 58 this was implemented as toolbar_vertical_separator.' },
  { title: toolbar_field_highlight, description: 'The background color used to indicate the current selection of text in the URL bar (and the search bar, if it\'s configured to be separate). ' },
  { title: toolbar_field_highlight_text, description: 'The color used to draw text that\'s currently selected in the URL bar (and the search bar, if it\'s configured to be separate box).' },
  { title: toolbar_bottom_separator, description: 'The color of the line separating the bottom of the toolbar from the region below.' },
  { title: toolbar_top_separator, description: 'The color of the line separating the top of the toolbar from the region above.' },
  { title: toolbar_vertical_separator, description: 'The color of the separator next to the application menu icon. In Firefox 58, it corresponds to the color of separators inside the URL bar.' },
  { title: ntp_background, description: 'The new tab page background color.' },
  { title: ntp_text, description: 'The new tab page text color.' },
  { title: popup, description: 'The background color of popups (such as the url bar dropdown and the arrow panels).' },
  { title: popup_border, description: 'The border color of popups.' },
  { title: popup_text, description: 'The text color of popups.' },
  { title: popup_highlight, description: 'The background color of items highlighted using the keyboard inside popups (such as the selected url bar dropdown item).' },
  { title: popup_highlight_text, description: 'The text color of items highlighted inside popups.' },
  { title: sidebar, description: 'The background color of the sidebar.' },
  { title: sidebar_border, description: 'The border and splitter color of the browser sidebar' },
  { title: sidebar_text, description: 'The text color of sidebars.' },
  { title: sidebar_highlight, description: 'The background color of highlighted rows in built-in sidebars' },
  { title: sidebar_highlight_text, description: 'The text color of highlighted rows in sidebars.' },
  { title: bookmark_text, description: 'The color of text and icons in the bookmark and find bars. Also, if tab_text isn\'t defined it sets the color of the active tab text and if icons isn\'t defined the color of the toolbar icons. Provided as Chrome compatible alias for toolbar_text.' },
  { title: button_background_hover, description: 'The color of the background of the toolbar buttons on hover.' },
  { title: button_background_active, description: 'The color of the background of the pressed toolbar buttons.' },
]

/**
 * Opens a dialog on the right hand side of the UI.
 *
 * @param {IDialog} dialog - the dialog to open
 * @param {HTMLElement} target - the element that triggered the opening of the dialog
 */
function openDialog(dialog: Dialog, target: HTMLElement) {
  const overlayOpen = Utils.isOpen(overlay);

  if (!overlayOpen) {
    Utils.open(overlay);
  }

  if (currentDialog === dialog) {
    if (dialog !== colorpicker || currentDialog.getTarget() === target) {
      closeDialog();
      return;
    }
  } else if (currentDialog !== null && currentDialog !== dialog) {
    currentDialog.close();
  }

  dialog.open(target);
  currentDialog = dialog;
}

function closeDialog() {
  if (currentDialog !== null) {
    currentDialog.close();
    currentDialog = null;
  }

  if (Utils.isOpen(overlay)) {
    Utils.close(overlay);
  }
}

function setDebuggingInfo(info: { connected: boolean, version: number }) {
  debuggingConnected.innerText = info.connected ? 'Connected' : 'Disconnected';
  debuggingVersion.innerText = `version ${info.version}`;
}

function writeOutput(message: string) {
  debuggingOutput.value += message + '\n';
  debuggingOutput.scrollTop = debuggingOutput.scrollHeight; // Scrolls to bottom of textarea
}

function onSettingCardClicked(header: HTMLElement) {
  Utils.toggleOpen(<HTMLElement>header.parentNode);
}

function onColorClicked(e: Event) {
  const element = <HTMLElement>e.target;
  openDialog(colorpicker, element);
  colorpicker.setSelectedColorForTarget(template);
}

function setOptionEnabled(target: HTMLElement, enabled: boolean) {
  if (enabled) {
    Utils.deselect(target);
    target.innerText = 'No';
  } else {
    Utils.select(target);
    target.innerText = 'Yes';
  }
}

function onOptionClicked(e: Event) {
  const target = <HTMLElement>e.target;
  const option = target.getAttribute('data-option');
  const isEnabled = Utils.isSet('selected', target);
  const newState = isEnabled ? false : true;

  if (Utils.isSet('async', target)) {
    // TODO: Implement loading state on button
  } else {
    setOptionEnabled(target, isEnabled);
  }

  Messenger.requestOptionSet(option, newState);
}

function onOverlayClicked(e: Event) {
  closeDialog();
}

function onFetchClicked(e: Event) {
  Messenger.requestFetch();
}

function onDisableClicked(e: Event) {
  Messenger.requestDisable();
  colorpicker.setPalette(null);
  colorpicker.setSelectedColorForTarget(null);
}

function onThemeClicked(e: Event) {
  openDialog(themepicker, themeButton);
}

function onFontSizeSave(e: Event) {
  const inputElement = <HTMLInputElement>fontSizeSaveInput;
  if (inputElement.checkValidity()) {
    // TODO: Set loading state on button
    Messenger.requestFontSizeSet(parseInt(inputElement.value));
  } else {
    // TODO: Display notifiction or something
    return;
  }
}

async function setCurrentTheme(themeInfo?: browser.theme.ThemeUpdateInfo) {
  const selectedMode = await Utils.setInitialThemeClass(themeInfo);
  themepicker.setSelectedMode(selectedMode);
}

fetchButton.addEventListener('click', onFetchClicked);
disableButton.addEventListener('click', onDisableClicked);
themeButton.addEventListener('click', onThemeClicked);
colorButtons.forEach((button: HTMLElement) => button.addEventListener('click', onColorClicked));
optionButtons.forEach((button: HTMLElement) => button.addEventListener('click', onOptionClicked));
settingCardHeaders.forEach((header: HTMLElement) => header.addEventListener('click', () => onSettingCardClicked(header)));
overlay.addEventListener('click', onOverlayClicked);
fontSizeSaveButton.addEventListener('click', onFontSizeSave);
browser.theme.onUpdated.addListener(setCurrentTheme);

browser.runtime.onMessage.addListener((message: IExtensionMessage) => {
  switch (message.action) {
    case EXTENSION_MESSAGES.PYWAL_COLORS_SET:
      colorpicker.setPalette(message.data);
      break;
    case EXTENSION_MESSAGES.TEMPLATE_SET:
      template = message.data;
      colorpicker.setSelectedColorForTarget(template);
      break;
    case EXTENSION_MESSAGES.THEME_MODE_SET:
      /**
       * TODO: When these have been combined into one single call,
       *       we want to check if the pywalfox theme is enabled.
       *       Currently, the mode from 'setCurrentTheme' will be overridden.
       */
      themepicker.setSelectedMode(message.data);
      break;
    case EXTENSION_MESSAGES.DEBUGGING_OUTPUT:
      writeOutput(message.data);
      break;
    case EXTENSION_MESSAGES.DEBUGGING_INFO_SET:
      setDebuggingInfo(message.data);
      break;
  }
});

setCurrentTheme();

// TODO: Combine into one call
Messenger.requestPywalColors();
Messenger.requestTemplate();
Messenger.requestThemeMode();
Messenger.requestDebuggingInfo();
