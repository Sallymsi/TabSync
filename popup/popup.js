// Configuration Firebase
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

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Gestion de l'UID avec chrome.storage.sync
chrome.storage.sync.get(['userId'], (result) => {
  if (result.userId) {
    // Utilise l'UID existant
    console.log("UID récupéré depuis sync:", result.userId);
    initApp(result.userId);
  } else {
    // Génère un nouvel UID et le sauvegarde
    auth.signInAnonymously()
      .then(() => {
        const userId = auth.currentUser.uid;
        chrome.storage.sync.set({ userId }, () => {
          console.log("Nouvel UID généré et synchronisé:", userId);
          initApp(userId);
        });
      })
      .catch(error => {
        console.error("Erreur d'authentification:", error);
        alert("Erreur de connexion à Firebase. Vérifie ta connexion Internet.");
      });
  }
});

// Bouton pour réinitialiser l'UID (optionnel)
document.addEventListener('DOMContentLoaded', () => {
  const resetButton = document.createElement('button');
  resetButton.id = 'reset-uid';
  resetButton.textContent = 'Réinitialiser l\'UID';
  resetButton.style.marginBottom = '10px';
  resetButton.style.width = '100%';
  resetButton.style.padding = '8px';
  resetButton.style.backgroundColor = '#f1c40f'; // Jaune pour attirer l'attention
  resetButton.style.border = 'none';
  resetButton.style.borderRadius = '4px';
  resetButton.style.cursor = 'pointer';

  resetButton.onclick = () => {
    if (confirm("Réinitialiser l'UID ? Cela supprimera l'accès aux sessions existantes.")) {
      auth.signOut().then(() => {
        chrome.storage.sync.remove(['userId'], () => {
          location.reload(); // Recharge l'extension
        });
      });
    }
  };

  // Ajoute le bouton de réinitialisation en haut de la popup
  const firstElement = document.body.firstChild;
  document.body.insertBefore(resetButton, firstElement);
});

function initApp(userId) {
  const syncButton = document.getElementById('sync-button');
  const openAllRemoteTabsButton = document.getElementById('open-all-remote-tabs');
  const sessionSelect = document.getElementById('session-select');
  const localTabsDiv = document.getElementById('local-tabs');
  const remoteTabsDiv = document.getElementById('remote-tabs');

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
      tabElement.className = 'local-tab';
      tabElement.innerHTML = `<div class="local-tab-title">${tab.title}</div>`;
      tabElement.onclick = () => chrome.tabs.update(tab.id, { active: true });
      tabContainer.appendChild(tabElement);
    });
  });

  // Synchronise les onglets vers Firebase
  syncButton.onclick = () => {
    const sessionName = sessionSelect.value;
    chrome.tabs.query({}, (tabs) => {
      const tabsData = tabs.map(tab => ({ url: tab.url, title: tab.title }));
      database.ref(`users/${userId}/sessions/${sessionName}`).set(tabsData)
        .then(() => {
          alert(`Onglets synchronisés dans la session "${sessionName}" !`);
          updateRemoteTabs(userId); // Met à jour l'affichage
        })
        .catch(error => console.error("Erreur de synchronisation:", error));
    });
  };

  // Affiche les onglets distants
  function updateRemoteTabs(userId) {
    database.ref(`users/${userId}/sessions`).on('value', (snapshot) => {
      remoteTabsDiv.innerHTML = `
        <div class="tab-container">
          <h3>Mes sessions (UID: ${userId.substring(0, 8)}...)</h3>
        </div>
      `;
      const sessions = snapshot.val();
      if (sessions) {
        const tabContainer = document.querySelector('#remote-tabs .tab-container');
        Object.keys(sessions).forEach(sessionName => {
          const sessionItem = document.createElement('div');
          sessionItem.className = 'session-item';
          sessionItem.textContent = sessionName.charAt(0).toUpperCase() + sessionName.slice(1);

          const tabList = document.createElement('div');
          tabList.className = 'tab-list';

          sessions[sessionName].forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.className = 'tab';
            tabElement.innerHTML = `<div class="tab-title">${tab.title}</div>`;
            tabElement.onclick = () => chrome.tabs.create({ url: tab.url });
            tabList.appendChild(tabElement);
          });

          sessionItem.onclick = () => {
            sessionItem.classList.toggle('expanded');
            tabList.style.display = tabList.style.display === 'block' ? 'none' : 'block';
          };

          tabContainer.appendChild(sessionItem);
          tabContainer.appendChild(tabList);
        });
      } else {
        const tabContainer = document.querySelector('#remote-tabs .tab-container');
        tabContainer.innerHTML = `<h3>Mes sessions</h3><p>Aucune session trouvée.</p>`;
      }
    });
  }

  // Bouton pour ouvrir tous les onglets d'une session
  openAllRemoteTabsButton.onclick = () => {
    const sessionName = sessionSelect.value;
    database.ref(`users/${userId}/sessions/${sessionName}`).once('value', (snapshot) => {
      const tabsData = snapshot.val() || [];
      if (tabsData.length === 0) {
        alert("Aucun onglet dans cette session.");
        return;
      }
      if (confirm(`Ouvrir tous les ${tabsData.length} onglets de la session "${sessionName}" ?`)) {
        tabsData.forEach(tab => chrome.tabs.create({ url: tab.url }));
      }
    });
  };

  // Met à jour les onglets distants quand la session change
  sessionSelect.addEventListener('change', () => updateRemoteTabs(userId));

  // Charge les onglets distants au démarrage
  updateRemoteTabs(userId);
}
