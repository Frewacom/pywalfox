import { Dialog } from './dialog';
import { ThemeModes } from '../definitions';
import { requestThemeModeSet } from './messenger';
import * as Utils from './utils';

interface ModeLookup {
  [key: string]: HTMLElement;
}

export class Themepicker extends Dialog {
  private themeSelectButton: HTMLElement;
  private modeButtons: NodeListOf<HTMLElement>;
  private modeLookup: ModeLookup;

  constructor() {
    super('themepicker');

    this.themeSelectButton = document.getElementById('theme-select');
    this.modeButtons = document.querySelectorAll('button[data-theme]');
    this.modeLookup = {};
    this.setupListeners();
  }

  private setupListeners() {
    this.modeButtons.forEach((button: HTMLElement) => {
      const buttonMode: string = button.getAttribute('data-theme');
      this.modeLookup[buttonMode] = button; // For setting the selected button when changing modes
      button.addEventListener('click', () => this.onSetMode(button));
    });
  }

  private selectMode(target: HTMLElement, mode: ThemeModes) {
    if (this.selected !== null) {
      Utils.deselect(this.selected);
    }

    if (this.themeSelectButton !== null) {
      switch (mode) {
        case 'dark':
          this.themeSelectButton.innerHTML = `<i icon="moon"></i>Dark mode`;
          break;
        case 'light':
          this.themeSelectButton.innerHTML = `<i icon="sun"></i>Light mode`;
          break;
        case 'auto':
          this.themeSelectButton.innerHTML = `<i icon="auto"></i>Auto mode`;
          break;
        default:
          console.error('Invalid theme type');
      }
    }

    Utils.select(target);
    this.selected = target;
  }

  private toggleBodyClass(mode: ThemeModes) {
    let className = mode;
    if (mode === ThemeModes.Auto) {
      // TODO: If auto, we need to get the current theme from background script
    }

    document.body.classList.toggle(className);
  }

  private onSetMode(target: HTMLElement) {
    const mode = <ThemeModes>target.getAttribute('data-theme');
    this.toggleBodyClass(mode);
    this.selectMode(target, mode);
    requestThemeModeSet(mode);
  }

  public setSelectedMode(mode: ThemeModes) {
    const targetButton: HTMLElement = this.modeLookup[mode];
    if (targetButton) {
      this.selectMode(targetButton, mode);
    } else {
      console.error(`Could not find target button associated with the mode: ${mode}`);
    }

    this.toggleBodyClass(mode);
  }
}
