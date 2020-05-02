import * as Utils from './utils';
import * as Messenger from './messenger';

import { Dialog } from './dialog';
import { Colorpicker } from './colorpicker';
import { Themepicker } from './themepicker';
import { EXTENSION_MESSAGES, EXTENSION_OPTIONS, THEME_TEMPLATE_DATA } from '../config';

import {
    IExtensionMessage,
    IColorschemeTemplate,
    IInitialData,
    IOptionSetData,
    INodeLookup,
    IPywalColors,
    IThemeTemplateItem,
    IDebuggingInfoData,
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
const helpToggleButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-help]');

const fontSizeSaveButton: HTMLElement = document.getElementById('font-size-save');
const fontSizeSaveInput: HTMLElement = document.getElementById('font-size-input');

const colorpicker = new Colorpicker();
const themepicker = new Themepicker();
let currentDialog: Dialog = null;
let pywalColors: IPywalColors = null;
let template: IColorschemeTemplate = null;
let optionButtonsLookup: INodeLookup = {};

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

function setDebuggingInfo(info: IDebuggingInfoData) {
  debuggingConnected.innerText = info.connected ? 'Connected' : 'Disconnected';
  debuggingVersion.innerText = info.version == 0 ? 'version not set' : `version ${info.version}`;
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

function onHelpToggle(target: HTMLElement) {
  const helpElementId: string = target.getAttribute('data-help');
  const helpElement = document.getElementById(helpElementId);

  if (!helpElement) {
    console.error(`Could not find help text with id: ${helpElementId}`);
    return;
  }

  Utils.toggleOpen(helpElement);
}

function updateOptionButtonState(optionData: IOptionSetData) {
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
  THEME_TEMPLATE_DATA.forEach((item: IThemeTemplateItem) => {
    themeTemplateContent.innerHTML += `
      <div class="setting row expand space-between v-center">
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

function setInitialData(data: IInitialData) {
  colorpicker.setPalette(data.pywalColors);
  colorpicker.setSelectedColorForTarget(data.template);

  if (data.enabled) {
    themepicker.setSelectedMode(data.themeMode);
  }

  console.log(data.options);
  for (const optionData of data.options) {
    updateOptionButtonState(optionData);
  }

  setDebuggingInfo(data.debuggingInfo);
}

fetchButton.addEventListener('click', onFetchClicked);
disableButton.addEventListener('click', onDisableClicked);
themeButton.addEventListener('click', onThemeClicked);
colorButtons.forEach((button: HTMLElement) => button.addEventListener('click', onColorClicked));
optionButtons.forEach((button: HTMLElement) => button.addEventListener('click', onOptionClicked));
settingCardHeaders.forEach((header: HTMLElement) => header.addEventListener('click', () => onSettingCardClicked(header)));
overlay.addEventListener('click', onOverlayClicked);
fontSizeSaveButton.addEventListener('click', onFontSizeSave);
helpToggleButtons.forEach((button: HTMLElement) => button.addEventListener('click', () => onHelpToggle(button)));
browser.theme.onUpdated.addListener(setCurrentTheme);

browser.runtime.onMessage.addListener((message: IExtensionMessage) => {
  switch (message.action) {
    case EXTENSION_MESSAGES.INITIAL_DATA_SET:
      setInitialData(message.data);
      break;
    case EXTENSION_MESSAGES.PYWAL_COLORS_SET:
      pywalColors = message.data;
      colorpicker.setPalette(message.data);
      break;
    case EXTENSION_MESSAGES.TEMPLATE_SET:
      template = message.data;
      colorpicker.setSelectedColorForTarget(template);
      break;
    case EXTENSION_MESSAGES.THEME_MODE_SET:
      themepicker.setSelectedMode(message.data);
      break;
    case EXTENSION_MESSAGES.OPTION_SET:
      updateOptionButtonState(message.data);
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

Messenger.requestInitialData();
