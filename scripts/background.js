// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ tabTimers: {} });
});

// Handle "PING" messages from content scripts
chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type !== "PING") return;
  if (!sender.tab || !sender.tab.id) return;

  const tabId = sender.tab.id;

  const { tabTimers } = await chrome.storage.local.get("tabTimers");

  // Initialize tab if it doesn't exist
  if (!tabTimers[tabId]) tabTimers[tabId] = { startTime: Date.now(), elapsed: 0 };

  const now = Date.now();
  tabTimers[tabId].elapsed = now - tabTimers[tabId].startTime;

  // Persist timers
  chrome.storage.local.set({ tabTimers });

  console.log(`Tab ${tabId} elapsed ms:`, tabTimers[tabId].elapsed);

  // Send elapsed time back to content script
  chrome.tabs.sendMessage(tabId, { type: "ELAPSED_TIME", elapsed: tabTimers[tabId].elapsed });
  console.log(`Sent elapsed time to tab ${tabId}`, tabTimers[tabId].elapsed);

  // Optional: trigger ROAST if threshold exceeded
  if (tabTimers[tabId].elapsed > 10000) { // 1 second
    chrome.tabs.sendMessage(tabId, { type: "ROAST" });
    console.log(`Tab ${tabId} roasted!`);
  }
});

// Clean up timers when a tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get("tabTimers", ({ tabTimers }) => {
    delete tabTimers[tabId];
    chrome.storage.local.set({ tabTimers });
  });
});
