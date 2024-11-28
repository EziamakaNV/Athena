chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('medium.com')) {
    chrome.sidePanel.setOptions({
      path: 'sidepanel.html',
      tabId: tab.id,
    });
    chrome.sidePanel.open({ tabId: tab.id });
  } else {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Athena',
      message: 'This extension only works on Medium.com.',
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkTranslation') {
    const targetLanguage = message.targetLanguage;
    if ('translation' in self && 'canTranslate' in self.translation) {
      translation.canTranslate({ sourceLanguage: 'en', targetLanguage }).then((result) => {
        sendResponse({ canTranslate: result !== 'no' });
      });
      return true; // Indicates we'll send a response asynchronously
    } else {
      sendResponse({ canTranslate: false });
    }
  }
}); 