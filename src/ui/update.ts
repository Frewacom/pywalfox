import { setVersionLabel } from './utils';
import { requestUpdatePageMute } from './messenger';

const versionLabel = <HTMLSpanElement>document.getElementById('version');
const disableButton = <HTMLButtonElement>document.getElementById('disable-button');

disableButton.addEventListener('click', requestUpdatePageMute);

setVersionLabel(versionLabel);
