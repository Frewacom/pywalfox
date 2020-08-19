import {
  setOpen,
  setClosed,
  setSelected,
  setDeselected
} from '@utils/dom';

/**
 * Base class for dialogs.
 *
 * @param {string} dialogId - the id of the dialog element
 */
export abstract class Dialog {
  protected dialog: HTMLElement;
  protected target: HTMLElement;
  protected selected: HTMLElement;

  constructor(dialogId: string) {
    this.target = null;
    this.selected = null;
    this.dialog = document.getElementById(dialogId);
  }

  /**
   * Opens the dialog and selects/deselects opener elements.
   * Callback is available by implementing the 'onOpen' function.
   *
   * @param {HTMLElement} target - the dialog opener element
   */
  public open(target: HTMLElement) {
    setOpen(this.dialog);
    setSelected(target);

    if (this.target !== null){
      setDeselected(this.target);
    }

    this.onOpen !== undefined && this.onOpen(this.target, target);
    this.target = target;
  }

  public getTarget() {
    return this.target;
  }


  protected onOpen(currentTarget: HTMLElement, nextTarget: HTMLElement) {};
  protected onClose(currentTarget: HTMLElement) {};

  /**
   * Closes the dialog and unselects the opener element.
   * Callback is available by implementing the 'onClose' function.
   */
  public close() {
    setClosed(this.dialog);
    setDeselected(this.target);

    this.onClose !== undefined && this.onClose(this.target);
    this.target = null;
  }
}
