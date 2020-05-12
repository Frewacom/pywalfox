import * as Utils from './utils';

import { Dialog } from './dialog';
import { requestPaletteColorSet } from './messenger';
import { PYWAL_PALETTE_LENGTH } from '../config/general';

import {
  IPywalColors,
  IPaletteTemplate,
  IPalette,
  INodeLookup,
  PaletteColors
} from '../definitions';

export class Colorpicker extends Dialog {
  private grid: HTMLElement;
  private customColorButton: HTMLInputElement;
  private customColorButtonContainer: HTMLElement;
  private undoButton: HTMLElement;
  private pywalColors: IPywalColors;
  private customColors: Partial<IPalette>
  private resetElement: HTMLElement;
  private selectedElement: HTMLElement;
  private colorElementLookup: INodeLookup;

  constructor() {
    super('colorpicker');

    this.grid = document.getElementById('colorpicker-grid');
    this.customColorButton = <HTMLInputElement>document.getElementById('colorpicker-custom');
    this.customColorButtonContainer = document.getElementById('colorpicker-custom-container');
    this.undoButton = document.getElementById('colorpicker-undo');

    this.pywalColors = null;
    this.resetElement = null;
    this.selectedElement = null;

    this.customColors = {};
    this.colorElementLookup = {};

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
    button.setAttribute('class', 'btn btn-palette-color');
    button.setAttribute('data-color-index', index.toString());
    button.addEventListener('click', this.onSetColor.bind(this));
    this.grid.appendChild(button);
  }

  protected onOpen(currentTarget: HTMLElement, nextTarget: HTMLElement) {
    if (currentTarget !== null) {
      Utils.deselect(currentTarget.parentElement);
    }

    Utils.select(nextTarget.parentElement);
  }

  protected onClose(currentTarget: HTMLElement) {
    Utils.deselect(currentTarget.parentElement);
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

  // TODO: Custom color does not update its value when refetching colors and the dialog is open
  private setCustomColor(element: HTMLElement) {
    const color = element.style.backgroundColor;

    if (color) {
      this.customColorButton.value = Utils.rgbToHex(color);
    }
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

    this.customColors[<PaletteColors>id] = color;
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
    this.highlightSelectedColor(this.customColorButtonContainer);
    this.selectedElement = element;
  }

  private onUndo(e: Event) {
    if (this.selectedElement === null) {
      return;
    }

    // TODO: Add case for custom color

    const resetIndex = this.resetElement.getAttribute('data-color-index');
    const selectedIndex = this.selectedElement.getAttribute('data-color-index');
    if (resetIndex !== selectedIndex) {
      this.updatePaletteColor(this.resetElement);
      this.highlightSelectedColor(this.resetElement);
      this.selectedElement = null;
    }
  }

  public setPalette(pywalColors: IPywalColors) {
    if (pywalColors !== null) {
      this.grid.childNodes.forEach((element: HTMLElement, index: number) => {
        const color = pywalColors[index]
        element.style.backgroundColor = color;
        this.colorElementLookup[color] = element;
      });
    } else {
      this.grid.childNodes.forEach((element: HTMLElement) => {
        element.style.backgroundColor = "";
      });

      this.customColors = {};
      this.colorElementLookup = {};
    }

    this.pywalColors = pywalColors;
  }

  public setCustomColors(customColors: Partial<IPalette>) {
    this.customColors = customColors ? customColors : {};
  }

  public setSelectedColorForTarget(template: IPaletteTemplate) {
    if (this.target === null) {
      return;
    }

    if (template === null || this.pywalColors === null) {
      this.highlightSelectedColor(null);
      return;
    }

    const targetColor = this.target.getAttribute('data-color');
    const colorIndex = template[targetColor];

    let color: string;
    let element: HTMLElement;

    if (this.customColors !== null && this.customColors.hasOwnProperty(targetColor)) {
      color = this.customColors[<PaletteColors>targetColor];
      if (this.colorElementLookup.hasOwnProperty(color)) {
        element = this.colorElementLookup[color];
      } else {
        element = this.customColorButtonContainer;
      }
    } else {
      color = this.pywalColors[colorIndex];
      element = this.colorElementLookup[color];
    }

    if (element) {
      this.highlightSelectedColor(element);
      this.resetElement = element;
    } else {
      console.error(`Could not find color element with index: ${colorIndex}`);
    }
  }
}


