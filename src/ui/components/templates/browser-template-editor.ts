import {
  ITemplateItem,
  IBrowserThemeTemplate,
  PaletteColors,
  ValueOf,
} from '@definitions';

import { THEME_TEMPLATE_DATA } from '@config/template-data';

import {
  requestBrowserThemeTemplateSet,
  requestBrowserThemeTemplateReset,
} from '@communication/content-scripts/ui';

import TemplateEditor from './template-editor';

export default class BrowserTemplateEditor extends TemplateEditor<IBrowserThemeTemplate> {
  constructor() {
    super(
      'browser-template-content',
      'browser-template-scope',
      'browser-template-scope-switch',
      'browser-template-reset',
     );
  }

  private onInputChanged(element: HTMLSelectElement, targetId: string) {
    const template = this.getTemplateForCurrentScope();
    const { value } = <HTMLOptionElement>element[element.selectedIndex];

    if (!template.hasOwnProperty(targetId)) {
      console.error(`Invalid 'data-target' attribute on theme template input: ${targetId}`);
      return;
    }

    if (Object.keys(PaletteColors).includes(value)) {
      console.error(`
        Invalid palette color id was selected: ${value}. No such value in the PaletteColors enum
      `);
      return;
    }

    requestBrowserThemeTemplateSet({ [targetId]: value });
  }

  protected setup() {}

  protected insertDynamicContent() {
    const themeTemplate = <HTMLTemplateElement>document.getElementById('theme-template');
    const selectElement = <HTMLSelectElement>document.createElement('select');

    selectElement.classList.add('clickable');

    Object.values(PaletteColors).forEach((color) => {
      const optionElement = <HTMLOptionElement>document.createElement('option');
      optionElement.innerText = color;
      selectElement.appendChild(optionElement);
    });

    THEME_TEMPLATE_DATA.forEach((item: ITemplateItem) => {
      const clone = <HTMLElement>themeTemplate.content.cloneNode(true);
      const titleElement = <HTMLParagraphElement>clone.querySelector('.setting-title');
      const contentElement = <HTMLParagraphElement>clone.querySelector('.setting-description');
      const container = <HTMLElement>clone.querySelector('.setting');
      const selectElementClone = <HTMLSelectElement>selectElement.cloneNode(true);

      titleElement.innerText = item.title;
      contentElement.innerText = item.description;
      selectElementClone.setAttribute('data-target', item.target);

      selectElementClone.addEventListener('change', () => {
        this.onInputChanged(selectElementClone, item.target);
      });

      container.appendChild(selectElementClone);

      this.contentElement.appendChild(clone);
      this.inputElementLookup[item.target] = selectElementClone;
    });
  }

  protected updateInput(element: HTMLSelectElement, value: ValueOf<IBrowserThemeTemplate>) {
    element.value = value;
  }

  protected reset() {
    requestBrowserThemeTemplateReset();
  }
}
