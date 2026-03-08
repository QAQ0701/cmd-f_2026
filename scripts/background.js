console.log("Background service worker started");
// Initialize storage on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ tabTimers: {} });
});

// Main message router
chrome.runtime.onMessage.addListener(async (msg, sender) => {
  console.log("Background received message:", msg);
  if (!sender.tab || !sender.tab.id) return;

  const tabId = sender.tab.id;

  switch (msg.type) {
    case "PING":
      await handlePing(tabId);
      break;

    case "INITIAL_WARNING":
      await handleInitialWarning(tabId);
      break;
  }
});

// -----------------------------
// HANDLERS
// -----------------------------

async function handlePing(tabId) {
  const { tabTimers = {} } = await chrome.storage.local.get("tabTimers");

  // Initialize tab if needed
  if (!tabTimers[tabId]) {
    tabTimers[tabId] = {
      startTime: Date.now(),
      elapsed: 0,
      avatarInitialized: false,
      warnings: 0,
    };
  }

  const now = Date.now();
  tabTimers[tabId].elapsed = now - tabTimers[tabId].startTime;

  // Save timers
  await chrome.storage.local.set({ tabTimers });

  // Send avatar initialize once
  if (!tabTimers[tabId].avatarInitialized) {
    chrome.tabs.sendMessage(tabId, { type: "initialize" });

    tabTimers[tabId].avatarInitialized = true;
    await chrome.storage.local.set({ tabTimers });

    console.log(`Sent initialize message to tab ${tabId}`);
  }

  // Send elapsed time
  chrome.tabs.sendMessage(tabId, {
    type: "ELAPSED_TIME",
    elapsed: tabTimers[tabId].elapsed,
  });

  console.log(`Sent elapsed time to tab ${tabId}:`, tabTimers[tabId].elapsed);
}

async function handleInitialWarning(tabId) {
  const { tabTimers = {} } = await chrome.storage.local.get("tabTimers");

  if (!tabTimers[tabId]) return;

  tabTimers[tabId].warnings = (tabTimers[tabId].warnings || 0) + 1;

  console.log(`Tab ${tabId}: Initial Warning received`);
  console.log(`Tab ${tabId}: Number of Warnings ${tabTimers[tabId].warnings}`);

  if (tabTimers[tabId].warnings == 3) {
    chrome.tabs.sendMessage(tabId, { type: "STAGE_2" });
    console.log(`Tab ${tabId}: Stage 2!`);
  }

  await chrome.storage.local.set({ tabTimers });
}

// -----------------------------
// CLEANUP
// -----------------------------

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get("tabTimers", ({ tabTimers = {} }) => {
    delete tabTimers[tabId];

    chrome.storage.local.set({ tabTimers });

    console.log(`Cleaned up tabTimer for tab ${tabId}`);
  });
});
