import {
  INodeLookup,
  TemplateScopes,
} from '@definitions';

// TODO: Add method for setting the global template
export default abstract class TemplateEditor<T> {
  protected currentTemplate: T;
  protected globalTemplate: T;
  protected currentScope: TemplateScopes;

  protected contentElement: HTMLDivElement;
  protected scopeLabelElement: HTMLSpanElement;
  protected scopeSwitchButton: HTMLButtonElement;
  protected resetButton: HTMLButtonElement;

  protected inputElementLookup: INodeLookup<HTMLInputElement | HTMLSelectElement>;

  constructor(
    contentSelector: string,
    scopeSelector: string,
    scopeSwitchButtonSelector: string,
    resetButtonSelector: string,
  ) {
    this.contentElement = <HTMLDivElement>document.getElementById(contentSelector);
    this.scopeLabelElement = <HTMLSpanElement>document.getElementById(scopeSelector);
    this.scopeSwitchButton = <HTMLButtonElement>document.getElementById(scopeSwitchButtonSelector);
    this.resetButton = <HTMLButtonElement>document.getElementById(resetButtonSelector);

    this.inputElementLookup = {};

    this.setup();
    this.setupListeners();
    this.setScope(TemplateScopes.Current);

    this.insertDynamicContent();
  }

  private setupListeners() {
    this.scopeSwitchButton.addEventListener('click', this.switchScope.bind(this));
    this.resetButton.addEventListener('click', this.reset.bind(this));
  }

  protected updateInputs() {
    const template = this.getTemplateForCurrentScope();

    Object.keys(template).forEach((key: string) => {
      const element = this.inputElementLookup[key];

      if (element) {
        this.updateInput(element, template[key]);
      } else {
        console.error(`Missing input element for template target: ${key}`);
      }
    });
  }

  protected setScope(newScope: TemplateScopes) {
    if (newScope === TemplateScopes.Current) {
      newScope = TemplateScopes.Current;
      this.scopeSwitchButton.innerText = 'Edit global template';
    } else {
      newScope = TemplateScopes.Global;
      this.scopeSwitchButton.innerText = 'Edit current template';
    }

    this.scopeLabelElement.innerText = newScope;
    this.currentScope = newScope;
  }

  protected switchScope() {
    if (this.currentScope === TemplateScopes.Current) {
      this.setScope(TemplateScopes.Global);
    } else {
      this.setScope(TemplateScopes.Current);
    }

    this.updateInputs();
  }

  protected getTemplateForCurrentScope() {
    if (this.currentScope === TemplateScopes.Current) {
      return this.currentTemplate;
    }

    return this.globalTemplate;
  }

  protected checkIfShouldUpdate(scopeTarget: TemplateScopes, update: boolean) {
    this.currentScope !== scopeTarget && update && this.updateInputs();
  }

  public updateTemplate(template: T, update = true) {
    this.currentTemplate = template;
    this.checkIfShouldUpdate(TemplateScopes.Current, update);
  }

  public updateGlobalTemplate(template: T, update = true) {
    this.globalTemplate = template;
    this.checkIfShouldUpdate(TemplateScopes.Global, update);
  }

  protected abstract setup(): void;
  protected abstract insertDynamicContent(): void;
  protected abstract updateInput(element: HTMLInputElement | HTMLSelectElement, value: T[keyof T]): void;
  protected abstract reset(): void;
}
