import {
  IExtensionMessage,
  IColorschemeTemplate,
  ITimeIntervalEndpoint,
  IPaletteTemplate,
  IThemeTemplate,
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
  BROWSER_TEMPLATE_DATA,
  PALETTE_TEMPLATE_DATA,
} from '@config/template-data';

import * as Utils from '@utils/dom';
import Messenger from '@communication/messenger';

import Dialog from './components/dialog';
import Colorpicker from './components/colorpicker';
import Themepicker from './components/themepicker';

import { render, html } from 'uhtml';

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

const paletteTemplateResetButton = <HTMLButtonElement>document.getElementById('palette-template-reset');
const paletteTemplateCurrentButton = <HTMLButtonElement>document.getElementById('palette-template-current');
const themeTemplateResetButton = <HTMLButtonElement>document.getElementById('theme-template-reset');

const notificationContainer = <HTMLDivElement>document.getElementById('notification-container');
const notificationTemplate = <HTMLTemplateElement>document.getElementById('notification-template');

const colorpicker = new Colorpicker();
const themepicker = new Themepicker();

let currentDialog: Dialog = null;
let pywalColors: IPywalColors = null;
let template: IColorschemeTemplate = null;

const optionButtonsLookup: INodeLookup = {};
const paletteTemplateInputLookup: INodeLookup = {};
const browserTemplateInputLookup: INodeLookup = {};

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
    renderNotification({
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

  renderNotification({ title: 'Auto mode', message: 'Start time is greater than end time', error: true });
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

function onBrowserTemplateInputChanged(e: Event) {
  const target = <HTMLSelectElement>e.target;
  const targetId = target.getAttribute('data-target');
  const value = target.value;

  if (!template.browser.hasOwnProperty(targetId)) {
    console.error(`Invalid 'data-target' attribute on browser template input: ${target}`);
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

function updateThemeTemplateInputs(updatedTemplate: IThemeTemplate) {
  Object.keys(updatedTemplate).forEach((key) => {
    const element = <HTMLSelectElement>browserTemplateInputLookup[key];

    if (element) {
      const defaultValue = updatedTemplate[key];
      element.value = defaultValue;
    } else {
      console.error(`Found unhandled theme template target: ${key}`);
    }
  });
}

function createNotification({ title, message, error }: INotificationData) {
  return html`
    <div class="${['notification', 'box', 'row', 'v-center', error && 'error'].join(' ')}">
      <i class="icon-sm" icon=${error ? 'error' : 'bell'}></i>
      <p class="notification-title">${title}</p>
      <p class="notification-content">${message}</p>
      <button class="btn notification-close" onclick=${() => console.log('close')}></button>
    </div>
  `;
}

// TODO: Add support for rendering multiple notifications at the same time
// TODO: Add close button handler
// TODO: Add deletion of notification after NOTIFICATION_TIMEOUT has passed
function renderNotification(data: INotificationData) {
  const notificationElement = createNotification(data);

  render(notificationContainer, notificationElement);

  /* if (notificationContainer.childElementCount > 0) { */
  /*   const notification = notificationContainer.firstElementChild; */

  /*   // Trigger fadeout animation */
  /*   notification.classList.remove('fadeout'); */

  /*   // Wait for animation and rerender with the new notification */
  /*   setTimeout(() => render(notificationContainer, notificationElement), NOTIFICATION_TIMEOUT); */
  /* } else { */
  /* } */
}

function createBrowserTemplateItem(item: ITemplateItem) {
  const { title, description, target } = item;

  return html`
    <div class="setting row expand space-between v-center">
      <div class="box column align-left">
        <p class="setting-title">${title}</p>
        <p class="setting-description">${description}</p>
      </div>
      <select
        class="clickable"
        data-target=${target}
        onchange=${onBrowserTemplateInputChanged}
        ref=${(ref: HTMLElement) => browserTemplateInputLookup[target] = ref}
      >
        ${Object.values(PaletteColors).map((color) => html`<option>${color}</option>`)}
      </select>
    </div>
  `;
}

function createPaletteItem({ title, description, target, cssVariable }: ITemplateItem) {
  return html`
    <div class="setting row expand space-between v-center">
      <div class="box column align-left">
        <p class="setting-title">${title}</p>
        <p class="setting-description">${description}</p>
      </div>
      <button
        data-target=${target}
        onclick=${onColorClicked}
        class="btn btn-color dialog-arrow"
        style="${`background-color:var(${cssVariable})`}"
      />
    </div>
  `;
}

function createPaletteTemplateItem({ title, description, target }: ITemplateItem) {
  return html`
    <div class="setting row expand space-between v-center">
      <div class="box column align-left">
        <p class="setting-title">${title}</p>
        <p class="setting-description">${description}</p>
      </div>
      <div class="box row v-center">
        <div class="btn btn-color color-preview margin-right-sm"></div>
        <input
          type="number"
          data-target=${target}
          min="0"
          max=${PYWAL_PALETTE_LENGTH - 1}
          onchange=${onPaletteTemplateInputChanged}
          ref=${(ref: HTMLElement) => paletteTemplateInputLookup[target] = ref}
        />
      </div>
    </div>
  `;
}

function renderDynamicContent() {
  const paletteContent = document.getElementById('palette-content');
  const paletteTemplateContent = document.getElementById('palette-template-content');
  const browserTemplateContent = document.getElementById('theme-template-content');

  render(paletteContent, html`${PALETTE_TEMPLATE_DATA.map(createPaletteItem)}`);
  render(paletteTemplateContent, html`${PALETTE_TEMPLATE_DATA.map(createPaletteTemplateItem)}`);
  render(browserTemplateContent, html`${BROWSER_TEMPLATE_DATA.map(createBrowserTemplateItem)}`)
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
  updateThemeTemplateInputs(data.template.browser);
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
      updateThemeTemplateInputs(data.browser);
      updatePaletteTemplateInputs(data.palette, pywalColors);
      break;
    case EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET:
      colorpicker.setPaletteTemplate(data);
      colorpicker.updateSelected();
      updatePaletteTemplateInputs(data, pywalColors);
      template.palette = data;
      break;
    case EXTENSION_MESSAGES.THEME_TEMPLATE_SET:
      updateThemeTemplateInputs(data);
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
      renderNotification(data);
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
renderDynamicContent();

Messenger.UI.requestInitialData();
Utils.setVersionLabel(versionLabel);
