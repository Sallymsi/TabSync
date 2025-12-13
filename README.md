# Tab Sync - Extension Chrome

🔄 **Synchronisez vos onglets entre différents appareils avec Firebase**

## Fonctionnalités

- ✅ Connexion sécurisée avec Google (Firebase Auth)
- ✅ Sauvegarde des onglets ouverts dans le cloud (Firestore)
- ✅ Restauration des sessions sur n'importe quel appareil
- ✅ Identification de l'appareil source
- ✅ Interface moderne et intuitive

## Installation

### 1. Configuration Firebase

#### Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur **"Ajouter un projet"**
3. Donnez un nom à votre projet (ex: "tab-sync")
4. Désactivez Google Analytics si vous le souhaitez
5. Cliquez sur **"Créer un projet"**

#### Configurer l'authentification

1. Dans la console Firebase, allez dans **Authentication** > **Sign-in method**
2. Activez **Google** comme fournisseur de connexion
3. Configurez l'email d'assistance et sauvegardez

#### Configurer Firestore

1. Allez dans **Firestore Database**
2. Cliquez sur **"Créer une base de données"**
3. Choisissez **"Mode production"**
4. Sélectionnez une région proche de vous

#### Règles Firestore

Dans **Firestore Database** > **Règles**, remplacez le contenu par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Récupérer les clés de configuration

1. Allez dans **Paramètres du projet** (⚙️) > **Général**
2. Descendez jusqu'à **"Vos applications"**
3. Cliquez sur l'icône Web (`</>`)
4. Nommez l'application (ex: "Tab Sync Chrome")
5. Copiez les valeurs de configuration

### 2. Configuration Google Cloud Console

Pour que l'authentification fonctionne avec une extension Chrome :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet Firebase
3. Allez dans **APIs & Services** > **Credentials**
4. Cliquez sur **"Create Credentials"** > **"OAuth client ID"**
5. Type d'application : **"Chrome Extension"**
6. Nom : "Tab Sync"
7. **Application ID** : Vous l'obtiendrez après avoir chargé l'extension (étape 4)

### 3. Configuration de l'extension

#### Modifier `popup.js`

Remplacez la configuration Firebase au début du fichier :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJET.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJET.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

#### Modifier `manifest.json`

Remplacez les valeurs OAuth2 :

```json
"oauth2": {
  "client_id": "VOTRE_CLIENT_ID.apps.googleusercontent.com",
  "scopes": [
    "openid",
    "email",
    "profile"
  ]
}
```

### 4. Charger l'extension dans Chrome

1. Ouvrez Chrome et allez à `chrome://extensions/`
2. Activez le **"Mode développeur"** (en haut à droite)
3. Cliquez sur **"Charger l'extension non empaquetée"**
4. Sélectionnez le dossier de l'extension
5. **Copiez l'ID de l'extension** affiché (ex: `abcdefghijklmnopqrstuvwxyz123456`)

### 5. Finaliser la configuration OAuth

1. Retournez dans Google Cloud Console > Credentials
2. Modifiez votre Client OAuth Chrome Extension
3. Collez l'**ID de l'extension** dans "Application ID"
4. Sauvegardez

## Création des icônes PNG

L'extension nécessite des icônes PNG. Vous pouvez :

### Option 1 : Convertir les SVG
Utilisez un outil en ligne comme [SVG to PNG](https://svgtopng.com/) pour convertir :
- `icons/icon16.svg` → `icons/icon16.png`
- `icons/icon48.svg` → `icons/icon48.png`
- `icons/icon128.svg` → `icons/icon128.png`

### Option 2 : Utiliser des icônes temporaires
Créez des images PNG simples de 16x16, 48x48 et 128x128 pixels.

## Utilisation

1. Cliquez sur l'icône de l'extension
2. Connectez-vous avec votre compte Google
3. **Sauvegarder** : Cliquez sur "💾 Sauvegarder les onglets actuels"
4. **Restaurer** : Cliquez sur "📂" à côté d'une session sauvegardée
5. **Supprimer** : Cliquez sur "🗑️" pour supprimer une session

## Structure des fichiers

```
Extension/
├── manifest.json      # Configuration de l'extension
├── popup.html         # Interface utilisateur
├── popup.js           # Logique de l'interface
├── background.js      # Service worker
├── styles.css         # Styles CSS
├── icons/
│   ├── icon16.svg     # Icône 16x16
│   ├── icon48.svg     # Icône 48x48
│   └── icon128.svg    # Icône 128x128
└── README.md          # Documentation
```

## Structure Firestore

```
users/
└── {userId}/
    └── sessions/
        └── {sessionId}/
            ├── name: string
            ├── device: string
            ├── createdAt: timestamp
            └── tabs: array
                └── {
                    title: string,
                    url: string,
                    favIconUrl: string,
                    pinned: boolean
                }
```

## Dépannage

### Erreur "Identity API not available"
- Vérifiez que le `client_id` OAuth est correct
- Assurez-vous que l'ID de l'extension est ajouté dans Google Cloud Console

### Erreur Firebase
- Vérifiez que les règles Firestore autorisent l'accès
- Vérifiez que l'authentification Google est activée

### Les icônes ne s'affichent pas
- Convertissez les fichiers SVG en PNG
- Vérifiez les chemins dans `manifest.json`

## Licence

MIT License - Utilisez librement ce projet !
