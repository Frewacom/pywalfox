import {
  IExtensionMessage,
  IThemeTemplate,
  ITimeIntervalEndpoint,
  IPaletteTemplate,
  IBrowserThemeTemplate,
  IInitialData,
  IOptionSetData,
  INodeLookup,
  IPywalColors,
  ITemplateItem,
  INotificationData,
  IDebuggingInfoData,
  PaletteColors,
} from '@definitions';

import {
  EXTENSION_OPTIONS,
  EXTENSION_MESSAGES,
  PYWAL_PALETTE_LENGTH,
  ENABLED_BODY_CLASS,
  NOTIFICATION_TIMEOUT,
  MAX_SIMULTANEOUS_NOTIFICATIONS,
} from '@config/general';

import * as Utils from '@utils/dom';
import Messenger from '@communication/messenger';

import Dialog from './components/dialogs/dialog';
import Colorpicker from './components/dialogs/colorpicker';
import Themepicker from './components/dialogs/themepicker';

import BrowserTemplateEditor from './components/templates/browser-template-editor';
import PaletteTemplateEditor from './components/templates/palette-template-editor';

const optionButtons = <NodeListOf<HTMLElement>>document.querySelectorAll('button[data-option]');
const helpToggleButtons = <NodeListOf<HTMLElement>>document.querySelectorAll('button[data-help]');
const settingCardHeaders = <NodeListOf<HTMLElement>>document.querySelectorAll('.setting-card-header');

const overlay = <HTMLDivElement>document.getElementById('overlay');
const fetchButton = <HTMLButtonElement>document.getElementById('fetch');
const versionLabel = <HTMLSpanElement>document.getElementById('version');
const disableButton = <HTMLButtonElement>document.getElementById('disable');
const themeButton = <HTMLButtonElement>document.getElementById('theme-select');
const fontSizeSaveInput = <HTMLInputElement>document.getElementById('font-size-input');
const autoTimeStartInput = <HTMLInputElement>document.getElementById('auto-time-start-input');
const autoTimeEndInput = <HTMLInputElement>document.getElementById('auto-time-end-input');
const debuggingOutput = <HTMLTextAreaElement>document.getElementById('debugging-output');
const debuggingVersion = <HTMLParagraphElement>document.getElementById('debugging-version');
const debuggingConnected = <HTMLParagraphElement>document.getElementById('debugging-connected');

const notificationContainer = <HTMLDivElement>document.getElementById('notification-container');
const notificationTemplate = <HTMLTemplateElement>document.getElementById('notification-template');

const colorpicker = new Colorpicker();
const themepicker = new Themepicker();
const paletteTemplateEditor = new PaletteTemplateEditor(colorpicker, openDialog);
const browserTemplateEditor = new BrowserTemplateEditor();

let currentDialog: Dialog = null;

const optionButtonsLookup: INodeLookup<HTMLButtonElement> = {};

function openDialog(dialog: Dialog, target: HTMLElement) {
  if (!Utils.isOpen(overlay)) {
    Utils.setOpen(overlay);
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
    Utils.setClosed(overlay);
  }
}

function toggleIsAppliedBodyClass() {
  document.body.classList.toggle(ENABLED_BODY_CLASS);
}

function setDebuggingInfo({ version, connected }: IDebuggingInfoData) {
  debuggingConnected.innerText = connected ? 'Connected' : 'Disconnected';
  debuggingVersion.innerText = `version ${version === 0 ? 'not set' : version}`;
}

function writeOutput(message: string) {
  debuggingOutput.value += `${message}\n`;
  debuggingOutput.scrollTop = debuggingOutput.scrollHeight; // Scrolls to bottom of textarea
}

function setOptionEnabled(target: HTMLElement, enabled: boolean) {
  if (target === null) {
    console.error('Failed to update option state, target is null');
    return;
  }

  if (Utils.isSet('loading', target)) {
    Utils.setLoaded(target);
  }

  if (enabled) {
    Utils.setSelected(target);
    Utils.setSelected(target.parentElement);
    target.innerText = 'Yes';
  } else {
    Utils.setDeselected(target);
    Utils.setDeselected(target.parentElement);
    target.innerText = 'No';
  }
}

function onOptionClicked(e: Event) {
  const target = <HTMLElement>e.target;
  const option = target.getAttribute('data-option');
  const newState = !Utils.isSet('selected', target);

  if (Utils.isSet('async', target)) {
    Utils.setLoading(target);
  }

  Messenger.UI.requestOptionSet(option, newState);
}

function onDisableClicked() {
  Messenger.UI.requestDisable();
  colorpicker.setPywalColors(null);
  colorpicker.setCustomColors(null);
  colorpicker.updateSelected();
  toggleIsAppliedBodyClass();
}

function onFontSizeSave() {
  if (fontSizeSaveInput.checkValidity()) {
    const option = fontSizeSaveInput.getAttribute('data-option');
    Messenger.UI.requestFontSizeSet(option, parseInt(fontSizeSaveInput.value, 10));
  } else {
    createNotification({
      title: 'Custom font size',
      message: 'Invalid value, should be between 10-20 pixels',
      error: true,
    });
  }
}

function validateAutoTimeInterval() {
  const startValue = autoTimeStartInput.value;
  const endValue = autoTimeEndInput.value;

  if (startValue < endValue) {
    return true;
  }

  createNotification({ title: 'Auto mode', message: 'Start time is greater than end time', error: true });
  return false;
}

function createTimeIntervalObject(value: string) {
  const [hour, minute] = value.split(':');

  if (hour === undefined || minute === undefined) {
    console.error(`Could not create time interval object for ${value}`);
    return null;
  }

  const intervalObject: ITimeIntervalEndpoint = {
    hour: parseInt(hour, 10),
    minute: parseInt(minute, 10),
    stringFormat: value,
  };

  return intervalObject;
}

function onTimeIntervalSave(input: HTMLInputElement, action: string) {
  if (validateAutoTimeInterval()) {
    const intervalObject = createTimeIntervalObject(input.value);

    if (intervalObject !== null) {
      Messenger.UI.requestAutoTimeSet(action, intervalObject);
    }
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

function updateOptionState({ option, enabled, value }: IOptionSetData) {
  switch (option) {
    case EXTENSION_OPTIONS.FONT_SIZE:
      fontSizeSaveInput.value = value.toString();
      break;
    case EXTENSION_OPTIONS.AUTO_TIME_START:
      autoTimeStartInput.value = value.stringFormat;
      break;
    case EXTENSION_OPTIONS.AUTO_TIME_END:
      autoTimeEndInput.value = value.stringFormat;
      break;
    default:
      setOptionEnabled(<HTMLButtonElement>optionButtonsLookup[option], enabled);
  }
}

function createNotification(data: INotificationData) {
  if (notificationContainer.childElementCount >= MAX_SIMULTANEOUS_NOTIFICATIONS) {
    notificationContainer.removeChild(notificationContainer.firstElementChild);
  }

  const { title, message, error } = data;
  const clone = <HTMLElement>notificationTemplate.content.cloneNode(true);
  const containerElement = <HTMLElement>clone.querySelector('.notification');
  const titleElement = <HTMLParagraphElement>clone.querySelector('.notification-title');
  const contentElement = <HTMLParagraphElement>clone.querySelector('.notification-content');
  const iconElement = <HTMLElement>clone.querySelector('i');
  const closeElement = <HTMLButtonElement>clone.querySelector('button');

  titleElement.innerText = `${title}:`;
  contentElement.innerText = message;
  iconElement.setAttribute('icon', error ? 'error' : 'bell');
  error && containerElement.classList.add('error');

  closeElement.addEventListener('click', () => notificationContainer.removeChild(containerElement));

  notificationContainer.appendChild(clone);

  containerElement.classList.add('fadeout');
  setTimeout(() => containerElement.classList.remove('fadeout'), 50);
  setTimeout(() => {
    if (notificationContainer.contains(containerElement)) {
      // The notification might already be deleted if the
      // MAX_SIMULTANEOUS_NOTIFICATIONS treshold is reached
      notificationContainer.removeChild(containerElement);
    }
  }, NOTIFICATION_TIMEOUT);
}

function setInitialData(data: IInitialData) {
  themepicker.setSelectedMode(data.themeMode, data.templateThemeMode);

  if (data.isApplied) {
    toggleIsAppliedBodyClass();
  }

  data.options.forEach((optionData) => {
    updateOptionState(optionData);
  });

  colorpicker.update(data.pywalColors, data.userTheme.customColors, data.template.palette);
  browserTemplateEditor.updateTemplate(data.template.browser);
  paletteTemplateEditor.updateData(data.template.palette, data.pywalColors);

  setDebuggingInfo(data.debuggingInfo);
}

function handleExtensionMessage({ action, data }: IExtensionMessage) {
  switch (action) {
    case EXTENSION_MESSAGES.INITIAL_DATA_SET:
      setInitialData(data);
      break;
    case EXTENSION_MESSAGES.THEME_SET:
      colorpicker.update(data.pywalColors, data.customColors, data.template.palette);
      browserTemplateEditor.updateTemplate(data.template.browser);
      paletteTemplateEditor.updateData(data.template.palette, data.pywalColors);
      document.body.classList.add(ENABLED_BODY_CLASS);
      break;
    case EXTENSION_MESSAGES.CUSTOM_COLORS_SET:
      colorpicker.setCustomColors(data);
      colorpicker.updateSelected();
      break;
    case EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET:
      colorpicker.setPaletteTemplate(data);
      colorpicker.updateSelected();
      paletteTemplateEditor.updateTemplate(data);
      break;
    case EXTENSION_MESSAGES.BROWSER_THEME_TEMPLATE_SET:
      browserTemplateEditor.updateTemplate(data);
      break;
    case EXTENSION_MESSAGES.THEME_MODE_SET:
      themepicker.setSelectedMode(data.mode, data.templateMode);
      break;
    case EXTENSION_MESSAGES.TEMPLATE_THEME_MODE_SET:
      themepicker.setTemplateBodyClass(data);
      break;
    case EXTENSION_MESSAGES.OPTION_SET:
      updateOptionState(data);
      break;
    case EXTENSION_MESSAGES.NOTIFCATION:
      createNotification(data);
      break;
    case EXTENSION_MESSAGES.DEBUGGING_OUTPUT:
      writeOutput(data);
      break;
    case EXTENSION_MESSAGES.DEBUGGING_INFO_SET:
      setDebuggingInfo(data);
      break;
    default:
      break;
  }
}

function setupListeners() {
  overlay.addEventListener('click', closeDialog);
  disableButton.addEventListener('click', onDisableClicked);
  fetchButton.addEventListener('click', Messenger.UI.requestFetch);
  themeButton.addEventListener('click', () => openDialog(themepicker, themeButton));
  fontSizeSaveInput.addEventListener('change', Utils.debounce(onFontSizeSave, 500));

  autoTimeStartInput.addEventListener('change', Utils.debounce(() => {
    onTimeIntervalSave(autoTimeStartInput, EXTENSION_OPTIONS.AUTO_TIME_START);
  }, 500));

  autoTimeEndInput.addEventListener('change', Utils.debounce(() => {
    onTimeIntervalSave(autoTimeEndInput, EXTENSION_OPTIONS.AUTO_TIME_END);
  }, 500));

  helpToggleButtons.forEach((button: HTMLElement) => {
    button.addEventListener('click', () => onHelpToggle(button));
  });

  settingCardHeaders.forEach((header: HTMLElement) => {
    header.addEventListener('click', () => Utils.toggleOpen(header.parentElement));
  });

  optionButtons.forEach((button: HTMLButtonElement) => {
    const option = button.getAttribute('data-option');
    button.addEventListener('click', onOptionClicked);

    if (option) {
      optionButtonsLookup[option] = button;
    } else {
      console.warn('Found option button with no "data-option" attribute: ', button);
    }
  });

  browser.runtime.onMessage.addListener(handleExtensionMessage);
}

setupListeners();

Messenger.UI.requestInitialData();
Utils.setVersionLabel(versionLabel);
