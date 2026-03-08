let timePerTab = {};

chrome.runtime.onMessage.addListener((msg, sender) => {

  if (msg.type === "PING") {

    const tabId = sender.tab.id;

    if (!timePerTab[tabId]) {
      timePerTab[tabId] = 0;
    }

    timePerTab[tabId] += 10;

    if (timePerTab[tabId] > 10) { // 20 s for testing
      chrome.tabs.sendMessage(tabId, { type: "ROAST" });
    }
  }
});