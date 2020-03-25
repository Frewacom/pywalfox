const versionLabel = document.getElementById('version');
const colorPreviews = Array.from(document.getElementsByClassName('palette-color-preview'));

function updateInterface(colors) {
  colorPreviews.forEach((preview) => {
    setColorPreviewBackground(preview);
  });
}

setVersionLabel(versionLabel);
setupListeners(updateInterface);
