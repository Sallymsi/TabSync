// Écouter les changements d'onglets
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // Mettre à jour Firebase si nécessaire
  }
});
