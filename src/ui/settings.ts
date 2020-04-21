import { IDialog } from './dialog';
import { Colorpicker } from './colorpicker';
import { toggleOpen, open, close, isOpen } from './utils';

const colorButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-color]');
const settingCardHeaders: NodeListOf<HTMLElement> = document.querySelectorAll('.setting-card-header');
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

function onSettingCardClicked(header: HTMLElement) {
  toggleOpen(<HTMLElement>header.parentNode);
}

function onColorClicked(e: Event) {
  openDialog(colorpicker, <HTMLElement>e.target);
}

function onOverlayClicked(e: Event) {
  closeDialog();
}

colorButtons.forEach((button: HTMLElement) => button.addEventListener('click', onColorClicked));
settingCardHeaders.forEach((header: HTMLElement) => header.addEventListener('click', () => onSettingCardClicked(header)));
overlay.addEventListener('click', onOverlayClicked);

