import { SETTINGS_PAGE_URL } from '../config';
import { IExtensionTheme } from '../definitions';

export class SettingsPage {
  private tab: browser.tabs.Tab;
  private currentTheme: IExtensionTheme;
  private url: string;

  constructor(currentTheme: IExtensionTheme) {
    this.tab = null;
    this.currentTheme = null;
    this.url = browser.runtime.getURL(SETTINGS_PAGE_URL);
    this.findDetached();
  }

  private async findDetached() {
    const tabs = await browser.tabs.query({ url: this.url });
    if (tabs.length > 0) {
      const tail = tabs.slice(1);
      this.deleteDetached(tail);
      this.attach(tabs[0]);
    }
  }

  private deleteDetached(tabs: browser.tabs.Tab[]) {
    for (const tab of tabs) {
      browser.tabs.remove(tab.id);
    }
  }

  private attach(tab: browser.tabs.Tab) {
    this.tab = tab;
    this.setupListeners();
    this.setTheme(this.currentTheme);
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

  /**
   * This function will be called whenever the Settings tab is reloaded or
   * the user navigates to a different URL.
   */
  private onUpdated(tabId: number, changeInfo: any, tab?: any) {
    if (changeInfo.status === 'loading') {
      // The 'url' attribute is only available on loading
      if (changeInfo.url === this.url || changeInfo.url === undefined) {
        this.setTheme(this.currentTheme);
        return;
      } else {
        this.onClosed(tabId);
      }
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
      properties: [ 'status' ],
    });
  }

  private async create() {
    try {
      this.tab = await browser.tabs.create({ url: this.url });
    } catch (error) {
      console.error('Could not open Settings page:', error);
      return;
    }

    this.setupListeners();
  }

  private async removeInsertedCss() {
    return browser.tabs.removeCSS(this.tab.id, { code: this.currentTheme });
  }

  public async open(extensionTheme?: IExtensionTheme) {
    await this.create();
    extensionTheme && this.setTheme(extensionTheme);
  }

  public focus() {
    browser.windows.update(this.tab.windowId, { focused: true });
    browser.tabs.update(this.tab.id, { active: true });
  }

  public async resetTheme() {
    if (this.currentTheme !== null) {
      this.removeInsertedCss();
      this.currentTheme = null;
    }
  }

  public async setTheme(extensionTheme: IExtensionTheme) {
    if (this.tab === null) {
      return;
    }

    if (this.currentTheme !== null) {
      await this.removeInsertedCss();
    }

    browser.tabs.insertCSS(this.tab.id, {
      code: extensionTheme,
      runAt: 'document_start',
      cssOrigin: 'author',
      allFrames: true,
    });

    this.currentTheme = extensionTheme;
  }

  public isOpen() {
    return this.tab === null ? false : true;
  }
}
