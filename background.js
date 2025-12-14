// Listen for extension install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Tab Sync extension installed:', details.reason);
  
  if (details.reason === 'install') {
    console.log('First time installation - Welcome to Tab Sync!');
  } else if (details.reason === 'update') {
    console.log('Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabs') {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      sendResponse({ tabs });
    });
    return true;
  }
  
  if (request.action === 'openTabs') {
    const urls = request.urls || [];
    if (urls.length > 0) {
      chrome.windows.create({ url: urls }, (window) => {
        sendResponse({ success: true, windowId: window.id });
      });
    } else {
      sendResponse({ success: false, error: 'No URLs provided' });
    }
    return true;
  }
  
  if (request.action === 'getDeviceInfo') {
    chrome.runtime.getPlatformInfo((info) => {
      sendResponse({ platform: info });
    });
    return true;
  }
});
