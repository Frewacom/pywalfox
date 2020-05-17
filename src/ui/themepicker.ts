import { Dialog } from './dialog';
import { ThemeModes, INodeLookup } from '../definitions';
import { requestThemeModeSet } from './messenger';
import * as Utils from './utils';

export class Themepicker extends Dialog {
  private themeSelectButton: HTMLElement;
  private modeButtons: NodeListOf<HTMLElement>;
  private modeLookup: INodeLookup;
  private currentClassName: ThemeModes;

  constructor() {
    super('themepicker');

    this.themeSelectButton = document.getElementById('theme-select');
    this.modeButtons = document.querySelectorAll('button[data-theme]');
    this.modeLookup = {};
    this.currentClassName = null;
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
        case ThemeModes.Dark:
          this.themeSelectButton.innerHTML = `<i icon="moon" class="icon-md"></i>Dark mode`;
          break;
        case ThemeModes.Light:
          this.themeSelectButton.innerHTML = `<i icon="sun" class="icon-md"></i>Light mode`;
          break;
        case ThemeModes.Auto:
          this.themeSelectButton.innerHTML = `<i icon="auto" class="icon-md"></i>Auto mode`;
          break;
        default:
          console.error('Invalid theme type');
      }
    }

    Utils.select(target);
    this.selected = target;
  }

  public setBodyClass(mode: ThemeModes) {
    if (mode === ThemeModes.Auto) {
      return;
    }

    if (this.currentClassName) {
      document.body.classList.remove(this.currentClassName);
    }

    this.currentClassName = mode;
    document.body.classList.add(this.currentClassName);
  }

  private onSetMode(target: HTMLElement) {
    const mode = <ThemeModes>target.getAttribute('data-theme');
    requestThemeModeSet(mode);
    this.setBodyClass(mode);
    this.selectMode(target, mode);
  }

  public setSelectedMode(mode: ThemeModes) {
    const targetButton: HTMLElement = this.modeLookup[mode];
    if (targetButton) {
      this.selectMode(targetButton, mode);
    } else {
      console.error(`Could not find target button associated with the mode: ${mode}`);
    }

    this.setBodyClass(mode);
  }
}
