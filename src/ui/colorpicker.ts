import { Dialog } from './dialog';
import { IPywalColors, IColorschemeTemplate } from '../definitions';
import { PYWAL_PALETTE_LENGTH } from '../config';
import * as Utils from './utils';

export class Colorpicker extends Dialog {
  private grid: HTMLElement;
  private customColorButton: HTMLElement;
  private undoButton: HTMLElement;
  private pywalColors: IPywalColors;

  constructor() {
    super('colorpicker');

    this.grid = document.getElementById('colorpicker-grid');
    this.customColorButton = document.getElementById('colorpicker-custom');
    this.undoButton = document.getElementById('colorpicker-undo');

    this.pywalColors = null;

    this.populateColorGrid();
    this.setupListeners();
  }

  private setupListeners() {
    this.customColorButton.addEventListener('click', this.onSetCustomColor.bind(this));
    this.undoButton.addEventListener('click', this.onUndo.bind(this));
  }

  private populateColorGrid() {
    for (let i = 0; i < PYWAL_PALETTE_LENGTH; i++) {
      this.addColorElement(i);
    }
  }

  private addColorElement(index: number) {
    const button = <HTMLElement>document.createElement('button');
    button.setAttribute('type', 'colorpicker-color');
    button.setAttribute('data-color-index', index.toString());
    button.addEventListener('click', this.onSetColor.bind(this));
    this.grid.appendChild(button);
  }

  private setSelectedColor(element: HTMLElement) {
    if (element === null) {
      if (this.selected !== null) {
        Utils.deselect(this.selected);
      }
      return;
    }

    if (this.selected !== null) {
      Utils.deselect(this.selected);
    }

    Utils.select(element);
    this.selected = element;
  }

  private onSetColor(e: Event) {
    const element = <HTMLElement>e.target;
    this.setSelectedColor(element);
  }

  private onSetCustomColor(e: Event) {
    console.log('Custom color');
  }

  private onUndo(e: Event) {
    console.log('Undo');
  }

  public setPalette(pywalColors: IPywalColors) {
    if (pywalColors !== null) {
      this.grid.childNodes.forEach((element: HTMLElement, index: number) => {
        element.style.backgroundColor = pywalColors[index];
      });
    } else {
      this.grid.childNodes.forEach((element: HTMLElement) => {
        element.style.backgroundColor = "";
      })
    }

    this.pywalColors = pywalColors;
  }

  public setSelectedColorForTarget(template: IColorschemeTemplate) {
    if (this.target === null) {
      return;
    }

    if (template === null || this.pywalColors === null) {
      this.setSelectedColor(null);
      return;
    }

    const targetColor = this.target.getAttribute('data-color');
    const colorIndex = template.palette[targetColor];
    const element: HTMLElement = document.querySelector(`button[data-color-index="${colorIndex}"]`);
    if (element) {
      this.setSelectedColor(element);
    } else {
      console.error(`Could not find color element with index: ${colorIndex}`);
    }
  }
}


