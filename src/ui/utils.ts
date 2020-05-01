import { ThemeModes } from '../definitions';

export function isSet(attr: string, element: HTMLElement) {
  const value = element.getAttribute(attr);
  return value === '';
}

export function isOpen(element: HTMLElement) {
  return isSet('open', element);
}

export function open(element: HTMLElement) {
  element.setAttribute('open', '');
}

export function close(element: HTMLElement) {
  element.removeAttribute('open');
}

export function toggleOpen(element: HTMLElement) {
  isSet('open', element) ? close(element) : open(element);
}

export function select(element: HTMLElement) {
  element.setAttribute('selected', '');
}

export function deselect(element: HTMLElement) {
  element.removeAttribute('selected');
}

export function toggleSelected(element: HTMLElement) {
  isSet('selected', element) ? deselect(element) : select(element);
}

export async function setInitialThemeClass(themeInfo?: browser.theme.ThemeUpdateInfo) {
  let theme: any;
  if (themeInfo) {
    theme = themeInfo.theme;
  } else {
    theme = await browser.theme.getCurrent();
  }

  if (Object.keys(theme).length > 0 && theme['colors'] !== null) {
    // Seems like there is no better way of identifying themes
    if (theme.colors.toolbar_field === '#fff' || theme.colors.toolbar_field === '#ffffff') {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      return ThemeModes.Light;
    }
  }

  document.body.classList.add('dark');
  document.body.classList.remove('light');
  return ThemeModes.Dark;
}
