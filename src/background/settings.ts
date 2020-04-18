import { SETTINGS_PAGE_URL } from '../config';
import { IExtensionTheme } from '../definitions';

export class Settings {
  private tab: browser.tabs.Tab;
  private hasSetTheme: boolean;

  constructor() {
    this.tab = null;
    this.hasSetTheme = false;
  }

  /**
   * Called when the settings tab navigates to a new URL or the title changes,
   * or when the tab is simply closed.
   */
  private onClosed(tabId: number, removeInfo?: any, tab?: any) {
    if (tabId === this.tab.id) {
      browser.tabs.onRemoved.removeListener(this.onClosed);
      browser.tabs.onUpdated.removeListener(this.onClosed);
      this.tab = null;
    }
  }

  private setupListeners() {
    /**
     * The 'onRemoved' callback has no option for specifying a tab id.
     * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved
     */
    browser.tabs.onRemoved.addListener(this.onClosed.bind(this));
    browser.tabs.onUpdated.addListener(this.onClosed.bind(this), {
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
    this.create();
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

    if (this.hasSetTheme) {
      // Apparently, the 'details' object must be set, even though no properties are used
      browser.tabs.removeCSS(this.tab.id, {});
    }

    browser.tabs.insertCSS(this.tab.id, {
      code: extensionTheme,
      runAt: 'document_start'
    });
  }

  public isOpen() {
    return this.tab === null ? false : true;
  }
}
