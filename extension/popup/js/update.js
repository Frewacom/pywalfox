const disableButton = document.getElementById('disable-button')

function updateInterface(colors) {}

disableButton.addEventListener('click', (e) => {
  browser.storage.local.set({ updatePageMuted: true });
  window.close();
});

setupListeners(updateInterface);
