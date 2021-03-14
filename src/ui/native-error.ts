import {
  NativeAppErrors,
  IExtensionMessage,
  IDebuggingInfoData
} from '@definitions';

import {
  requestDebuggingInfo,
  requestNativeErrorPageMute
} from '@communication/content-scripts/ui';

import { EXTENSION_MESSAGES } from '@config/general';
import { initializeExtensionPage } from '@ui/page';

const errorElement = <HTMLParagraphElement>document.getElementById('error-message');
const fixElement = <HTMLParagraphElement>document.getElementById('fix-message');
const fixCodeElement = <HTMLParagraphElement>document.getElementById('fix-code');
const disableButton = <HTMLButtonElement>document.getElementById('disable-button');

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

disableButton.addEventListener('click', requestNativeErrorPageMute);

initializeExtensionPage(
  document.getElementById('version'),
  handleExtensionMessage,
);

requestDebuggingInfo();
