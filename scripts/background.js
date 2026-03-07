
let totalTime = 0;
console.log("Service worker started");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "TIME_UPDATE") {
        totalTime += message.time;

        if (totalTime > 5) { // 5 minutes
            chrome.tabs.sendMessage(sender.tab.id, {
                type: "SHOW_ROAST"
            });
        }
    }

});
