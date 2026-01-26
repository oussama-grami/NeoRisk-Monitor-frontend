// Interface pour les données d'entrée du nouveau-né
export interface BabyHealthData {
  baby_id?: string;
  name?: string;
  gender: 'Male' | 'Female';
  gestational_age_weeks: number;
  birth_weight_kg: number;
  birth_length_cm: number;
  birth_head_circumference_cm: number;
  date?: string;
  age_days: number;
  weight_kg: number;
  length_cm: number;
  head_circumference_cm: number;
  temperature_c: number;
  heart_rate_bpm: number;
  respiratory_rate_bpm: number;
  oxygen_saturation: number;
  feeding_type: 'Breastfeeding' | 'Formula' | 'Mixed';
  feeding_frequency_per_day: number;
  urine_output_count: number;
  stool_count: number;
  jaundice_level_mg_dl: number;
  apgar_score?: number;
  immunizations_done: 'Yes' | 'No';
  reflexes_normal: 'Yes' | 'No';
}

// Interface pour la réponse de prédiction
export interface PredictionResponse {
  prediction: 'Healthy' | 'At Risk';
  confidence?: number;
  model_name: string;
  timestamp?: string;
}

// Interface pour la comparaison des modèles
export interface ModelComparison {
  decision_tree: PredictionResponse;
  naive_bayes: PredictionResponse;
  random_forest: PredictionResponse;
  knn: PredictionResponse;
}

// Interface pour les statistiques du modèle
export interface ModelStats {
  name: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  response_time_ms?: number;
}

// Interface pour l'historique des prédictions
export interface PredictionHistory {
  id: string;
  baby_name: string;
  timestamp: Date;
  input_data: BabyHealthData;
  predictions: ModelComparison;
  consensus: 'Healthy' | 'At Risk';
}

// Énumération pour les modèles ML
export enum MLModel {
  DECISION_TREE = 'decision_tree',
  NAIVE_BAYES = 'naive_bayes',
  RANDOM_FOREST = 'random_forest',
  KNN = 'knn'
}

// Configuration des modèles avec couleurs et icônes
export const MODEL_CONFIG = {
  [MLModel.DECISION_TREE]: {
    name: 'Decision Tree',
    displayName: 'Arbre de Décision',
    color: '#667eea',
    icon: 'bi-diagram-3',
    description: 'Classification par arbre de décision'
  },
  [MLModel.NAIVE_BAYES]: {
    name: 'Naive Bayes',
    displayName: 'Naive Bayes',
    color: '#f5576c',
    icon: 'bi-graph-up',
    description: 'Classification probabiliste bayésienne'
  },
  [MLModel.RANDOM_FOREST]: {
    name: 'Random Forest',
    displayName: 'Forêt Aléatoire',
    color: '#00f2fe',
    icon: 'bi-tree',
    description: 'Ensemble d\'arbres de décision'
  },
  [MLModel.KNN]: {
    name: 'K-Nearest Neighbors',
    displayName: 'K Plus Proches Voisins',
    color: '#38f9d7',
    icon: 'bi-bullseye',
    description: 'Classification par proximité'
  }
};

// Valeurs par défaut pour le formulaire
export const DEFAULT_BABY_DATA: Partial<BabyHealthData> = {
  gender: 'Female',
  gestational_age_weeks: 40,
  birth_weight_kg: 3.3,
  birth_length_cm: 50,
  birth_head_circumference_cm: 32,
  age_days: 5,
  weight_kg: 3.4,
  length_cm: 50.5,
  head_circumference_cm: 32.1,
  temperature_c: 37.0,
  heart_rate_bpm: 140,
  respiratory_rate_bpm: 40,
  oxygen_saturation: 98,
  feeding_type: 'Breastfeeding',
  feeding_frequency_per_day: 8,
  urine_output_count: 6,
  stool_count: 3,
  jaundice_level_mg_dl: 3.0,
  apgar_score: 9,
  immunizations_done: 'Yes',
  reflexes_normal: 'Yes'
};
