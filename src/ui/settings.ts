import { IDialog } from './dialog';
import * as Messenger from './messenger';
import { Colorpicker } from './colorpicker';
import { toggleOpen, open, close, isOpen } from './utils';
import { IPywalColors, IExtensionMessage } from '../definitions';
import { EXTENSION_MESSAGES } from '../config';

const fetchButton: HTMLElement = document.getElementById('fetch');
const disableButton: HTMLElement = document.getElementById('disable');
const colorButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-color]');
const settingCardHeaders: NodeListOf<HTMLElement> = document.querySelectorAll('.setting-card-header');
const debuggingOutput: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById('debugging-output');
const overlay: HTMLElement = document.getElementById('overlay');

const colorpicker = new Colorpicker();
let currentDialog: IDialog = null;

function openDialog(dialog: IDialog, target: HTMLElement) {
  const overlayOpen = isOpen(overlay);

  if (!overlayOpen) {
    open(overlay);
  }

  if (currentDialog !== null && currentDialog !== dialog) {
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

  if (isOpen(overlay)) {
    close(overlay);
  }
}

function writeOutput(message: string) {
  debuggingOutput.value += message + '\n';
  debuggingOutput.scrollTop = debuggingOutput.scrollHeight; // Scrolls to bottom of textarea
}

function onSettingCardClicked(header: HTMLElement) {
  toggleOpen(<HTMLElement>header.parentNode);
}

function onColorClicked(e: Event) {
  openDialog(colorpicker, <HTMLElement>e.target);
}

function onOverlayClicked(e: Event) {
  closeDialog();
}

fetchButton.addEventListener('click', Messenger.requestFetch);
disableButton.addEventListener('click', Messenger.requestDisable);
colorButtons.forEach((button: HTMLElement) => button.addEventListener('click', onColorClicked));
settingCardHeaders.forEach((header: HTMLElement) => header.addEventListener('click', () => onSettingCardClicked(header)));
overlay.addEventListener('click', onOverlayClicked);

browser.runtime.onMessage.addListener((message: IExtensionMessage) => {
  switch (message.action) {
    case EXTENSION_MESSAGES.PYWAL_COLORS_SET:
      colorpicker.setPalette(message.data);
      break;
    case EXTENSION_MESSAGES.OUTPUT:
      writeOutput(message.data);
      break;
  }
});

Messenger.requestPywalColors();
