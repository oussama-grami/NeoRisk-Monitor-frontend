# 🏥 NeoRisk Monitor - Frontend Angular

![Angular](https://img.shields.io/badge/Angular-18+-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-10+-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

> Interface web moderne pour le système de prédiction de santé des nouveau-nés

Application Angular standalone avec dashboard interactif, prédictions multi-modèles ML, historique Firebase et comparaison des performances.

---

## 📋 Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du Projet](#-structure-du-projet)
- [Métriques des Modèles](#-métriques-des-modèles)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Vue d'ensemble

NeoRisk Monitor Frontend permet aux professionnels de santé d'évaluer les risques de santé chez les nouveau-nés en utilisant 4 modèles de Machine Learning.

### Caractéristiques

- 📊 **Dashboard interactif** - Statistiques en temps réel
- 🤖 **4 modèles ML** - Decision Tree, Random Forest, KNN, Naive Bayes
- 📈 **Comparaison** - Analyse des performances
- 🗄️ **Historique Firebase** - Sauvegarde des prédictions
- 📱 **Responsive** - Mobile, tablette, desktop
- 🎨 **UI moderne** - Animations fluides

---

## ✨ Fonctionnalités

### 1. Dashboard
- Vue d'ensemble des statistiques globales
- Cartes des 4 modèles ML avec performances
- Graphique de comparaison
- Actions rapides

### 2. Prédiction
- Formulaire complet avec validation (24 champs)
- Prédiction simultanée avec 4 modèles
- Consensus automatique avec confiance
- Sauvegarde Firebase

### 3. Comparaison
- Vue comparative des 4 modèles
- Métriques statiques : accuracy, precision, recall, F1-score
- Métriques dynamiques : temps moyen, nombre de prédictions
- Identification du meilleur modèle par métrique

### 4. Historique
- Liste des prédictions passées
- Filtres et recherche
- Tri et export

---

## 🏗️ Architecture
```
┌────────────────────────────────────────┐
│   Frontend Angular (Port 4200)        │
│  ┌──────────┐  ┌──────────────────┐  │
│  │Dashboard │  │ Prediction       │  │
│  │Comparison│  │ History          │  │
│  └────┬─────┘  └────┬─────────────┘  │
│       │             │                 │
│  ┌────▼─────────────▼──────────────┐ │
│  │   Services (Firebase + HTTP)    │ │
│  └────┬─────────────┬───────────────┘ │
└───────┼─────────────┼─────────────────┘
        ▼             ▼
┌─────────────┐ ┌──────────────────┐
│  Firebase   │ │  Backend ML APIs │
│  Firestore  │ │  Ports 5001-5004 │
└─────────────┘ └──────────────────┘
```

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+
- **Angular CLI** 18+
- **Backend ML APIs** actifs (ports 5001-5004)
- **Compte Firebase**

### Installation
```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/neorisk-monitor-frontend.git
cd neorisk-monitor-frontend

# 2. Installer les dépendances
npm install

# 3. Installer Angular CLI (si nécessaire)
npm install -g @angular/cli
```

---

## ⚙️ Configuration

### 1. Configuration Firebase

Créer `src/environments/environment.development.ts` :
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "VOTRE_API_KEY",
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet-id",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
  },
  apiUrls: {
    decisionTree: 'http://localhost:5001',
    randomForest: 'http://localhost:5002',
    knn: 'http://localhost:5003',
    naiveBayes: 'http://localhost:5004'
  },
  apiEndpoints: {
    decisionTree: '/decisionTree/predict',
    randomForest: '/randomForest/predict',
    knn: '/knn/predict',
    naiveBayes: '/naiveBayes/predict'
  }
};
```

### 2. Obtenir les credentials Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un projet
3. **Project Settings** > **General** > Copier la configuration
4. Activer **Firestore Database**

### 3. Règles Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /predictions/{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 💻 Utilisation

### Démarrer l'application
```bash
# Lancer le serveur de développement
ng serve

# Avec ouverture automatique
ng serve --open
```

Application accessible sur **http://localhost:4200**

### Build de production
```bash
ng build --configuration production
```

---

## 📂 Structure du Projet
```
src/
├── app/
│   ├── components/
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── prediction/         # Formulaire de prédiction
│   │   ├── comparison/         # Comparaison des modèles
│   │   └── history/            # Historique des prédictions
│   │
│   ├── services/
│   │   ├── firebase-stats.service.ts      # Stats et performances
│   │   ├── firebase-history.service.ts    # Gestion historique
│   │   ├── prediction.service.ts          # Appels API ML
│   │   └── seeder.service.ts              # Génération données test
│   │
│   ├── models/
│   │   ├── baby-health.model.ts           # Données bébé + MODEL_CONFIG
│   │   ├── comparison.model.ts            # Performances modèles
│   │   ├── history.model.ts               # Entrées historique
│   │   └── ...
│   │
│   └── app.routes.ts                      # Routes de l'application
│
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
│
└── index.html
```

---

## 📊 Métriques des Modèles

### Configuration des métriques statiques

Les performances des modèles sont définies dans `src/app/models/baby-health.model.ts` :
```typescript
export const MODEL_CONFIG = {
  [MLModel.DECISION_TREE]: {
    name: 'Decision Tree',
    displayName: 'Arbre de Décision',
    color: '#667eea',
    icon: 'bi-diagram-3',
    staticMetrics: {
      accuracy: 91.3,    // 🔒 Fixe
      precision: 90.8,   // 🔒 Fixe
      recall: 90.5,      // 🔒 Fixe
      f1Score: 90.6      // 🔒 Fixe
    }
  },
  [MLModel.NAIVE_BAYES]: {
    name: 'Naive Bayes',
    displayName: 'Naive Bayes',
    color: '#f5576c',
    icon: 'bi-graph-up',
    staticMetrics: {
      accuracy: 94.2,
      precision: 94.5,
      recall: 94.2,
      f1Score: 94.3
    }
  },
  [MLModel.RANDOM_FOREST]: {
    name: 'Random Forest',
    displayName: 'Forêt Aléatoire',
    color: '#00f2fe',
    icon: 'bi-tree',
    staticMetrics: {
      accuracy: 97.0,
      precision: 87.0,
      recall: 93.0,
      f1Score: 90.0
    }
  },
  [MLModel.KNN]: {
    name: 'K-Nearest Neighbors',
    displayName: 'K Plus Proches Voisins',
    color: '#38f9d7',
    icon: 'bi-bullseye',
    staticMetrics: {
      accuracy: 95.0,
      precision: 84.0,
      recall: 74.0,
      f1Score: 79.0
    }
  }
};
```

### Types de métriques

**🔒 Métriques STATIQUES** (ne changent jamais) :
- `accuracy` - Précision globale
- `precision` - Précision par classe
- `recall` - Rappel
- `f1Score` - Score F1

**📊 Métriques DYNAMIQUES** (calculées en temps réel) :
- `totalPredictions` - Nombre total de prédictions
- `avgResponseTime` - Temps de réponse moyen
- `successRate` - Taux de succès

### Performance comparative

| Modèle | Accuracy | Precision | Recall | F1-Score |
|--------|----------|-----------|--------|----------|
| **Random Forest** | 🥇 **97.0%** | 87.0% | **93.0%** | 90.0% |
| **Naive Bayes** | 🥈 **94.2%** | **94.5%** | 94.2% | **94.3%** |
| **Decision Tree** | 🥉 **91.3%** | 90.8% | 90.5% | 90.6% |
| **KNN** | **95.0%** | 84.0% | 74.0% | 79.0% |

---

## 🎨 Interface utilisateur

### Routes disponibles

| Route | Composant | Description |
|-------|-----------|-------------|
| `/dashboard` | Dashboard | Vue d'ensemble |
| `/prediction` | Prediction | Nouvelle prédiction |
| `/comparison` | Comparison | Comparaison modèles |
| `/history` | History | Historique |

### Formulaire de prédiction (24 champs)

**Informations générales**
- Genre, nom

**Données de naissance**
- Âge gestationnel, poids, taille, périmètre crânien, score APGAR

**Données actuelles**
- Âge en jours, poids, taille, périmètre crânien

**Signes vitaux**
- Température, fréquence cardiaque, fréquence respiratoire, saturation oxygène

**Alimentation**
- Type, fréquence

**Élimination**
- Mictions, selles

**Observations médicales**
- Jaunisse, vaccinations, réflexes

---

## 🔧 Services principaux

### FirebaseStatsService
```typescript
// Statistiques dashboard
getDashboardStats(): Observable<{
  totalPredictions: number;
  healthyRate: number;
  activeAlerts: number;
  avgAccuracy: number;
  recentPredictions: HistoryEntry[];
}>

// Performances modèles (statiques + dynamiques)
getModelPerformances(): Observable<ModelPerformance[]>
```

### PredictionService
```typescript
// Prédiction avec un modèle
predictWithModel(model: MLModel, data: BabyHealthData): Observable<PredictionResponse>

// Prédiction avec tous les modèles
predictWithAllModels(data: BabyHealthData): Observable<ModelComparison>

// Consensus
getConsensus(comparison: ModelComparison): 'Healthy' | 'At Risk'
```

### FirebaseHistoryService
```typescript
// Récupérer l'historique
getHistory(): Observable<HistoryEntry[]>

// Ajouter une prédiction
addEntry(entry: Omit<HistoryEntry, 'id'>): Observable<string>

// Supprimer
deleteEntry(id: string): Observable<void>
```

---

## 🐛 Troubleshooting

### Firebase not initialized

**Erreur :**
```
Firebase: No Firebase App '[DEFAULT]' has been created
```

**Solution :**
Vérifier `environment.development.ts` et `app.config.ts`
```typescript
// app.config.ts
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment.development';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    // ...
  ]
};
```

---

### CORS bloqué

**Erreur :**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution :**
Vérifier que le backend Flask a CORS activé :
```python
from flask_cors import CORS
CORS(app)
```

---

### Backend non accessible

**Solution :**
Vérifier que les 4 APIs sont lancées :
```bash
curl http://localhost:5001/api/health
curl http://localhost:5002/api/health
curl http://localhost:5003/api/health
curl http://localhost:5004/api/health
```

---

### Dashboard vide

**Solution :**
Générer des données de test avec SeederService :
```typescript
// Dans admin.component.ts ou dashboard.component.ts
constructor(private seeder: SeederService) {}

generateTestData() {
  this.seeder.seedDatabase(50).then(() => {
    console.log('50 entrées créées');
    window.location.reload();
  });
}
```

---

## 🚀 Déploiement

### Firebase Hosting
```bash
# 1. Installer Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Init
firebase init hosting

# 4. Build
ng build --configuration production

# 5. Deploy
firebase deploy --only hosting
```

---

## 📄 License

MIT License - Copyright (c) 2025 NeoRisk Monitor

---

## 🔗 Liens

- 📖 [Angular Documentation](https://angular.dev/)
- 🔥 [Firebase Documentation](https://firebase.google.com/docs)
- 🌐 [Backend Repository](https://github.com/votre-username/neorisk-monitor-backend)

---

<div align="center">

**⭐ Si ce projet vous a été utile, donnez-lui une étoile ! ⭐**

Made with ❤️

</div>
