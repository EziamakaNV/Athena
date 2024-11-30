chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url?.startsWith('https://medium.com/')) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
  } else {
    console.log('Not a Medium article page');
  }
});

// Function to check the tab URL and send mode switch message
function checkTabUrl(tab) {
  if (tab.url && tab.url.match(/^https:\/\/medium\.com\/(p\/.*\/edit|new-story)/)) {
    // Switch to writing mode
    chrome.tabs.sendMessage(tab.id, { action: 'switchMode', mode: 'writing' });
  } else if (tab.url && tab.url.startsWith('https://medium.com/')) {
    // Switch to reading mode
    chrome.tabs.sendMessage(tab.id, { action: 'switchMode', mode: 'reading' });
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    checkTabUrl(tab);
  }
});

// Listen for tab activation changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    checkTabUrl(tab);
  });
}); 