// // Récupérer les onglets locaux
// chrome.tabs.query({}, (tabs) => {
//   const localTabs = tabs.map(tab => ({ url: tab.url, title: tab.title }));
//   console.log("Onglets locaux :", localTabs);
// });

// // Bouton pour synchroniser
// document.getElementById("sync-button").addEventListener("click", () => {
//   chrome.tabs.query({}, (tabs) => {
//     const tabsData = tabs.map(tab => ({ url: tab.url, title: tab.title }));
//     // Envoyer à Firebase ici
//   });
// });

const firebaseConfig = {
  apiKey: "AIzaSyCkqjFzv8g5-WlCFrnM25-44zA2qa03NC8",
  authDomain: "tabsync-294cc.firebaseapp.com",
  databaseURL: "https://tabsync-294cc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tabsync-294cc",
  storageBucket: "tabsync-294cc.firebasestorage.app",
  messagingSenderId: "644042425984",
  appId: "1:644042425984:web:d03d6b4e55b9238bb80865",
  measurementId: "G-WT43P1RZDV"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();



document.addEventListener('DOMContentLoaded', () => {
  const syncButton = document.getElementById('sync-button');
  const localTabsDiv = document.getElementById('local-tabs');
  const remoteTabsDiv = document.getElementById('remote-tabs');

  // 1. Affiche les onglets locaux
  chrome.tabs.query({}, (tabs) => {
    localTabsDiv.innerHTML = "<h3>Onglets locaux :</h3>";
    tabs.forEach(tab => {
      const tabElement = document.createElement('div');
      tabElement.className = 'tab';
      tabElement.textContent = tab.title;
      tabElement.onclick = () => chrome.tabs.update(tab.id, { active: true });
      localTabsDiv.appendChild(tabElement);
    });
  });

  // 2. Synchronise les onglets vers Firebase
  syncButton.onclick = () => {
    chrome.tabs.query({}, (tabs) => {
      const userId = "test-user"; // ID temporaire pour le MVP
      const tabsData = tabs.map(tab => ({ url: tab.url, title: tab.title }));
      database.ref(`users/${userId}/tabs`).set(tabsData)
        .then(() => alert("Onglets synchronisés !"))
        .catch(error => console.error("Erreur :", error));
    });
  };

  // 3. Récupère les onglets distants depuis Firebase
  const userId = "test-user"; // Même ID que ci-dessus
  database.ref(`users/${userId}/tabs`).on('value', (snapshot) => {
    remoteTabsDiv.innerHTML = "<h3>Onglets distants :</h3>";
    const remoteTabs = snapshot.val();
    if (remoteTabs) {
      remoteTabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.textContent = tab.title;
        tabElement.onclick = () => chrome.tabs.create({ url: tab.url });
        remoteTabsDiv.appendChild(tabElement);
      });
    }
  });
});
