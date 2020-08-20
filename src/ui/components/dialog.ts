import {
  setOpen,
  setClosed,
  setSelected,
  setDeselected,
} from '@utils/dom';

/**
 * Base class for dialogs.
 *
 * @param dialogId - the id of the dialog element
 */
export default abstract class Dialog {
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
   * @param target - the dialog opener element
   */
  public open(target: HTMLElement) {
    if (this.target !== null) {
      setDeselected(this.target);
    }

    setOpen(this.dialog);
    setSelected(target);

    this.onOpen !== undefined && this.onOpen(this.target, target);
    this.target = target;
  }

  public getTarget() {
    return this.target;
  }

  /**
   * Callbacks for when the dialog is opened or closed.
   *
   * @param currentTarget - the element that was seleted when called
   * @param nextTarget - the element that initiated the callback
   */
  /* eslint-disable */
  protected onOpen(currentTarget: (HTMLElement | null), nextTarget: HTMLElement) {}
  protected onClose(currentTarget: HTMLElement) {}
  /* eslint-enable */

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
