// // Écouter les changements d'onglets
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete") {
//     // Mettre à jour Firebase si nécessaire
//   }
// });


importScripts(
  "https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/9.6.0/firebase-database-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyCkqjFzv8g5-WlCFrnM25-44zA2qa03NC8",
  authDomain: "tabsync-294cc.firebaseapp.com",
  databaseURL: "https://tabsync-294cc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tabsync-294cc",
  storageBucket: "tabsync-294cc.firebasestorage.app",
  messagingSenderId: "644042425984",
  appId: "1:644042425984:web:d03d6b4e55b9238bb80865"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getUserId") {
    auth.signInAnonymously().then(() => {
      sendResponse({ userId: auth.currentUser.uid });
    }).catch(error => sendResponse({ error: error.message }));
    return true; // Indique que la réponse est asynchrone
  }
  // Ajoute d'autres actions ici
});
