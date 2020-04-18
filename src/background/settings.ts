import { SETTINGS_PAGE_URL } from '../config';
import { IExtensionTheme } from '../definitions';

export class Settings {
  private tab: browser.tabs.Tab;

  constructor() {
    this.tab = null;
  }

  /**
   * Called when the settings tab navigates to a new URL or the title changes,
   * or when the tab is simply closed.
   */
  private onClosed(tabId: number, removeInfo?: any) {
    // TODO: Check if this event is unnecessary, since the 'onUpdated' event
    // seems to be called when closing the tab as well.
    if (this.tab !== null) {
      if (tabId === this.tab.id) {
        browser.tabs.onRemoved.removeListener(this.onClosed);
        browser.tabs.onUpdated.removeListener(this.onUpdated);
        this.tab = null;
      }
    }
  }

  private onUpdated(tabId: number, changeInfo: any, tab?: any) {
    if (changeInfo.title != 'Pywalfox - Settings') {
      this.onClosed(tabId);
    }
  }

  private setupListeners() {
    /**
     * The 'onRemoved' callback has no option for specifying a tab id.
     * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved
     */
    browser.tabs.onRemoved.addListener(this.onClosed.bind(this));
    browser.tabs.onUpdated.addListener(this.onUpdated.bind(this), {
      tabId: this.tab.id,
      properties: [ 'title' ],
    });
  }

  private async create() {
    try {
      this.tab = await browser.tabs.create({ url: SETTINGS_PAGE_URL });
    } catch (error) {
      console.error('Could not open Settings page:', error);
      return;
    }

    this.setupListeners();
  }

  public async open(extensionTheme: IExtensionTheme) {
    await this.create();
    this.setTheme(extensionTheme);
  }

  public focus() {
    browser.windows.update(this.tab.windowId, { focused: true });
    browser.tabs.update(this.tab.id, { active: true });
  }

  public async setTheme(extensionTheme: IExtensionTheme) {
    if (this.tab === null) {
      return;
    }

    /* browser.tabs.removeCSS(this.tab.id, {}); */
    browser.tabs.insertCSS(this.tab.id, {
      code: extensionTheme,
      cssOrigin: 'user',
      runAt: 'document_start'
    });
  }

  public isOpen() {
    return this.tab === null ? false : true;
  }
}
