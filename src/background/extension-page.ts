import { IExtensionTheme } from '../definitions';

export class ExtensionPage {
  protected tab: browser.tabs.Tab;
  protected currentTheme: IExtensionTheme;
  protected url: string;

  constructor(url: string) {
    this.tab = null;
    this.currentTheme = null;
    this.url = browser.runtime.getURL(url);
    this.findDetached();
  }

  private async deleteDetached(tabs: browser.tabs.Tab[]) {
    for (const tab of tabs) {
      await browser.tabs.remove(tab.id);
    }
  }

  private attach(tab: browser.tabs.Tab) {
    this.tab = tab;
    this.setupListeners();
    this.setTheme(this.currentTheme);
  }

  /**
   * Finds existing tabs that are displaying this URL and
   * uses that one instead of creating a new tab.
   *
   * If there are multiple tabs with this URL open,
   * all but one will be closed.
   */
  protected async findDetached() {
    const tabs = await browser.tabs.query({ url: this.url });

    if (tabs.length > 0) {
      const tail = tabs.slice(1);
      this.deleteDetached(tail);
      this.attach(tabs[0]);
    }
  }

  private onClosed(tabId: number, removeInfo?: any) {
    if (this.tab !== null) {
      if (tabId === this.tab.id) {
        browser.tabs.onRemoved.removeListener(this.onClosed);
        browser.tabs.onUpdated.removeListener(this.onUpdated);
        this.tab = null;
      }
    }
  }

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
    // The 'onRemoved' callback has no option for specifying a tab id.
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved
    browser.tabs.onRemoved.addListener(this.onClosed.bind(this));
    browser.tabs.onUpdated.addListener(this.onUpdated.bind(this), {
      tabId: this.tab.id,
      properties: [ 'status' ],
    });
  }

  private async removeInsertedCss() {
    return browser.tabs.removeCSS(this.tab.id, { code: this.currentTheme });
  }

  private async create() {
    try {
      this.tab = await browser.tabs.create({ url: this.url });
    } catch (error) {
      console.error(`Could not open ${this.url}: ${error}`);
      return;
    }

    this.setupListeners();
  }

  public async open() {
    if (this.isOpen()) {
      this.focus();
    } else {
      await this.create();
    }
  }

  public focus() {
    browser.windows.update(this.tab.windowId, { focused: true });
    browser.tabs.update(this.tab.id, { active: true });
  }

  public async setTheme(extensionTheme: IExtensionTheme) {
    if (this.tab === null) {
      return;
    }

    if (this.currentTheme !== null) {
      await this.removeInsertedCss();
    }

    if (extensionTheme !== null) {
      console.log(`Inserting CSS for ${this.url}`);
      browser.tabs.insertCSS(this.tab.id, {
        code: extensionTheme,
        runAt: 'document_start',
        cssOrigin: 'author',
        allFrames: true,
      });
    }

    this.currentTheme = extensionTheme;
  }

  public isOpen() {
    return this.tab === null ? false : true;
  }
}
