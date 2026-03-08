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

  const time = tabTimers[tabId].elapsed;
  if (time >= 20*1000 && time <= 40*1000) { // 20s - 40s
    chrome.tabs.sendMessage(tabId, { type: "ROAST" });
    console.log(`Tab ${tabId} roasted!`);
  }
 if (time >= 40*1000 && time <= 60*1000) { // 50s - 60s
    chrome.tabs.sendMessage(tabId, { type: "STAGE_2" });
    console.log(`Tab ${tabId}: Stage 2!`);
  }
 if (time >= 70*1000 && time <= 90*1000) { // 70s - 90s
    chrome.tabs.sendMessage(tabId, { type: "STAGE_3" });
    console.log(`Tab ${tabId}: Stage 3!`);
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