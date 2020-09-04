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

import {
  THEME_TEMPLATE_DATA,
  PALETTE_TEMPLATE_DATA,
} from '@config/template-data';

import * as Utils from '@utils/dom';
import Messenger from '@communication/messenger';

import Dialog from './components/dialog';
import Colorpicker from './components/colorpicker';
import Themepicker from './components/themepicker';

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

const paletteContent = <HTMLDivElement>document.getElementById('palette-content');
const paletteTemplateContent = <HTMLDivElement>document.getElementById('palette-template-content');
const paletteTemplateResetButton = <HTMLButtonElement>document.getElementById('palette-template-reset');
const paletteTemplateCurrentButton = <HTMLButtonElement>document.getElementById('palette-template-current');

const themeTemplateContent = <HTMLDivElement>document.getElementById('theme-template-content');
const themeTemplateResetButton = <HTMLButtonElement>document.getElementById('theme-template-reset');

const notificationContainer = <HTMLDivElement>document.getElementById('notification-container');
const notificationTemplate = <HTMLTemplateElement>document.getElementById('notification-template');

const colorpicker = new Colorpicker();
const themepicker = new Themepicker();

let currentDialog: Dialog = null;
let pywalColors: IPywalColors = null;
let template: IThemeTemplate = null;

const optionButtonsLookup: INodeLookup = {};
const paletteTemplateInputLookup: INodeLookup = {};
const themeTemplateInputLookup: INodeLookup = {};

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

function onColorClicked(e: Event) {
  const element = <HTMLElement>e.target;
  openDialog(colorpicker, element);
  colorpicker.updateSelected();
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
  pywalColors = null;
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

function onPaletteTemplateInputChanged(e: Event) {
  const target = <HTMLInputElement>e.target;
  const targetId = target.getAttribute('data-target');
  const { value } = target;

  if (!template.palette.hasOwnProperty(targetId)) {
    console.error(`Invalid/missing 'data-target' attribute on palette template input: ${targetId}`);
    return;
  }

  if (target.checkValidity()) {
    const index = parseInt(value, 10);
    template.palette[targetId] = index;
    updatePaletteTemplateColorPreview(target, pywalColors, index);
    savePaletteTemplate();
  }
}

function onThemeTemplateInputChanged(target: HTMLSelectElement) {
  const targetId = target.getAttribute('data-target');
  const { value } = <HTMLOptionElement>target[target.selectedIndex];

  if (!template.browser.hasOwnProperty(targetId)) {
    console.error(`Invalid 'data-target' attribute on theme template input: ${targetId}`);
    return;
  }

  if (Object.keys(PaletteColors).includes(value)) {
    console.error(`Invalid palette color id was selected: ${value}. No such value in the PaletteColors enum`);
    return;
  }

  template.browser[targetId] = <PaletteColors>value;

  saveThemeTemplate();
}

function savePaletteTemplate() {
  if (template === null || !template.hasOwnProperty('palette')) {
    console.error(`Template is null or the palette template is not set: ${template}`);
    return;
  }

  Messenger.UI.requestPaletteTemplateSet(template.palette);
}

function onPaletteTemplateUseCurrent() {
  Object.values(PaletteColors).forEach((targetId) => {
    const { index } = colorpicker.getSelectedData(targetId);
    const inputElement = <HTMLInputElement>paletteTemplateInputLookup[targetId];

    if (index === null) {
      console.log(`Palette color '${targetId}' is set to a custom color and can not be used`);
      return;
    }

    if (inputElement === null) {
      console.error(`Could not find palette template id with target: ${targetId}`);
      return;
    }

    updatePaletteTemplateColorPreview(inputElement, pywalColors, index);
    inputElement.value = index.toString();
    template.palette[targetId] = index;
  });

  savePaletteTemplate();
}

function saveThemeTemplate() {
  if (template === null || !template.hasOwnProperty('browser')) {
    console.error(`Template is null or the browser template is not set: ${template}`);
    return;
  }

  Messenger.UI.requestThemeTemplateSet(template.browser);
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

function updatePaletteTemplateColorPreview(
  element: HTMLElement,
  updatedPywalColors: IPywalColors,
  index: number,
) {
  const previewElement = <HTMLElement>element.previousElementSibling;

  if (!previewElement) {
    console.error('Could not find preview element as sibling to:', element);
    return;
  }

  if (index < 0 || index >= PYWAL_PALETTE_LENGTH) {
    console.error(`Could not show color preview, index is invalid: ${index}`);
    return;
  }

  if (updatedPywalColors !== null) {
    previewElement.style.backgroundColor = updatedPywalColors[index];
  }
}

// TODO: Write generic function for updating template inputs
function updatePaletteTemplateInputs(
  updatedTemplate: IPaletteTemplate,
  updatedPywalColors: IPywalColors,
) {
  Object.keys(updatedTemplate).forEach((key) => {
    const element = <HTMLInputElement>paletteTemplateInputLookup[key];

    if (element) {
      const index = updatedTemplate[key];
      element.value = index.toString();
      updatePaletteTemplateColorPreview(element, updatedPywalColors, index);
    } else {
      console.error(`Found unhandled palette template target: ${key}`);
    }
  });
}

function updateBrowserThemeTemplateInputs(updatedTemplate: IBrowserThemeTemplate) {
  Object.keys(updatedTemplate).forEach((key) => {
    const element = <HTMLSelectElement>themeTemplateInputLookup[key];

    if (element) {
      const defaultValue = updatedTemplate[key];
      element.value = defaultValue;
    } else {
      console.error(`Found unhandled theme template target: ${key}`);
    }
  });
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
      /**
       * The notification might already be deleted if the
       * MAX_SIMULTANEOUS_NOTIFICATIONS treshold is reached
       */
      notificationContainer.removeChild(containerElement);
    }
  }, NOTIFICATION_TIMEOUT);
}

function createThemeTemplateContent() {
  const themeTemplate = <HTMLTemplateElement>document.getElementById('theme-template');
  const selectElement = <HTMLSelectElement>document.createElement('select');

  selectElement.classList.add('clickable');

  Object.values(PaletteColors).forEach((color) => {
    const optionElement = <HTMLOptionElement>document.createElement('option');
    optionElement.innerText = color;
    selectElement.appendChild(optionElement);
  });

  THEME_TEMPLATE_DATA.forEach((item: ITemplateItem) => {
    const clone = <HTMLElement>themeTemplate.content.cloneNode(true);
    const titleElement = <HTMLParagraphElement>clone.querySelector('.setting-title');
    const contentElement = <HTMLParagraphElement>clone.querySelector('.setting-description');
    const container = <HTMLElement>clone.querySelector('.setting');
    const selectElementClone = <HTMLSelectElement>selectElement.cloneNode(true);

    titleElement.innerText = item.title;
    contentElement.innerText = item.description;
    selectElementClone.setAttribute('data-target', item.target);

    selectElementClone.addEventListener('change', () => onThemeTemplateInputChanged(selectElementClone));
    themeTemplateInputLookup[item.target] = selectElementClone;

    container.appendChild(selectElementClone);
    themeTemplateContent.appendChild(clone);
  });
}

// TODO: Create generic function for creating these elements
function createPaletteItem(
  parent: HTMLElement,
  base: HTMLTemplateElement,
  item: ITemplateItem,
) {
  const clone = <HTMLElement>base.content.cloneNode(true);
  const titleElement = <HTMLParagraphElement>clone.querySelector('.setting-title');
  const contentElement = <HTMLParagraphElement>clone.querySelector('.setting-description');
  const buttonElement = <HTMLButtonElement>clone.querySelector('button');

  titleElement.innerText = item.title;
  contentElement.innerText = item.description;
  buttonElement.setAttribute('data-target', item.target);
  buttonElement.style.backgroundColor = `var(${item.cssVariable})`;

  buttonElement.addEventListener('click', onColorClicked);

  parent.appendChild(clone);
}

function createPaletteTemplateItem(
  parent: HTMLElement,
  base: HTMLTemplateElement,
  item: ITemplateItem,
) {
  const clone = <HTMLElement>base.content.cloneNode(true);
  const titleElement = <HTMLParagraphElement>clone.querySelector('.setting-title');
  const contentElement = <HTMLParagraphElement>clone.querySelector('.setting-description');
  const inputElement = <HTMLInputElement>clone.querySelector('input');
  const maxValue = (PYWAL_PALETTE_LENGTH - 1).toString();

  titleElement.innerText = item.title;
  contentElement.innerText = item.description;
  inputElement.setAttribute('data-target', item.target);
  inputElement.max = maxValue;

  inputElement.addEventListener('change', onPaletteTemplateInputChanged);
  paletteTemplateInputLookup[item.target] = inputElement;

  parent.appendChild(clone);
}

function createPaletteContent() {
  const paletteTemplate = <HTMLTemplateElement>document.getElementById('palette-template');
  const paletteEditTemplate = <HTMLTemplateElement>document.getElementById('palette-edit-template');

  if (!paletteTemplate || !paletteEditTemplate) {
    console.error('Missing required template in HTML-file for the palette');
    return;
  }

  PALETTE_TEMPLATE_DATA.forEach((item: ITemplateItem) => {
    createPaletteItem(paletteContent, paletteTemplate, item);
    createPaletteTemplateItem(paletteTemplateContent, paletteEditTemplate, item);
  });
}

function setInitialData(data: IInitialData) {
  themepicker.setSelectedMode(data.themeMode, data.templateThemeMode);

  if (data.isApplied) {
    toggleIsAppliedBodyClass();
  }

  data.options.forEach((optionData) => {
    updateOptionState(optionData);
  });

  colorpicker.setData(data.pywalColors, data.customColors, data.template.palette);
  colorpicker.updateSelected();

  updatePaletteTemplateInputs(data.template.palette, data.pywalColors);
  updateBrowserThemeTemplateInputs(data.template.browser);
  setDebuggingInfo(data.debuggingInfo);

  pywalColors = data.pywalColors;
  template = data.template;
}

function handleExtensionMessage({ action, data }: IExtensionMessage) {
  switch (action) {
    case EXTENSION_MESSAGES.INITIAL_DATA_SET:
      setInitialData(data);
      break;
    case EXTENSION_MESSAGES.PYWAL_COLORS_SET:
      colorpicker.setPywalColors(data);
      colorpicker.setCustomColors(null);
      colorpicker.updateSelected();
      updatePaletteTemplateInputs(template.palette, data);
      document.body.classList.add(ENABLED_BODY_CLASS);
      pywalColors = data;
      break;
    case EXTENSION_MESSAGES.CUSTOM_COLORS_SET:
      colorpicker.setCustomColors(data);
      colorpicker.updateSelected();
      break;
    case EXTENSION_MESSAGES.TEMPLATE_SET:
      colorpicker.setPaletteTemplate(data.palette);
      colorpicker.updateSelected();
      updateBrowserThemeTemplateInputs(data.browser);
      updatePaletteTemplateInputs(data.palette, pywalColors);
      break;
    case EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET:
      colorpicker.setPaletteTemplate(data);
      colorpicker.updateSelected();
      updatePaletteTemplateInputs(data, pywalColors);
      template.palette = data;
      break;
    case EXTENSION_MESSAGES.BROWSER_THEME_TEMPLATE_SET:
      updateBrowserThemeTemplateInputs(data);
      template.browser = data;
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

  themeTemplateResetButton.addEventListener('click', Messenger.UI.requestThemeTemplateReset);

  paletteTemplateCurrentButton.addEventListener('click', onPaletteTemplateUseCurrent);
  paletteTemplateResetButton.addEventListener('click', Messenger.UI.requestPaletteTemplateReset);

  helpToggleButtons.forEach((button: HTMLElement) => {
    button.addEventListener('click', () => onHelpToggle(button));
  });

  settingCardHeaders.forEach((header: HTMLElement) => {
    header.addEventListener('click', () => Utils.toggleOpen(header.parentElement));
  });

  optionButtons.forEach((button: HTMLElement) => {
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
createPaletteContent();
createThemeTemplateContent();

Messenger.UI.requestInitialData();
Utils.setVersionLabel(versionLabel);
