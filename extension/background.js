/*
On startup, connect to the "ping_pong" app.
*/
var port = browser.runtime.connectNative("pywalfox");

/*
Listen for messages from the app.
*/
port.onMessage.addListener((response) => {
    console.log(response);
});

browser.runtime.onMessage.addListener((message) => {
    if (message.action == 'update') {
        console.log("Fetching latest colors from system...");
        port.postMessage("update");
    }
});
