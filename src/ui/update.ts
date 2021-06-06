import initializeExtensionPage from '@ui/page';
import { requestUpdatePageMute } from '@communication/content-scripts/ui';

const disableButton = <HTMLButtonElement>document.getElementById('disable-button');

disableButton.addEventListener('click', requestUpdatePageMute);

initializeExtensionPage(
  document.getElementById('version'),
  null,
);
