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
  const openAllRemoteTabsButton = document.getElementById('open-all-remote-tabs');
  const userIdInput = document.getElementById('user-id');
  const localTabsDiv = document.getElementById('local-tabs');
  const remoteTabsDiv = document.getElementById('remote-tabs');

  let remoteTabsData = []; // Variable pour stocker les onglets distants

  // Affiche les onglets locaux
  chrome.tabs.query({}, (tabs) => {
    localTabsDiv.innerHTML = `
      <div class="tab-container">
        <h3>Onglets locaux</h3>
      </div>
    `;
    tabs.forEach(tab => {
      const tabContainer = document.querySelector('#local-tabs .tab-container');
      const tabElement = document.createElement('div');
      tabElement.className = 'tab';
      tabElement.innerHTML = `
        <div class="tab-title">${tab.title}</div>
        <div class="tab-url">${tab.url}</div>
      `;
      tabElement.onclick = () => chrome.tabs.update(tab.id, { active: true });
      tabContainer.appendChild(tabElement);
    });
  });

  // Synchronise les onglets vers Firebase
  syncButton.onclick = () => {
    const userId = userIdInput.value.trim() || "test-user";
    chrome.tabs.query({}, (tabs) => {
      const tabsData = tabs.map(tab => ({ url: tab.url, title: tab.title }));
      database.ref(`users/${userId}/tabs`).set(tabsData)
        .then(() => alert(`Onglets synchronisés avec l'ID : ${userId}`))
        .catch(error => console.error("Erreur :", error));
    });
  };

  // Récupère les onglets distants depuis Firebase
  const updateRemoteTabs = () => {
    const userId = userIdInput.value.trim() || "test-user";
    database.ref(`users/${userId}/tabs`).on('value', (snapshot) => {
      remoteTabsData = snapshot.val() || []; // Stocke les onglets distants
      remoteTabsDiv.innerHTML = `
        <div class="tab-container">
          <h3>Onglets distants (ID : ${userId})</h3>
        </div>
      `;
      if (remoteTabsData.length > 0) {
        const tabContainer = document.querySelector('#remote-tabs .tab-container');
        remoteTabsData.forEach(tab => {
          const tabElement = document.createElement('div');
          tabElement.className = 'tab';
          tabElement.innerHTML = `
            <div class="tab-title">${tab.title}</div>
            <div class="tab-url">${tab.url}</div>
          `;
          tabElement.onclick = () => chrome.tabs.create({ url: tab.url });
          tabContainer.appendChild(tabElement);
        });
      }
    });
  };

  // Bouton pour ouvrir tous les onglets distants
  openAllRemoteTabsButton.onclick = () => {
    if (remoteTabsData.length === 0) {
      alert("Aucun onglet distant à ouvrir.");
      return;
    }
    remoteTabsData.forEach(tab => {
      chrome.tabs.create({ url: tab.url });
    });
    alert(`Tous les onglets distants ont été ouverts !`);
  };

  // Met à jour les onglets distants au démarrage et quand l'ID change
  userIdInput.addEventListener('input', updateRemoteTabs);
  updateRemoteTabs(); // Charge les onglets distants au démarrage
});
