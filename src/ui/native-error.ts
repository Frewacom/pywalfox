import {
  NativeAppErrors,
  IExtensionMessage,
  IDebuggingInfoData,
} from '@definitions';

import {
  requestDebuggingInfo,
  requestNativeErrorPageMute,
} from '@communication/content-scripts/ui';

import initializeExtensionPage from '@ui/page';
import { EXTENSION_MESSAGES } from '@config/general';

const retryButton = <HTMLButtonElement>document.getElementById('retry-button');
const disableButton = <HTMLButtonElement>document.getElementById('disable-button');
const errorElement = <HTMLParagraphElement>document.getElementById('error-message');

function setConnectionError({ nativeError }: IDebuggingInfoData) {
  switch (nativeError.type) {
    case NativeAppErrors.Unknown:
    case NativeAppErrors.UnexpectedError:
    case NativeAppErrors.ManifestNotInstalled:
      errorElement.innerText = nativeError.message;
      break;
    case NativeAppErrors.None:
      errorElement.innerText = 'None';
      break;
    default:
      console.warn(`Got unhandled native app error type: ${nativeError.type}`);
      break;
  }
}

function handleExtensionMessage({ action, data }: IExtensionMessage) {
  switch (action) {
    case EXTENSION_MESSAGES.DEBUGGING_INFO_SET:
      setConnectionError(data);
      break;
    default:
      break;
  }
}

// Connection to the native messaging host will automatically be made
// on extension load. The easiest way to implement this funcitonality is
// by simply reloading the extension.
retryButton.addEventListener('click', () => browser.runtime.reload());
disableButton.addEventListener('click', requestNativeErrorPageMute);

initializeExtensionPage(
  document.getElementById('version'),
  handleExtensionMessage,
);

requestDebuggingInfo();
