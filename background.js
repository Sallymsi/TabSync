// Background Service Worker for Tab Sync Extension
const firebaseConfig = {
  apiKey: "AIzaSyCkqjFzv8g5-WlCFrnM25-44zA2qa03NC8",
  authDomain: "tabsync-294cc.firebaseapp.com",
  databaseURL: "https://tabsync-294cc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tabsync-294cc",
  storageBucket: "tabsync-294cc.firebasestorage.app",
  messagingSenderId: "644042425984",
  appId: "1:644042425984:web:d03d6b4e55b9238bb80865"
};
// Listen for extension install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Tab Sync extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    console.log('First time installation - Welcome to Tab Sync!');
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabs') {
    // Get all tabs from current window
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      sendResponse({ tabs });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'openTabs') {
    // Open multiple tabs
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
    // Get device/platform info
    chrome.runtime.getPlatformInfo((info) => {
      sendResponse({ platform: info });
    });
    return true;
  }
});

// Optional: Auto-sync feature (can be enabled later)
// This would periodically save tabs in the background
let autoSyncInterval = null;

function startAutoSync(intervalMinutes = 30) {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
  }
  
  autoSyncInterval = setInterval(() => {
    // Send message to popup to trigger sync
    chrome.runtime.sendMessage({ action: 'autoSync' }).catch(() => {
      // Popup not open, that's fine
    });
  }, intervalMinutes * 60 * 1000);
}

function stopAutoSync() {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
  }
}

// Handle alarm for periodic sync (more reliable than setInterval in service workers)
chrome.alarms?.onAlarm?.addListener((alarm) => {
  if (alarm.name === 'autoSync') {
    console.log('Auto-sync alarm triggered');
    // Could implement background sync here if needed
  }
});

// Set up periodic alarm (optional - uncomment to enable)
// chrome.alarms?.create('autoSync', { periodInMinutes: 30 });

console.log('Tab Sync background service worker loaded');
