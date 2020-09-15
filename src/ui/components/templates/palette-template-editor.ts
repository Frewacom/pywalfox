import {
  IPywalColors,
  ITemplateItem,
  IPaletteTemplate,
  PaletteColors,
  ValueOf,
} from '@definitions';

import { PALETTE_TEMPLATE_DATA } from '@config/template-data';

import {
  requestPaletteTemplateSet,
  requestPaletteTemplateReset,
} from '@communication/content-scripts/ui';

import { PYWAL_PALETTE_LENGTH } from '@config/general';

import Dialog from '../dialogs/dialog';
import Colorpicker from '../dialogs/colorpicker';
import TemplateEditor from './template-editor';

type IDialogOpenCallback = (dialog: Dialog, element: HTMLElement) => void;

export default class PaletteTemplateEditor extends TemplateEditor<IPaletteTemplate> {
  private paletteContentElement: HTMLDivElement;
  private loadFromCurrentButton: HTMLButtonElement;
  private pywalColors: IPywalColors;

  private colorpicker: Colorpicker;
  private dialogOpenCallback: IDialogOpenCallback;

  constructor(colorpicker: Colorpicker, dialogOpenCallback: IDialogOpenCallback) {
    super(
      'palette-template-content',
      'palette-template-scope',
      'palette-template-scope-switch',
      'palette-template-reset',
     );

     this.colorpicker = colorpicker;
     this.dialogOpenCallback = dialogOpenCallback;
  }

  private updateColorPreview(element: HTMLInputElement, index: number) {
    const previewElement = <HTMLElement>element.previousElementSibling;

    if (!previewElement) {
      console.error('Could not find preview element as sibling to:', element);
      return;
    }

    if (index < 0 || index >= PYWAL_PALETTE_LENGTH) {
      console.error(`Could not show color preview, index is invalid: ${index}`);
      return;
    }

    if (this.pywalColors !== null) {
      previewElement.style.backgroundColor = this.pywalColors[index];
    }
  }

  private onInputChanged(element: HTMLInputElement, targetId: string) {
    const template = this.getTemplateForCurrentScope();
    const { value } = element;

    if (!template.hasOwnProperty(targetId)) {
      console.error(`
        Invalid/missing 'data-target' attribute on palette template input: ${targetId}
      `);
      return;
    }

    if (element.checkValidity()) {
      const index = parseInt(value, 10);
      template[targetId] = index;
      this.updateColorPreview(element, index);
      requestPaletteTemplateSet({ [targetId]: index });
    }
  }

  private onLoadFromCurrent() {
    const changes: Partial<IPaletteTemplate> = {};
    const template = this.getTemplateForCurrentScope();

    Object.values(PaletteColors).forEach((targetId: string) => {
      const { index } = this.colorpicker.getSelectedData(targetId);
      const inputElement = <HTMLInputElement>this.inputElementLookup[targetId];

      if (index === null) {
        console.log(`Palette color '${targetId}' is set to a custom color and can not be used`);
        return;
      }

      if (inputElement === null) {
        console.error(`Could not find palette template id with target: ${targetId}`);
        return;
      }

      this.updateColorPreview(inputElement, index);
      inputElement.value = index.toString();
      changes[targetId] = index;
      template[targetId] = index;
    });

    requestPaletteTemplateSet(changes);
  }

  private onColorClicked(element: HTMLButtonElement) {
    this.dialogOpenCallback(this.colorpicker, element);
    this.colorpicker.updateSelected();
  }

  private createPaletteItem(
    parent: HTMLElement,
    base: HTMLTemplateElement,
    item: ITemplateItem,
  ) {
    const clone = <HTMLElement>base.content.cloneNode(true);
    const titleElement = <HTMLParagraphElement>clone.querySelector('.setting-title');
    const contentElement = <HTMLParagraphElement>clone.querySelector('.setting-description');
    const buttonElement = <HTMLButtonElement>clone.querySelector('button');

    titleElement.innerText = item.title;
    contentElement.innerText = item.description;
    buttonElement.setAttribute('data-target', item.target);
    buttonElement.style.backgroundColor = `var(${item.cssVariable})`;

    buttonElement.addEventListener('click', () => this.onColorClicked(buttonElement));

    parent.appendChild(clone);
  }

  private createPaletteTemplateItem(
    parent: HTMLElement,
    base: HTMLTemplateElement,
    item: ITemplateItem,
  ) {
    const clone = <HTMLElement>base.content.cloneNode(true);
    const titleElement = <HTMLParagraphElement>clone.querySelector('.setting-title');
    const contentElement = <HTMLParagraphElement>clone.querySelector('.setting-description');
    const inputElement = <HTMLInputElement>clone.querySelector('input');
    const maxValue = (PYWAL_PALETTE_LENGTH - 1).toString();

    titleElement.innerText = item.title;
    contentElement.innerText = item.description;
    inputElement.setAttribute('data-target', item.target);
    inputElement.max = maxValue;

    inputElement.addEventListener('change', () => this.onInputChanged(inputElement, item.target));
    this.inputElementLookup[item.target] = inputElement;

    parent.appendChild(clone);
  }

  protected setup() {
    this.paletteContentElement = <HTMLDivElement>document.getElementById('palette-content');
    this.loadFromCurrentButton = <HTMLButtonElement>document.getElementById('palette-template-current');

    this.loadFromCurrentButton.addEventListener('click', this.onLoadFromCurrent.bind(this));
  }

  protected insertDynamicContent() {
    const paletteTemplate = <HTMLTemplateElement>document.getElementById('palette-template');
    const paletteEditTemplate = <HTMLTemplateElement>document.getElementById('palette-edit-template');

    if (!paletteTemplate || !paletteEditTemplate) {
      console.error('Missing required template in HTML-file for the palette');
      return;
    }

    PALETTE_TEMPLATE_DATA.forEach((item: ITemplateItem) => {
      this.createPaletteItem(this.paletteContentElement, paletteTemplate, item);
      this.createPaletteTemplateItem(this.contentElement, paletteEditTemplate, item);
    });
  }

  protected updateInput(element: HTMLInputElement, value: ValueOf<IPaletteTemplate>) {
    element.value = value.toString();
    this.updateColorPreview(element, value);
  }

  protected reset() {
    requestPaletteTemplateReset();
  }

  public updatePywalColors(pywalColors: IPywalColors, update = true) {
    this.pywalColors = pywalColors;
    update && this.updateInputs();
  }

  public updateData(template: IPaletteTemplate, pywalColors: IPywalColors) {
    // Set 'update' to false to make sure to not run 'this.updateInputs()' twice
    this.updateTemplate(template, false);
    this.updatePywalColors(pywalColors, false);
    this.updateInputs();
  }
}
