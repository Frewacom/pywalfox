const disableButton = document.getElementById('disable-button')

function updateInterface(colors) {}

disableButton.addEventListener('click', (e) => {
  browser.runtime.sendMessage({ action: 'updatePageMuted' });
});

setupListeners(updateInterface);
