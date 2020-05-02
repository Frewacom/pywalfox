import { Dialog } from './dialog';
import { requestPaletteColorSet } from './messenger';
import { IPywalColors, IColorschemeTemplate } from '../definitions';
import { PYWAL_PALETTE_LENGTH } from '../config';
import * as Utils from './utils';

export class Colorpicker extends Dialog {
  private grid: HTMLElement;
  private customColorButton: HTMLInputElement;
  private undoButton: HTMLElement;
  private pywalColors: IPywalColors;
  private resetElement: HTMLElement;
  private selectedElement: HTMLElement;

  constructor() {
    super('colorpicker');

    this.grid = document.getElementById('colorpicker-grid');
    this.customColorButton = <HTMLInputElement>document.getElementById('colorpicker-custom');
    this.undoButton = document.getElementById('colorpicker-undo');

    this.pywalColors = null;
    this.resetElement = null;
    this.selectedElement = null;

    this.populateColorGrid();
    this.setupListeners();
  }

  private setupListeners() {
    this.customColorButton.addEventListener('change', this.onSetCustomColor.bind(this));
    this.undoButton.addEventListener('click', this.onUndo.bind(this));
  }

  private populateColorGrid() {
    for (let i = 0; i < PYWAL_PALETTE_LENGTH; i++) {
      this.addColorElement(i);
    }
  }

  private addColorElement(index: number) {
    const button = <HTMLElement>document.createElement('button');
    button.setAttribute('class', 'btn-palette-color');
    button.setAttribute('data-color-index', index.toString());
    button.addEventListener('click', this.onSetColor.bind(this));
    this.grid.appendChild(button);
  }

  private highlightSelectedColor(element: HTMLElement) {
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
    this.setCustomColor(element);
    this.selected = element;
  }

  private getSelectedPywalColor(selectedElement: HTMLElement) {
    if (this.pywalColors === null) {
      return null;
    }

    const colorIndex = parseInt(selectedElement.getAttribute('data-color-index'));
    const color = this.pywalColors[colorIndex];

    return color;
  }

  private setCustomColor(element: HTMLElement) {
    const color = element.style.backgroundColor;
    this.customColorButton.value = Utils.rgbToHex(color);
  }

  private updatePaletteColor(selectedElement: HTMLElement, customColor?: string) {
    if (this.pywalColors === null) {
      return;
    }

    const id = this.target.getAttribute('data-color');
    let color: string = customColor;

    if (!customColor) {
      color = this.getSelectedPywalColor(selectedElement);
    }

    requestPaletteColorSet(id, color);
  }

  private onSetColor(e: Event) {
    const element = <HTMLElement>e.target;
    this.updatePaletteColor(element);
    this.highlightSelectedColor(element);
    this.selectedElement = element;
  }

  private onSetCustomColor(e: Event) {
    const element = <HTMLInputElement>e.target;
    this.updatePaletteColor(element, element.value);
    this.highlightSelectedColor(element.parentElement);
    this.selectedElement = element;
  }

  private onUndo(e: Event) {
    if (this.selectedElement === null) {
      return;
    }

    const resetIndex = this.resetElement.getAttribute('data-color-index');
    const selectedIndex = this.selectedElement.getAttribute('data-color-index');
    if (resetIndex !== selectedIndex) {
      this.highlightSelectedColor(this.resetElement);
      this.selectedElement = null;
    }
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
      this.highlightSelectedColor(null);
      return;
    }

    const targetColor = this.target.getAttribute('data-color');
    const colorIndex = template.palette[targetColor];
    const element: HTMLElement = document.querySelector(`button[data-color-index="${colorIndex}"]`);

    if (element) {
      this.highlightSelectedColor(element);
      this.resetElement = element;
    } else {
      console.error(`Could not find color element with index: ${colorIndex}`);
    }
  }
}


