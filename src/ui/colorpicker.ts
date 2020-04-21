import { IDialog } from './dialog';
import { IPywalColors } from '../definitions';
import { PYWAL_PALETTE_LENGTH } from '../config';
import * as Utils from './utils';

export class Colorpicker implements IDialog {
  private dialog: HTMLElement;
  private grid: HTMLElement;
  private customColorButton: HTMLElement;
  private undoButton: HTMLElement;

  private target: HTMLElement;
  private selected: HTMLElement;

  constructor() {
    this.dialog = document.getElementById('colorpicker');
    this.grid = document.getElementById('colorpicker-grid');
    this.customColorButton = document.getElementById('colorpicker-custom');
    this.undoButton = document.getElementById('colorpicker-undo');

    this.target = null;
    this.selected = null;

    this.setupListeners();
    this.populateColorGrid();
  }

  private setupListeners() {
    this.customColorButton.addEventListener('click', this.onSetCustomColor.bind(this));
    this.undoButton.addEventListener('click', this.onUndo.bind(this));
  }

  private populateColorGrid() {
    // debugging
    for (let i = 0; i < 18; i++) {
      this.addColorElement(i);
    }
  }

  private addColorElement(index: number) {
    const button = <HTMLElement>document.createElement('button');
    button.setAttribute('type', 'colorpicker-color');
    button.addEventListener('click', this.onSetColor.bind(this));
    this.grid.appendChild(button);
  }

  private onSetColor(e: Event) {
    const element = <HTMLElement>e.target;
    if (this.selected !== null) {
      Utils.deselect(this.selected);
    }

    Utils.select(element);
    this.selected = element;
  }

  private onSetCustomColor(e: Event) {
    console.log('Custom color');
  }

  private onUndo(e: Event) {
    console.log('Undo');
  }

  public open(target: HTMLElement) {
    Utils.open(this.dialog);
    Utils.select(target);

    if (this.selected !== null) {
      Utils.deselect(this.selected);
    }

    if (this.target !== null){
      Utils.deselect(this.target);
    }

    // TODO: Find the color in the palette corresponding to 'target'

    this.target = target;
  }

  public setPalette(pywalColors: IPywalColors) {
    this.grid.childNodes.forEach((element: HTMLElement, index: number) => {
      element.style.backgroundColor = pywalColors[index];
    });
  }

  public close() {
    Utils.close(this.dialog);
    Utils.deselect(this.target);

    this.target = null;
  }
}


