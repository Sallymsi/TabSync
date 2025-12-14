# Tab Sync - Extension Chrome

🔄 **Synchronisez vos onglets entre différents appareils grâce au cloud**

Une extension Chrome puissante qui vous permet de sauvegarder, synchroniser et restaurer vos sessions de navigation sur tous vos appareils connectés à votre compte Google.

---

## 🎯 Fonctionnalités

### 🔐 Authentification Sécurisée

L'extension utilise **Firebase Authentication** avec connexion Google pour garantir la sécurité de vos données :

- **Connexion en un clic** : Utilisez votre compte Google existant, aucune inscription supplémentaire requise
- **Tokens sécurisés** : Les tokens d'authentification sont automatiquement rafraîchis pour maintenir votre session active
- **Données privées** : Chaque utilisateur n'a accès qu'à ses propres sessions grâce aux règles de sécurité Firestore
- **Déconnexion complète** : Révocation des tokens lors de la déconnexion pour une sécurité maximale

---

### 💾 Sauvegarde des Sessions

Capturez l'état complet de votre navigation en un instant :

- **Sauvegarde instantanée** : Un clic suffit pour sauvegarder tous vos onglets ouverts
- **Nommage personnalisé** : Donnez un nom significatif à chaque session (ex: "Projet travail", "Recherches vacances")
- **Informations complètes** : Pour chaque onglet, l'extension sauvegarde :
  - Le titre de la page
  - L'URL complète
  - L'icône (favicon) du site
  - L'état épinglé de l'onglet
- **Horodatage automatique** : Chaque session est datée pour un suivi précis
- **Détection de l'appareil** : L'extension identifie automatiquement l'OS (Windows, macOS, Linux, ChromeOS, Android)

---

### 🔄 Synchronisation Multi-Appareils

Retrouvez vos onglets partout où vous êtes connecté :

- **Cloud Firebase** : Vos sessions sont stockées de manière sécurisée dans Firestore
- **Accès universel** : Connectez-vous sur n'importe quel appareil avec Chrome pour retrouver vos sessions
- **Synchronisation en temps réel** : Rafraîchissez pour voir les sessions ajoutées depuis d'autres appareils
- **Identification de la source** : Voyez sur quel appareil chaque session a été créée (badge Windows, macOS, etc.)

---

### 📂 Restauration Intelligente

Récupérez vos onglets exactement comme vous les aviez laissés :

- **Restauration complète** : Tous les onglets d'une session s'ouvrent dans une nouvelle fenêtre
- **Filtrage automatique** : Les URLs internes de Chrome (`chrome://`) sont automatiquement exclues pour éviter les erreurs
- **Préservation de l'ordre** : Les onglets sont restaurés dans l'ordre de sauvegarde
- **Feedback instantané** : Notification du nombre d'onglets restaurés avec succès

---

### 🗑️ Gestion des Sessions

Gardez votre liste de sessions organisée :

- **Suppression simple** : Supprimez les sessions dont vous n'avez plus besoin
- **Confirmation de sécurité** : Une modal de confirmation évite les suppressions accidentelles
- **Liste triée** : Les sessions les plus récentes apparaissent en premier
- **Informations détaillées** : Visualisez le nombre d'onglets, la date et l'appareil source pour chaque session

---

### 👁️ Aperçu des Onglets Actuels

Visualisez votre navigation actuelle avant de sauvegarder :

- **Liste complète** : Tous les onglets de la fenêtre actuelle sont affichés
- **Favicons** : Les icônes des sites facilitent l'identification visuelle
- **Compteur** : Le nombre total d'onglets est affiché en temps réel
- **Titres complets** : Survolez un onglet pour voir l'URL complète

---

### 🎨 Interface Moderne

Une expérience utilisateur soignée et intuitive :

- **Design épuré** : Interface minimaliste inspirée de Material Design
- **Couleurs Google** : Palette de couleurs familière et agréable
- **Animations fluides** : Transitions douces pour une expérience premium
- **Notifications toast** : Feedback visuel pour toutes les actions (succès, erreur)
- **Modales élégantes** : Dialogues de confirmation stylisés
- **Responsive** : Interface adaptée à la taille du popup Chrome

---

## 🛡️ Sécurité & Confidentialité

- **Authentification Firebase** : Protocole OAuth 2.0 standard de l'industrie
- **Règles Firestore strictes** : Chaque utilisateur ne peut accéder qu'à ses propres données
- **Pas de tracking** : Aucune donnée de navigation n'est partagée avec des tiers
- **Stockage sécurisé** : Les tokens sont stockés localement de manière sécurisée
- **Open Source** : Code source transparent et vérifiable

---

## 📁 Structure des Données

Chaque session sauvegardée contient :

```
Session
├── name          → Nom personnalisé de la session
├── device        → Appareil source (Windows, macOS, Linux...)
├── createdAt     → Date et heure de création
└── tabs[]        → Liste des onglets
    ├── title     → Titre de la page
    ├── url       → Adresse complète
    ├── favIconUrl→ Icône du site
    └── pinned    → État épinglé (true/false)
```

---

## 🚀 Cas d'Utilisation

| Scénario | Comment Tab Sync aide |
|----------|----------------------|
| **Travail → Maison** | Sauvegardez vos recherches au bureau, continuez chez vous |
| **Recherches projet** | Gardez des collections d'onglets thématiques |
| **Partage d'appareils** | Retrouvez vos onglets après qu'un autre utilisateur ait fermé Chrome |
| **Avant mise à jour** | Sauvegardez avant une mise à jour système risquée |
| **Organisation** | Créez des sessions par projet/thème que vous pouvez rouvrir à volonté |
| **Backup** | Protection contre les crashes ou fermetures accidentelles |

---

## 📝 Licence

MIT License - Utilisez librement ce projet !

---

**Développé avec ❤️ pour simplifier votre navigation quotidienne**
