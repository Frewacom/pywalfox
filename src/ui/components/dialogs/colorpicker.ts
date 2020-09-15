import {
  IPywalColors,
  IPaletteTemplate,
  IPalette,
  INodeLookup,
  PaletteColors,
} from '@definitions';

import { rgbToHex } from '@utils/colors';
import { setSelected, setDeselected } from '@utils/dom';
import { PYWAL_PALETTE_LENGTH } from '@config/general';
import { requestPaletteColorSet } from '@communication/content-scripts/ui';

import Dialog from './dialog';

import compare from 'just-compare';

export default class Colorpicker extends Dialog {
  private grid: HTMLElement;
  private customColorButton: HTMLInputElement;
  private customColorButtonContainer: HTMLElement;
  private undoButton: HTMLElement;
  private pywalColors: IPywalColors;
  private paletteTemplate: IPaletteTemplate;
  private customColors: Partial<IPalette>;
  private resetElement: HTMLElement;
  private resetCustomColor: string;
  private selectedElement: HTMLElement;
  private colorElementLookup: INodeLookup<HTMLElement>;

  constructor() {
    super('colorpicker');

    this.grid = document.getElementById('colorpicker-grid');
    this.customColorButton = <HTMLInputElement>document.getElementById('colorpicker-custom');
    this.customColorButtonContainer = document.getElementById('colorpicker-custom-container');
    this.undoButton = document.getElementById('colorpicker-undo');

    this.pywalColors = null;
    this.paletteTemplate = null;
    this.customColors = {};

    this.resetElement = null;
    this.resetCustomColor = null;
    this.selectedElement = null;

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
      setDeselected(currentTarget.parentElement);
    }

    setSelected(nextTarget.parentElement);
  }

  protected onClose(currentTarget: HTMLElement) {
    setDeselected(currentTarget.parentElement);
  }

  private highlightSelectedColor(element: HTMLElement) {
    if (element === null) {
      if (this.selected !== null) {
        setDeselected(this.selected);
      }
      return;
    }

    if (this.selected !== null) {
      setDeselected(this.selected);
    }

    setSelected(element);
    this.setCustomColor(element);
    this.selected = element;
  }

  private getSelectedPywalColor(selectedElement: HTMLElement) {
    if (this.pywalColors === null) {
      return null;
    }

    const colorIndex = parseInt(selectedElement.getAttribute('data-color-index'), 10);
    return this.pywalColors[colorIndex];
  }

  private updateCustomColorInputValue(color: string) {
    this.customColorButton.value = rgbToHex(color);
  }

  private setCustomColor(element: HTMLElement) {
    const color = element.style.backgroundColor;

    if (color) {
      this.updateCustomColorInputValue(color);
    }
  }

  private updatePaletteColor(selectedElement: HTMLElement, customColor?: string) {
    if (this.pywalColors === null) {
      return;
    }

    const id = this.target.getAttribute('data-target');
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

  private onUndo() {
    if (this.selectedElement === null) {
      return;
    }

    if (this.resetElement !== this.customColorButtonContainer) {
      const resetIndex = this.resetElement.getAttribute('data-color-index');
      const selectedIndex = this.selectedElement.getAttribute('data-color-index');

      if (resetIndex === selectedIndex) {
        // Same color as before, do nothing
        return;
      }
    } else {
      this.updateCustomColorInputValue(this.resetCustomColor);
    }

    this.updatePaletteColor(this.resetElement, this.resetCustomColor);
    this.highlightSelectedColor(this.resetElement);
    this.selectedElement = null;
  }

  public update(
    pywalColors: IPywalColors,
    customColors: Partial<IPalette>,
    template: IPaletteTemplate,
  ) {
    // TODO: This 'update' function should not be called at all unless
    //       'template' or 'customColors' has been updated
    const isTemplateEqual = compare(this.paletteTemplate, template);
    const isCustomColorsEqual = compare(this.customColors, customColors);
    const shouldUpdateResetElement = !isTemplateEqual || !isCustomColorsEqual;

    // TODO: Check if the call to 'this.setCustomColors' is needed
    this.setPywalColors(pywalColors);
    this.setCustomColors(customColors);
    this.setPaletteTemplate(template);

    this.updateSelected(shouldUpdateResetElement);
  }

  public setPywalColors(pywalColors: IPywalColors) {
    this.customColors = {};
    this.colorElementLookup = {};
    this.pywalColors = pywalColors;

    if (pywalColors !== null) {
      this.grid.childNodes.forEach((element: HTMLElement, index: number) => {
        const color = pywalColors[index];
        element.style.backgroundColor = color;
        this.colorElementLookup[color] = element;
      });
    } else {
      this.grid.childNodes.forEach((element: HTMLElement) => {
        element.style.backgroundColor = '';
      });
    }
  }

  public setPaletteTemplate(template: IPaletteTemplate) {
    this.paletteTemplate = template;
  }

  public setCustomColors(customColors: Partial<IPalette>) {
    this.customColors = customColors || {};
  }

  public getSelectedData(targetId: string) {
    let index: number = null;
    let element: HTMLElement = null;
    let color: string = null;

    if (this.customColors !== null && this.customColors.hasOwnProperty(targetId)) {
      color = this.customColors[<PaletteColors>targetId];
      if (this.colorElementLookup.hasOwnProperty(color)) {
        element = this.colorElementLookup[color];
        index = parseInt(element.getAttribute('data-color-index'), 10);
      } else {
        element = this.customColorButtonContainer;
      }
    } else {
      index = this.paletteTemplate[targetId];
      color = this.pywalColors[index];
      element = this.colorElementLookup[color];
    }

    if (!element) {
      console.error(`Could not find color element with index: ${index}`);
    }

    return { element, color, index };
  }

  public updateSelected(updateResetElement = true) {
    if (this.target === null) {
      return;
    }

    if (this.paletteTemplate === null || this.pywalColors === null) {
      this.highlightSelectedColor(null);
      return;
    }

    const targetId = this.target.getAttribute('data-target');
    const { element, color } = this.getSelectedData(targetId);

    this.highlightSelectedColor(element);

    if (updateResetElement) {
      this.resetElement = element;
      this.resetCustomColor = null;

      if (element === this.customColorButtonContainer) {
        this.updateCustomColorInputValue(color);
        this.resetCustomColor = color;
      }
    }
  }
}
