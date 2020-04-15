/**
 * Interface for the messages sent between the background and content scripts.
 *
 * @internal
 */
export interface IExtensionMessage {
  action: string;
  data?: any;
};

/**
 * Implements the communcation between the background- and content scripts.
 *
 * @param id - the id of the communication channel
 *
 * @internal
 */
export class Messenger {
  constructor(id: string) {
    this.setupListeners();
  }

  private setupListeners() {
    browser.runtime.onMessage.addListener((message: IExtensionMessage) => {

    });
  }
}
