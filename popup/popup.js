document.addEventListener('DOMContentLoaded', () => {
  // Configuration Firebase (sans auth)
  const firebaseConfig = {
    apiKey: "AIzaSyCkqjFzv8g5-WlCFrnM25-44zA2qa03NC8",
    databaseURL: "https://tabsync-294cc-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tabsync-294cc",
  };

  // Initialisation de Firebase (sans auth)
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

  // Variables globales
  let userId = null;
  let userEmail = null;

  // Bouton de connexion Google
  document.getElementById('google-signin').addEventListener('click', () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error("Erreur d'authentification :", chrome.runtime.lastError);
        alert("Erreur d'authentification : " + chrome.runtime.lastError.message);
        return;
      }

      // Récupère les infos de l'utilisateur
      fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`)
        .then(response => response.json())
        .then(userInfo => {
          userId = userInfo.id; // Utilise l'ID Google comme UID
          userEmail = userInfo.email;

          // Cache la section d'authentification et affiche l'app
          document.getElementById('auth-container').style.display = 'none';
          document.getElementById('app-container').style.display = 'block';

          // Initialise l'application
          initApp();
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des infos utilisateur :", error);
          alert("Erreur lors de la récupération des infos utilisateur.");
        });
    });
  });

  // Vérifie si l'utilisateur est déjà connecté
  chrome.identity.getAuthToken({ interactive: false }, (token) => {
    if (!chrome.runtime.lastError && token) {
      fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`)
        .then(response => response.json())
        .then(userInfo => {
          userId = userInfo.id;
          userEmail = userInfo.email;

          // Cache la section d'authentification et affiche l'app
          document.getElementById('auth-container').style.display = 'none';
          document.getElementById('app-container').style.display = 'block';

          // Initialise l'application
          initApp();
        })
        .catch(error => {
          console.error("Erreur lors de la vérification de la connexion :", error);
        });
    }
  });

  function initApp() {
    const syncButton = document.getElementById('sync-button');
    const openAllRemoteTabsButton = document.getElementById('open-all-remote-tabs');
    const sessionSelect = document.getElementById('session-select');
    const localTabsDiv = document.getElementById('local-tabs');
    const remoteTabsDiv = document.getElementById('remote-tabs');

    // Affiche les onglets locaux
    chrome.tabs.query({}, (tabs) => {
      localTabsDiv.innerHTML = `
        <div class="tab-container">
          <h3>Onglets locaux (${userEmail})</h3>
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
    syncButton.addEventListener('click', () => {
      const sessionName = sessionSelect.value;
      chrome.tabs.query({}, (tabs) => {
        const tabsData = tabs.map(tab => ({ url: tab.url, title: tab.title }));
        database.ref(`users/${userId}/sessions/${sessionName}`).set(tabsData)
          .then(() => alert(`Onglets synchronisés dans "${sessionName}" !`))
          .catch(error => console.error("Erreur de synchronisation :", error));
      });
    });

    // Affiche les onglets distants
    const updateRemoteTabs = () => {
      database.ref(`users/${userId}/sessions`).on('value', (snapshot) => {
        remoteTabsDiv.innerHTML = `
          <div class="tab-container">
            <h3>Mes sessions</h3>
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

            sessionItem.addEventListener('click', () => {
              tabList.style.display = tabList.style.display === 'block' ? 'none' : 'block';
            });

            tabContainer.appendChild(sessionItem);
            tabContainer.appendChild(tabList);
          });
        } else {
          const tabContainer = document.querySelector('#remote-tabs .tab-container');
          tabContainer.innerHTML = `<h3>Mes sessions</h3><p>Aucune session trouvée.</p>`;
        }
      });
    };

    // Bouton pour ouvrir tous les onglets
    openAllRemoteTabsButton.addEventListener('click', () => {
      const sessionName = sessionSelect.value;
      database.ref(`users/${userId}/sessions/${sessionName}`).once('value', (snapshot) => {
        const tabsData = snapshot.val() || [];
        if (tabsData.length === 0) {
          alert("Aucun onglet dans cette session.");
          return;
        }
        if (confirm(`Ouvrir tous les ${tabsData.length} onglets de "${sessionName}" ?`)) {
          tabsData.forEach(tab => chrome.tabs.create({ url: tab.url }));
        }
      });
    });

    // Met à jour les onglets distants quand la session change
    sessionSelect.addEventListener('change', updateRemoteTabs);

    // Charge les onglets distants au démarrage
    updateRemoteTabs();
  }
});
