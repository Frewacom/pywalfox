import * as Utils from './utils';
import * as Messenger from './messenger';

import { Dialog } from './dialog';
import { Colorpicker } from './colorpicker';
import { Themepicker } from './themepicker';

import {
  EXTENSION_MESSAGES,
  EXTENSION_OPTIONS,
  THEME_TEMPLATE_DATA,
  PALETTE_TEMPLATE_DATA,
  PYWAL_PALETTE_LENGTH,
} from '../config';

import {
    IExtensionMessage,
    IColorschemeTemplate,
    IInitialData,
    IOptionSetData,
    INodeLookup,
    IPywalColors,
    IThemeTemplateItem,
    IPaletteTemplateItem,
    IDebuggingInfoData,
} from '../definitions';

const optionButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-option]');
const helpToggleButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-help]');
const settingCardHeaders: NodeListOf<HTMLElement> = document.querySelectorAll('.setting-card-header');

const overlay: HTMLElement = document.getElementById('overlay');
const fetchButton: HTMLElement = document.getElementById('fetch');
const disableButton: HTMLElement = document.getElementById('disable');
const themeButton: HTMLElement = document.getElementById('theme-select');
const debuggingVersion: HTMLElement = document.getElementById('debugging-version');
const debuggingConnected: HTMLElement = document.getElementById('debugging-connected');
const debuggingOutput: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById('debugging-output');

const paletteContent: HTMLElement = document.getElementById('palette-content');
const themeTemplateContent: HTMLElement = document.getElementById('theme-template-content');
const paletteTemplateContent: HTMLElement = document.getElementById('palette-template-content');

const fontSizeSaveButton: HTMLElement = document.getElementById('font-size-save');
const fontSizeSaveInput: HTMLElement = document.getElementById('font-size-input');

const colorpicker = new Colorpicker();
const themepicker = new Themepicker();

let currentDialog: Dialog = null;
let pywalColors: IPywalColors = null;
let template: IColorschemeTemplate = null;

let optionButtonsLookup: INodeLookup = {};
let paletteTemplateInputLookup: INodeLookup = {};

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

function onPaletteTemplateInputChanged(e: Event) {
  const target = <HTMLInputElement>e.target;
  const value = target.value;

  if (target.checkValidity()) {
    console.log(value);
  }
}

function updateOptionButtonState(optionData: IOptionSetData) {
  const target: HTMLElement = optionButtonsLookup[optionData.option];

  if (target) {
    setOptionEnabled(target, optionData.enabled);
  }
}

function updatePaletteTemplateInputs(template: IColorschemeTemplate) {
  for (const key in template.palette) {
    const element = <HTMLInputElement>paletteTemplateInputLookup[key];
    if (element) {
      element.value = template.palette[key].toString();
    } else {
      console.error(`Found unhandled palette template target: ${key}`);
    }
  }
}

function createThemeTemplateContent() {
  THEME_TEMPLATE_DATA.forEach((item: IThemeTemplateItem) => {
    themeTemplateContent.innerHTML += `
      <div class="setting row expand space-between v-center">
        <div class="box column align-left">
          <p class="setting-title">${item.title}</p>
          <p class="setting-description">${item.description}</p>
        </div>
        <button data-color="background" class="btn btn-color dialog-arrow"></button>
      </div>
    `;
  });
}

function createPaletteContent() {
  PALETTE_TEMPLATE_DATA.forEach((item: IPaletteTemplateItem) => {
    paletteContent.innerHTML += `
      <div class="setting row expand space-between v-center">
        <div class="box column align-left">
          <p class="setting-title">${item.title}</p>
          <p class="setting-description">${item.description}</p>
        </div>
        <button data-color="${item.target}" class="btn btn-color dialog-arrow"></button>
      </div>
    `;

    paletteTemplateContent.innerHTML += `
      <div class="setting row expand space-between v-center">
        <div class="box column align-left">
          <p class="setting-title">${item.title}</p>
          <p class="setting-description">${item.description}</p>
        </div>
        <div class="input-container row v-center">
          <button class="btn btn-control">-</button>
          <input type="number" data-target="${item.target}" min="0" max="${PYWAL_PALETTE_LENGTH - 1}" />
          <button class="btn btn-control">+</button>
        </div>
      </div>
    `;
  });

  const paletteTemplateInputs: NodeListOf<HTMLElement> = document.querySelectorAll('input[data-target]');
  const colorButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-color]');

  colorButtons.forEach((button: HTMLElement) => button.addEventListener('click', onColorClicked));
  paletteTemplateInputs.forEach((input: HTMLElement) => {
    const target = input.getAttribute('data-target');
    input.addEventListener('change', onPaletteTemplateInputChanged);
    paletteTemplateInputLookup[target] = input;
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
  updatePaletteTemplateInputs(data.template);

  if (data.enabled) {
    themepicker.setSelectedMode(data.themeMode);
  }

  for (const optionData of data.options) {
    updateOptionButtonState(optionData);
  }

  setDebuggingInfo(data.debuggingInfo);
}

function handleExtensionMessage(message: IExtensionMessage) {
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
      updatePaletteTemplateInputs(template);
      /* colorpicker.setSelectedColorForTarget(template); */
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
}

overlay.addEventListener('click', onOverlayClicked);
fetchButton.addEventListener('click', onFetchClicked);
themeButton.addEventListener('click', onThemeClicked);
disableButton.addEventListener('click', onDisableClicked);
fontSizeSaveButton.addEventListener('click', onFontSizeSave);

helpToggleButtons.forEach((button: HTMLElement) => button.addEventListener('click', () => onHelpToggle(button)));
settingCardHeaders.forEach((header: HTMLElement) => header.addEventListener('click', () => onSettingCardClicked(header)));
optionButtons.forEach((button: HTMLElement) => {
  const option = button.getAttribute('data-option');
  button.addEventListener('click', onOptionClicked);

  if (option) {
    optionButtonsLookup[option] = button;
  } else {
    console.warn('Found option button with no "data-option" attribute: ', button);
  }
});

browser.theme.onUpdated.addListener(setCurrentTheme);
browser.runtime.onMessage.addListener(handleExtensionMessage);

setCurrentTheme();
createPaletteContent();
createThemeTemplateContent();

Messenger.requestInitialData();
