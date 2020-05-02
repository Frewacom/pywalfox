import * as Utils from './utils';
import * as Messenger from './messenger';

import { Dialog } from './dialog';
import { Colorpicker } from './colorpicker';
import { Themepicker } from './themepicker';
import { EXTENSION_MESSAGES, EXTENSION_OPTIONS } from '../config';

import {
    IExtensionMessage,
    IColorschemeTemplate,
    IOptionSetData,
    INodeLookup,
    IPywalColors
} from '../definitions';

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
const themeTemplateContent: HTMLElement = document.getElementById('theme-template-content');

const fontSizeSaveButton: HTMLElement = document.getElementById('font-size-save');
const fontSizeSaveInput: HTMLElement = document.getElementById('font-size-input');

const colorpicker = new Colorpicker();
const themepicker = new Themepicker();
let currentDialog: Dialog = null;
let pywalColors: IPywalColors = null;
let template: IColorschemeTemplate = null;
let optionButtonsLookup: INodeLookup = {};

const themeTemplateData = [
  { title: 'Icons', description: 'The color of toolbar icons, excluding those in the find toolbar.' },
  { title: 'Icons_attention', description: 'The color of toolbar icons in attention state, e.g. the starred bookmark icon.' },
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
  { title: 'Popup_border', description: 'The border color of popups.' },
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
  if (Utils.isSet('loading', target)) {
    Utils.loaded(target);
  }

  if (enabled) {
    Utils.select(target);
    Utils.select(target.parentElement);
    target.innerText = 'Yes';
  } else {
    Utils.deselect(target);
    Utils.deselect(target.parentElement);
    target.innerText = 'No';
  }
}

function onOptionClicked(e: Event) {
  const target = <HTMLElement>e.target;
  const option = target.getAttribute('data-option');
  const newState = Utils.isSet('selected', target) ? false : true;

  if (Utils.isSet('async', target)) {
    Utils.loading(target);
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
  pywalColors = null;
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
    // TODO: Display notification or something on error
    return;
  }
}

function updateOptionButtonState(message: IExtensionMessage) {
  const optionData: IOptionSetData = message.data;
  const target: HTMLElement = optionButtonsLookup[optionData.option];

  if (!target) {
    console.error(`Tried to set invalid option: ${optionData.option}`);
  } else {
    setOptionEnabled(target, optionData.enabled);
  }
}

function createOptionButtonLookup() {
  optionButtons.forEach((button) => {
    const option = button.getAttribute('data-option');
    if (option) {
      optionButtonsLookup[option] = button;
    } else {
      console.warn('Found option button with no "data-option" attribute: ', button);
    }
  });
}

function createThemeTemplateContent() {
  themeTemplateData.forEach((item) => {
    themeTemplateContent.innerHTML += `
      <div class="row expand space-between v-center margin-bottom">
        <div class="box column align-left">
          <p class="setting-title">${item.title}</p>
          <p class="setting-description">${item.description}</p>
        </div>
        <button data-color="background" class="btn-color dialog-arrow"></button>
      </div>
`;
  });
}

async function setCurrentTheme(themeInfo?: browser.theme.ThemeUpdateInfo) {
  if (pywalColors === null) {
    const selectedMode = await Utils.setInitialThemeClass(themeInfo);
    themepicker.setSelectedMode(selectedMode);
  }
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
      pywalColors = message.data;
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
    case EXTENSION_MESSAGES.OPTION_SET:
      updateOptionButtonState(message);
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
createOptionButtonLookup();
createThemeTemplateContent();

// TODO: Combine into one call
Messenger.requestPywalColors();
Messenger.requestTemplate();
Messenger.requestThemeMode();
Messenger.requestDebuggingInfo();
