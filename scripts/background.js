// background.js

// Initialize storage on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ tabTimers: {} });
});

// Handle PING messages from content scripts
chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type !== "PING") return;
  if (!sender.tab || !sender.tab.id) return;

  const tabId = sender.tab.id;

  // Get current timers
  const { tabTimers = {} } = await chrome.storage.local.get("tabTimers");

  // Initialize tab if it doesn't exist
  if (!tabTimers[tabId]) {
    tabTimers[tabId] = {
      startTime: Date.now(),
      elapsed: 0,
      avatarInitialized: false  // track if avatar menu sent
    };
  }

  const now = Date.now();
  tabTimers[tabId].elapsed = now - tabTimers[tabId].startTime;

  // Persist timers
  await chrome.storage.local.set({ tabTimers });

  // Send initialize message ONLY ONCE per tab
  if (!tabTimers[tabId].avatarInitialized) {
    chrome.tabs.sendMessage(tabId, { type: "initialize" });
    tabTimers[tabId].avatarInitialized = true;
    await chrome.storage.local.set({ tabTimers });
    console.log(`Sent initialize message to tab ${tabId}`);
  }

  // Send elapsed time back to content script
  chrome.tabs.sendMessage(tabId, { type: "ELAPSED_TIME", elapsed: tabTimers[tabId].elapsed });
  console.log(`Sent elapsed time to tab ${tabId}:`, tabTimers[tabId].elapsed);

  // Optional: trigger ROAST if threshold exceeded
  const time = tabTimers[tabId].elapsed;
  if (time >= 5000 && time <= 30000) { // 5s - 30s
    chrome.tabs.sendMessage(tabId, { type: "ROAST" });
    console.log(`Tab ${tabId} roasted!`);
  }
});

// Clean up timers when a tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get("tabTimers", ({ tabTimers = {} }) => {
    delete tabTimers[tabId];
    chrome.storage.local.set({ tabTimers });
    console.log(`Cleaned up tabTimer for tab ${tabId}`);
  });
});