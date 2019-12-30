var updateButton = document.getElementById('update');
updateButton.addEventListener('click', () => {
    browser.runtime.sendMessage({action: 'update'})
});
