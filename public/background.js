let monitoredTabs = {}; // Object to keep track of YouTube tabs

// When a tab is updated, check if it is a YouTube video
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url && changeInfo.url.includes('youtube.com/watch')) {
    // If it is a YouTube video, store it in the monitoredTabs object
    monitoredTabs[tabId] = changeInfo.url;
  }
});

// When a tab is closed, check if it was a monitored YouTube tab
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (monitoredTabs[tabId]) {
    // Clear chrome.storage.local
    chrome.storage.local.remove(monitoredTabs[tabId], function() {
      console.log(`Data cleared for tab ID: ${tabId}`);
    });

    // Remove the tab from monitoredTabs object
    delete monitoredTabs[tabId];
  }
});