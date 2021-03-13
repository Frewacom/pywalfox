import {
  NativeAppErrors,
  IExtensionMessage,
  IDebuggingInfoData
} from '@definitions';

import { EXTENSION_MESSAGES } from '@config/general';
import { initializeExtensionPage } from '@ui/page';
import { requestDebuggingInfo } from '@communication/content-scripts/ui';

function setConnectionError(info: IDebuggingInfoData) {
  console.log(info);
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

initializeExtensionPage(
  document.getElementById('version'),
  handleExtensionMessage,
);

requestDebuggingInfo();
