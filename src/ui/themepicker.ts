import { Dialog } from './dialog';
import { ThemeModes } from '../definitions';
import { requestThemeModeSet } from './messenger';
import * as Utils from './utils';

export class Themepicker extends Dialog {
  private themeSelectButton: HTMLElement;
  private modeButtons: NodeListOf<HTMLElement>;

  constructor() {
    super('themepicker');

    this.themeSelectButton = document.getElementById('theme-select');
    this.modeButtons = document.querySelectorAll('button[data-theme]');
    this.setupListeners();
  }

  private setupListeners() {
    this.modeButtons.forEach((themeButton) => {
      themeButton.addEventListener('click', this.onSetMode.bind(this));
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

  private onSetMode(e: Event) {
    const target = <HTMLElement>e.target;
    const mode = <ThemeModes>target.getAttribute('data-theme');

    this.selectMode(target, mode);
    requestThemeModeSet(mode);
  }

  public setSelectedMode(mode: ThemeModes) {
    for (let i = 0; i < this.modeButtons.length; i++) {
      const button = this.modeButtons[i];
      const buttonMode= button.getAttribute('data-theme');
      if (buttonMode === mode) {
        this.selectMode(button, mode);
        break;
      }
    }
  }
}
