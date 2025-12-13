// Firebase configuration - À REMPLACER avec vos propres valeurs
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCkqjFzv8g5-WlCFrnM25-44zA2qa03NC8",
  authDomain: "tabsync-294cc.firebaseapp.com",
  databaseURL: "https://tabsync-294cc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tabsync-294cc",
  storageBucket: "tabsync-294cc.firebasestorage.app",
  messagingSenderId: "644042425984",
  appId: "1:644042425984:web:d03d6b4e55b9238bb80865"
};

// State
let currentUser = null;
let sessionToDelete = null;

// DOM Elements
const authSection = document.getElementById('auth-section');
const userSection = document.getElementById('user-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const saveTabsBtn = document.getElementById('save-tabs-btn');
const refreshBtn = document.getElementById('refresh-btn');
const sessionsList = document.getElementById('sessions-list');
const currentTabsDiv = document.getElementById('current-tabs');
const tabsCount = document.getElementById('tabs-count');
const saveModal = document.getElementById('save-modal');
const deleteModal = document.getElementById('delete-modal');
const sessionNameInput = document.getElementById('session-name');
const cancelSaveBtn = document.getElementById('cancel-save-btn');
const confirmSaveBtn = document.getElementById('confirm-save-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// ============================================
// Firebase REST API Helper Functions
// ============================================

// Firestore REST API base URL (avec API Key pour authentification simplifiée)
function getFirestoreUrl(path, useApiKey = true) {
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents${path}`;
  if (useApiKey) {
    return `${baseUrl}?key=${FIREBASE_CONFIG.apiKey}`;
  }
  return baseUrl;
}

// Convert Firestore document to JS object
function firestoreDocToObject(doc) {
  const data = {};
  if (doc.fields) {
    for (const [key, value] of Object.entries(doc.fields)) {
      data[key] = firestoreValueToJS(value);
    }
  }
  return data;
}

// Convert Firestore value to JS value
function firestoreValueToJS(value) {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return new Date(value.timestampValue);
  if (value.arrayValue !== undefined) {
    return (value.arrayValue.values || []).map(firestoreValueToJS);
  }
  if (value.mapValue !== undefined) {
    return firestoreDocToObject(value.mapValue);
  }
  return null;
}

// Convert JS value to Firestore value
function jsToFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: value.toString() };
    return { doubleValue: value };
  }
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(jsToFirestoreValue) } };
  }
  if (typeof value === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = jsToFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

// Convert JS object to Firestore document
function objectToFirestoreDoc(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = jsToFirestoreValue(value);
  }
  return { fields };
}

// ============================================
// Authentication
// ============================================

// Check if user is already signed in (from storage)
async function checkAuthState() {
  try {
    const result = await chrome.storage.local.get(['user', 'token']);
    if (result.user && result.token) {
      currentUser = result.user;
      currentUser.token = result.token;
      showUserSection();
      loadSessions();
      loadCurrentTabs();
    }
  } catch (error) {
    console.error('Error checking auth state:', error);
  }
}

// Google Sign In using Chrome Identity API
async function signInWithGoogle() {
  try {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Connexion en cours...';
    
    // Get OAuth token from Chrome
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(token);
        }
      });
    });
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }
    
    const userInfo = await userInfoResponse.json();
    
    currentUser = {
      uid: userInfo.id,
      email: userInfo.email,
      displayName: userInfo.name,
      photoURL: userInfo.picture,
      token: token
    };
    
    // Save to storage
    await chrome.storage.local.set({ 
      user: {
        uid: userInfo.id,
        email: userInfo.email,
        displayName: userInfo.name,
        photoURL: userInfo.picture
      }, 
      token: token 
    });
    
    showUserSection();
    loadSessions();
    loadCurrentTabs();
    showToast('Connexion réussie !', 'success');
    
  } catch (error) {
    console.error('Sign in error:', error);
    showToast('Erreur de connexion: ' + error.message, 'error');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = `
      <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Connexion avec Google
    `;
  }
}

// Sign Out
async function signOutUser() {
  try {
    // Revoke Chrome token
    const result = await chrome.storage.local.get(['token']);
    if (result.token) {
      chrome.identity.removeCachedAuthToken({ token: result.token }, () => {
        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${result.token}`);
      });
    }
    
    // Clear storage
    await chrome.storage.local.remove(['user', 'token']);
    currentUser = null;
    
    showAuthSection();
    showToast('Déconnexion réussie', 'success');
  } catch (error) {
    console.error('Sign out error:', error);
    showToast('Erreur de déconnexion', 'error');
  }
}

// Show user section
function showUserSection() {
  authSection.classList.add('hidden');
  userSection.classList.remove('hidden');
  
  userAvatar.src = currentUser.photoURL || 'icons/default-avatar.png';
  userName.textContent = currentUser.displayName || 'Utilisateur';
  userEmail.textContent = currentUser.email;
}

// Show auth section
function showAuthSection() {
  authSection.classList.remove('hidden');
  userSection.classList.add('hidden');
}

// ============================================
// Tabs Management
// ============================================

// Load current tabs
async function loadCurrentTabs() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    tabsCount.textContent = tabs.length;
    
    currentTabsDiv.innerHTML = tabs.map(tab => {
      const faviconUrl = tab.favIconUrl || '';
      return `
        <div class="tab-item" title="${escapeHtml(tab.url || '')}">
          <img class="tab-favicon" src="${faviconUrl}" alt="" data-fallback="true">
          <span class="tab-title">${escapeHtml(tab.title || tab.url || 'Sans titre')}</span>
        </div>
      `;
    }).join('');
    
    // Handle favicon errors without inline handlers
    currentTabsDiv.querySelectorAll('.tab-favicon').forEach(img => {
      img.addEventListener('error', function() {
        this.style.display = 'none';
      });
      // If no src, hide immediately
      if (!img.src || img.src === window.location.href) {
        img.style.display = 'none';
      }
    });
  } catch (error) {
    console.error('Error loading tabs:', error);
    currentTabsDiv.innerHTML = '<p class="empty-state">Erreur lors du chargement des onglets</p>';
  }
}

// ============================================
// Sessions Management (Firestore REST API)
// ============================================

// Load sessions from Firestore
async function loadSessions() {
  if (!currentUser) return;
  
  try {
    sessionsList.innerHTML = '<p class="loading">Chargement...</p>';
    
    const url = getFirestoreUrl(`/users/${currentUser.uid}/sessions`);
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        sessionsList.innerHTML = '<p class="empty-state">Aucune session sauvegardée</p>';
        return;
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      sessionsList.innerHTML = '<p class="empty-state">Aucune session sauvegardée</p>';
      return;
    }
    
    // Sort by createdAt desc
    const sessions = data.documents.map(doc => {
      const id = doc.name.split('/').pop();
      const sessionData = firestoreDocToObject(doc);
      return { id, ...sessionData };
    }).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
    
    sessionsList.innerHTML = '';
    sessions.forEach(session => {
      const sessionEl = createSessionElement(session.id, session);
      sessionsList.appendChild(sessionEl);
    });
    
  } catch (error) {
    console.error('Error loading sessions:', error);
    sessionsList.innerHTML = '<p class="empty-state">Erreur lors du chargement</p>';
  }
}

// Create session element
function createSessionElement(id, session) {
  const div = document.createElement('div');
  div.className = 'session-item';
  div.dataset.id = id;
  
  const date = session.createdAt ? new Date(session.createdAt) : new Date();
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const tabCount = Array.isArray(session.tabs) ? session.tabs.length : 0;
  
  div.innerHTML = `
    <div class="session-info">
      <span class="session-name">${escapeHtml(session.name || 'Session sans nom')}</span>
      <div class="session-meta">
        <span>📑 ${tabCount} onglets</span>
        <span>📅 ${formattedDate}</span>
        ${session.device ? `<span class="device-badge">💻 ${escapeHtml(session.device)}</span>` : ''}
      </div>
    </div>
    <div class="session-actions">
      <button class="btn btn-small btn-primary restore-btn" title="Restaurer">📂</button>
      <button class="btn btn-small btn-danger delete-btn" title="Supprimer">🗑️</button>
    </div>
  `;
  
  // Restore button
  div.querySelector('.restore-btn').addEventListener('click', () => restoreSession(session));
  
  // Delete button
  div.querySelector('.delete-btn').addEventListener('click', () => {
    sessionToDelete = id;
    deleteModal.classList.remove('hidden');
  });
  
  return div;
}

// Save current tabs as a session
async function saveCurrentTabs(name) {
  if (!currentUser) return;
  
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    
    const sessionData = {
      name: name || `Session ${new Date().toLocaleString('fr-FR')}`,
      tabs: tabs.map(tab => ({
        title: tab.title || '',
        url: tab.url || '',
        favIconUrl: tab.favIconUrl || '',
        pinned: tab.pinned || false
      })),
      device: await getDeviceName(),
      createdAt: new Date().toISOString()
    };
    
    const url = getFirestoreUrl(`/users/${currentUser.uid}/sessions`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectToFirestoreDoc(sessionData))
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    showToast('Session sauvegardée !', 'success');
    loadSessions();
  } catch (error) {
    console.error('Error saving session:', error);
    showToast('Erreur lors de la sauvegarde', 'error');
  }
}

// Get device name
async function getDeviceName() {
  try {
    const platformInfo = await chrome.runtime.getPlatformInfo();
    const osMap = {
      'win': 'Windows',
      'mac': 'macOS',
      'linux': 'Linux',
      'cros': 'ChromeOS',
      'android': 'Android'
    };
    return osMap[platformInfo.os] || platformInfo.os;
  } catch {
    return 'Unknown';
  }
}

// Restore a session
async function restoreSession(session) {
  try {
    if (!session.tabs || session.tabs.length === 0) {
      showToast('Cette session est vide', 'error');
      return;
    }
    
    // Filter valid URLs (no chrome:// URLs)
    const urls = session.tabs
      .map(tab => tab.url)
      .filter(url => url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://'));
    
    if (urls.length === 0) {
      showToast('Aucun onglet valide à restaurer', 'error');
      return;
    }
    
    await chrome.windows.create({ url: urls });
    showToast(`${urls.length} onglets restaurés !`, 'success');
  } catch (error) {
    console.error('Error restoring session:', error);
    showToast('Erreur lors de la restauration', 'error');
  }
}

// Delete a session
async function deleteSession(sessionId) {
  if (!currentUser || !sessionId) return;
  
  try {
    const url = getFirestoreUrl(`/users/${currentUser.uid}/sessions/${sessionId}`);
    const response = await fetch(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    showToast('Session supprimée', 'success');
    loadSessions();
  } catch (error) {
    console.error('Error deleting session:', error);
    showToast('Erreur lors de la suppression', 'error');
  }
}

// ============================================
// Utility Functions
// ============================================

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show toast notification
function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// Event Listeners
// ============================================

loginBtn.addEventListener('click', signInWithGoogle);
logoutBtn.addEventListener('click', signOutUser);

saveTabsBtn.addEventListener('click', () => {
  sessionNameInput.value = `Session ${new Date().toLocaleDateString('fr-FR')}`;
  saveModal.classList.remove('hidden');
  sessionNameInput.focus();
  sessionNameInput.select();
});

refreshBtn.addEventListener('click', () => {
  loadSessions();
  loadCurrentTabs();
  showToast('Actualisé !', 'success');
});

cancelSaveBtn.addEventListener('click', () => {
  saveModal.classList.add('hidden');
});

confirmSaveBtn.addEventListener('click', async () => {
  const name = sessionNameInput.value.trim();
  if (name) {
    saveModal.classList.add('hidden');
    await saveCurrentTabs(name);
  }
});

cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.classList.add('hidden');
  sessionToDelete = null;
});

confirmDeleteBtn.addEventListener('click', async () => {
  if (sessionToDelete) {
    deleteModal.classList.add('hidden');
    await deleteSession(sessionToDelete);
    sessionToDelete = null;
  }
});

// Handle Enter key in session name input
sessionNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    confirmSaveBtn.click();
  }
});

// Close modals when clicking outside
saveModal.addEventListener('click', (e) => {
  if (e.target === saveModal) {
    saveModal.classList.add('hidden');
  }
});

deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) {
    deleteModal.classList.add('hidden');
    sessionToDelete = null;
  }
});

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
  loadCurrentTabs();
});
