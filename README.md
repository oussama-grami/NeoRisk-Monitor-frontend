# 🏥 NeoRisk Monitor - Backend ML API

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.2+-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

> Système de prédiction de santé pour nouveau-nés - Backend ML multi-modèles avec Flask APIs

API backend déployant 4 modèles de Machine Learning pour prédire les risques de santé chez les nouveau-nés. Chaque modèle tourne sur son propre microservice Flask indépendant.

---

## 📋 Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Modèles ML](#-modèles-ml)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Endpoints API](#-endpoints-api)
- [Dataset](#-dataset)
- [Performance](#-performance-des-modèles)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Vue d'ensemble

NeoRisk Monitor Backend expose 4 modèles ML pour classifier l'état de santé des nouveau-nés :
- ✅ **Healthy** (En bonne santé)
- ⚠️ **At Risk** (À risque)

### Caractéristiques

- 🔬 **4 modèles ML indépendants** - Decision Tree, Random Forest, KNN, Naive Bayes
- 🚀 **Architecture microservices** - Chaque modèle sur son propre port
- 📊 **Preprocessing automatisé** - Feature engineering et normalisation
- 🔄 **CORS activé** - Prêt pour intégration frontend
- 💾 **Modèles persistés** - Sauvegarde avec joblib

---

## 🏗️ Architecture
```
┌──────────────────────────────────────────────┐
│         Frontend Angular (Port 4200)         │
└──────────────┬───────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────┐
    ▼          ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────┐ ┌──────────┐
│Decision │ │ Random  │ │ KNN │ │  Naive   │
│  Tree   │ │ Forest  │ │     │ │  Bayes   │
│Port 5001│ │Port 5002│ │5003 │ │Port 5004 │
└─────────┘ └─────────┘ └─────┘ └──────────┘
```

---

## 🤖 Modèles ML

### 1. Decision Tree Classifier
**Port:** 5001 | **Endpoint:** `/decisionTree/predict`

**Performance:**
- ✅ Accuracy: **91.3%**
- 📊 Precision: **90.8%**
- 🎯 Recall: **90.5%**
- 🔥 F1-Score: **90.6%**

---

### 2. Random Forest Classifier
**Port:** 5002 | **Endpoint:** `/randomForest/predict`

**Performance:**
- ✅ Accuracy: **97.0%** ⭐ (Meilleur)
- 📊 Precision: **87.0%**
- 🎯 Recall: **93.0%**
- 🔥 F1-Score: **90.0%**

---

### 3. K-Nearest Neighbors (KNN)
**Port:** 5003 | **Endpoint:** `/knn/predict`

**Performance:**
- ✅ Accuracy: **95.0%**
- 📊 Precision: **84.0%**
- 🎯 Recall: **74.0%**
- 🔥 F1-Score: **79.0%**

---

### 4. Naive Bayes (Gaussian)
**Port:** 5004 | **Endpoint:** `/naiveBayes/predict`

**Performance:**
- ✅ Accuracy: **94.2%**
- 📊 Precision: **94.5%**
- 🎯 Recall: **94.2%**
- 🔥 F1-Score: **94.3%**

---

## 🚀 Installation

### Prérequis

- **Python 3.8+**
- **pip**
- **Dataset** : `newborn_health_monitoring_with_risk.csv`

### Installation
```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/neorisk-monitor-backend.git
cd neorisk-monitor-backend

# 2. Créer un environnement virtuel
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Vérifier que le dataset est présent
ls newborn_health_monitoring_with_risk.csv
```

---

## 💻 Utilisation

### Lancer tous les modèles

**Ouvrir 4 terminaux et lancer :**
```bash
# Terminal 1
python decision_tree.py

# Terminal 2
python random_forest.py

# Terminal 3
python knn.py

# Terminal 4
python naive_bayes.py
```

### Vérifier que les APIs sont actives
```bash
curl http://localhost:5001/api/health
curl http://localhost:5002/api/health
curl http://localhost:5003/api/health
curl http://localhost:5004/api/health
```

**Réponse attendue:**
```json
{
  "status": "healthy",
  "model": "Decision Tree",
  "port": 5001,
  "model_loaded": true,
  "preprocessor_loaded": true
}
```

---

## 📡 Endpoints API

### 1. Health Check
```bash
GET /api/health
```

**Réponse:**
```json
{
  "status": "healthy",
  "model": "Decision Tree",
  "port": 5001,
  "model_loaded": true,
  "preprocessor_loaded": true
}
```

---

### 2. Model Info
```bash
GET /api/info
```

**Réponse:**
```json
{
  "model_name": "Decision Tree",
  "model_type": "Decision Tree Classifier",
  "port": 5001,
  "n_features": 32,
  "classes": ["At Risk", "Healthy"]
}
```

---

### 3. Prédiction
```bash
POST /decisionTree/predict
Content-Type: application/json
```

**Body:**
```json
{
  "gender": "Female",
  "gestational_age_weeks": 40,
  "birth_weight_kg": 3.3,
  "birth_length_cm": 50,
  "birth_head_circumference_cm": 32,
  "age_days": 5,
  "weight_kg": 3.4,
  "length_cm": 50.5,
  "head_circumference_cm": 32.1,
  "temperature_c": 37.0,
  "heart_rate_bpm": 140,
  "respiratory_rate_bpm": 40,
  "oxygen_saturation": 98,
  "feeding_type": "Breastfeeding",
  "feeding_frequency_per_day": 8,
  "urine_output_count": 6,
  "stool_count": 3,
  "jaundice_level_mg_dl": 3.0,
  "apgar_score": 9,
  "immunizations_done": "Yes",
  "reflexes_normal": "Yes"
}
```

**Réponse:**
```json
{
  "prediction": "Healthy",
  "confidence": 95.67,
  "model_name": "Decision Tree"
}
```

---

### Exemple cURL
```bash
curl -X POST http://localhost:5001/decisionTree/predict \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "Male",
    "gestational_age_weeks": 38,
    "birth_weight_kg": 3.2,
    "birth_length_cm": 49,
    "birth_head_circumference_cm": 31,
    "age_days": 7,
    "weight_kg": 3.1,
    "length_cm": 49.5,
    "head_circumference_cm": 31.5,
    "temperature_c": 36.8,
    "heart_rate_bpm": 145,
    "respiratory_rate_bpm": 42,
    "oxygen_saturation": 97,
    "feeding_type": "Formula",
    "feeding_frequency_per_day": 6,
    "urine_output_count": 5,
    "stool_count": 2,
    "jaundice_level_mg_dl": 4.2,
    "apgar_score": 8,
    "immunizations_done": "No",
    "reflexes_normal": "Yes"
  }'
```

---

## 📊 Dataset

### Features (24 colonnes)

| Feature | Type | Description | Exemple |
|---------|------|-------------|---------|
| `gender` | str | Genre | "Male" / "Female" |
| `gestational_age_weeks` | int | Âge gestationnel | 40 |
| `birth_weight_kg` | float | Poids de naissance | 3.3 |
| `birth_length_cm` | float | Taille de naissance | 50.0 |
| `birth_head_circumference_cm` | float | Périmètre crânien | 32.0 |
| `age_days` | int | Âge en jours | 5 |
| `weight_kg` | float | Poids actuel | 3.4 |
| `length_cm` | float | Taille actuelle | 50.5 |
| `head_circumference_cm` | float | Périmètre crânien | 32.1 |
| `temperature_c` | float | Température | 37.0 |
| `heart_rate_bpm` | int | Fréquence cardiaque | 140 |
| `respiratory_rate_bpm` | int | Fréquence respiratoire | 40 |
| `oxygen_saturation` | int | Saturation oxygène | 98 |
| `feeding_type` | str | Type alimentation | "Breastfeeding" |
| `feeding_frequency_per_day` | int | Fréquence alimentation | 8 |
| `urine_output_count` | int | Mictions | 6 |
| `stool_count` | int | Selles | 3 |
| `jaundice_level_mg_dl` | float | Jaunisse | 3.0 |
| `apgar_score` | int | Score APGAR | 9 |
| `immunizations_done` | str | Vaccinations | "Yes" / "No" |
| `reflexes_normal` | str | Réflexes | "Yes" / "No" |

### Target Variable

| Variable | Valeurs | Description |
|----------|---------|-------------|
| `risk_level` | "Healthy" / "At Risk" | État de santé |

---

## 📈 Performance des Modèles

| Modèle | Accuracy | Precision | Recall | F1-Score | Vitesse |
|--------|----------|-----------|--------|----------|---------|
| **Random Forest** | 🥇 **97.0%** | 87.0% | **93.0%** | 90.0% | 178ms |
| **Naive Bayes** | 🥈 **94.2%** | **94.5%** | 94.2% | **94.3%** | 98ms ⚡ |
| **Decision Tree** | 🥉 **91.3%** | 90.8% | 90.5% | 90.6% | 145ms |
| **KNN** | **80.0%** | 84.0% | 74.0% | 79.0% | 132ms |

### Recommandations

- 🎯 **Production** : Random Forest (meilleure accuracy)
- ⚡ **Rapidité** : Naive Bayes (98ms, 94.2% accuracy)
- 📊 **Interprétabilité** : Decision Tree (visualisable)

---

## 🐛 Troubleshooting

### Port déjà utilisé
```bash
# macOS/Linux
lsof -i :5001
kill -9 <PID>

# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### Module non trouvé
```bash
# Activer l'environnement virtuel
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Réinstaller
pip install -r requirements.txt
```

### Dataset introuvable
```bash
# Vérifier la présence
ls newborn_health_monitoring_with_risk.csv

# Le fichier doit être dans le même dossier que les .py
```

### CORS bloqué

Vérifier que `flask-cors` est installé et activé dans le code :
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # ✅
```

---

## 📄 Structure du Projet
```
backend/
├── decision_tree.py
├── random_forest.py
├── knn.py
├── naive_bayes.py
├── requirements.txt
├── newborn_health_monitoring_with_risk.csv
└── README.md
```

---

## 📄 License

MIT License - Copyright (c) 2025 NeoRisk Monitor

---

## 👥 Auteurs

Développé par l'équipe NeoRisk Monitor

---

## 📞 Contact

- 📧 Email: contact@neorisk-monitor.com
- 🌐 Frontend: [Repository Angular](https://github.com/votre-username/neorisk-monitor-frontend)

---

<div align="center">

**⭐ Si ce projet vous a été utile, donnez-lui une étoile ! ⭐**

Made with ❤️ by NeoRisk Monitor Team

</div>
