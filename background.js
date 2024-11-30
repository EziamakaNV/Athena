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