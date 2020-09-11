import { ITemplateItem, PaletteColors } from '@definitions';

export const PALETTE_TEMPLATE_DATA: ITemplateItem[] = [
  {
    title: 'Background',
    description: 'Main background color',
    target: PaletteColors.Background,
    cssVariable: '--background',
  },
  {
    title: 'Background light',
    description: 'Secondary background color',
    target: PaletteColors.BackgroundLight,
    cssVariable: '--background-light',
  },
  {
    title: 'Background extra',
    description: 'Additional contrasting background color',
    target: PaletteColors.BackgroundExtra,
    cssVariable: '--background-extra',
  },
  {
    title: 'Text',
    description: 'Main text color',
    target: PaletteColors.Text,
    cssVariable: '--text',
  },
  {
    title: 'Text focus',
    description: 'Text used in the current tab, etc.',
    target: PaletteColors.TextFocus,
    cssVariable: '--text-focus',
  },
  {
    title: 'Accent primary',
    description: 'Main accent color, used for icons',
    target: PaletteColors.AccentPrimary,
    cssVariable: '--accent-primary',
  },
  {
    title: 'Accent secondary',
    description: 'Mainly used for hovers and highlights',
    target: PaletteColors.AccentSecondary,
    cssVariable: '--accent-secondary',
  },
];

export const BROWSER_TEMPLATE_DATA: ITemplateItem[] = [
  {
    title: 'Icons',
    description: 'The color of toolbar icons, excluding those in the find toolbar.',
    target: 'icons',
  },
  {
    title: 'Icons attention',
    description: 'The color of toolbar icons in attention state, e.g. the starred bookmark icon.',
    target: 'icons_attention',
  },
  {
    title: 'Frame',
    description: 'The color of the header area background.',
    target: 'frame',
  },
  {
    title: 'Tab text',
    description: 'The text color for the selected tab.',
    target: 'tab_text',
  },
  {
    title: 'Tab loading',
    description: 'The color of the tab loading indicator and the tab loading burst.',
    target: 'tab_loading',
  },
  {
    title: 'Tab background text',
    description: 'The color of the text displayed in the inactive page tabs.',
    target: 'tab_background_text',
  },
  {
    title: 'Tab selected',
    description: 'The background color of the selected tab.',
    target: 'tab_selected',
  },
  {
    title: 'Tab line',
    description: 'The color of the selected tab line.',
    target: 'tab_line',
  },
  {
    title: 'Tab background separator',
    description: 'The color of the vertical separator of the background tabs.',
    target: 'tab_background_separator',
  },
  {
    title: 'Toolbar',
    description: 'The background color for the navigation bar, the bookmarks bar, and the selected tab.',
    target: 'toolbar',
  },
  {
    title: 'Toolbar field',
    description: 'The background color for fields in the toolbar, such as the URL bar.',
    target: 'toolbar_field',
  },
  {
    title: 'Toolbar field focus',
    description: 'The focused background color for fields in the toolbar, such as the URL bar.',
    target: 'toolbar_field_focus',
  },
  {
    title: 'Toolbar field text',
    description: 'The color of text in fields in the toolbar, such as the URL bar.',
    target: 'toolbar_field_text',
  },
  {
    title: 'Toolbar field text focus',
    description: 'The color of text in focused fields in the toolbar, such as the URL bar.',
    target: 'toolbar_field_text_focus',
  },
  {
    title: 'Toolbar field border',
    description: 'The border color for fields in the toolbar.',
    target: 'toolbar_field_border',
  },
  {
    title: 'Toolbar field border focus',
    description: 'The focused border color for fields in the toolbar.',
    target: 'toolbar_field_border_focus',
  },
  {
    title: 'Toolbar field separator',
    description: 'The color of separators inside the URL bar.',
    target: 'toolbar_field_separator',
  },
  {
    title: 'Toolbar field highlight',
    description: 'The background color used to indicate the current selection of text in the URL bar.',
    target: 'toolbar_field_highlight',
  },
  {
    title: 'Toolbar field highlight text',
    description: 'The color used to draw text that\'s currently selected in the URL bar.',
    target: 'toolbar_field_highlight_text',
  },
  {
    title: 'Toolbar bottom_separator',
    description: 'The color of the line separating the bottom of the toolbar from the region below.',
    target: 'toolbar_bottom_separator',
  },
  {
    title: 'Toolbar top separator',
    description: 'The color of the line separating the top of the toolbar from the region above.',
    target: 'toolbar_top_separator',
  },
  {
    title: 'Toolbar vertical separator',
    description: 'The color of the separator next to the application menu icon.',
    target: 'toolbar_vertical_separator',
  },
  {
    title: 'New tab page background',
    description: 'The new tab page background color.',
    target: 'ntp_background',
  },
  {
    title: 'New tab page text',
    description: 'The new tab page text color.',
    target: 'ntp_text',
  },
  {
    title: 'Popup',
    description: 'The background color of popups (eg. url bar dropdown and arrow panels).',
    target: 'popup',
  },
  {
    title: 'Popup border',
    description: 'The border color of popups.',
    target: 'popup_border',
  },
  {
    title: 'Popup text',
    description: 'The text color of popups.',
    target: 'popup_text',
  },
  {
    title: 'Popup highlight',
    description: 'The background color of items highlighted using the keyboard inside popups.',
    target: 'popup_highlight',
  },
  {
    title: 'Popup highlight text',
    description: 'The text color of items highlighted inside popups.',
    target: 'popup_highlight_text',
  },
  {
    title: 'Sidebar',
    description: 'The background color of the sidebar.',
    target: 'sidebar',
  },
  {
    title: 'Sidebar border',
    description: 'The border and splitter color of the browser sidebar',
    target: 'sidebar_border',
  },
  {
    title: 'Sidebar text',
    description: 'The text color of sidebars.',
    target: 'sidebar_text',
  },
  {
    title: 'Sidebar highlight',
    description: 'The background color of highlighted rows in built-in sidebars',
    target: 'sidebar_highlight',
  },
  {
    title: 'Sidebar highlight text',
    description: 'The text color of highlighted rows in sidebars.',
    target: 'sidebar_highlight_text',
  },
  {
    title: 'Bookmark text',
    description: 'The color of text and icons in the bookmark and find bars.',
    target: 'bookmark_text',
  },
  {
    title: 'Button background hover',
    description: 'The color of the background of the toolbar buttons on hover.',
    target: 'button_background_hover',
  },
  {
    title: 'Button background active',
    description: 'The color of the background of the pressed toolbar buttons.',
    target: 'button_background_active',
  },
];
