import { MLModel } from './baby-health.model';

// Résultat d'un modèle individuel
export interface SingleModelResult {
  model: MLModel;
  modelName: string;
  displayName: string;
  prediction: 'Healthy' | 'At Risk';
  confidence: number;
  responseTime: number;
  color: string;
  icon: string;
}

// Résultat complet avec tous les modèles
export interface PredictionResult {
  timestamp: Date;
  babyName?: string;
  models: SingleModelResult[];
  consensus: 'Healthy' | 'At Risk';
  consensusConfidence: number;
  averageResponseTime: number;
  healthyCount: number;
  atRiskCount: number;
}

// Facteurs de risque détectés
export interface RiskFactor {
  category: string;
  field: string;
  value: number | string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  icon: string;
  color: string;
}

// Recommandations médicales
export interface MedicalRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  icon: string;
  color: string;
}

// État de la prédiction
export type PredictionState = 'idle' | 'loading' | 'success' | 'error';

// Statistiques de comparaison
export interface ComparisonStats {
  agreement: number; // Pourcentage d'accord entre modèles
  avgConfidence: number;
  fastestModel: string;
  slowestModel: string;
  mostConfidentModel: string;
}

// Export pour utilisation dans les composants
export interface PredictionResponse {
  success: boolean;
  result?: PredictionResult;
  error?: string;
  riskFactors?: RiskFactor[];
  recommendations?: MedicalRecommendation[];
  comparisonStats?: ComparisonStats;
}

// Helper pour créer un résultat vide
export function createEmptyResult(): PredictionResult {
  return {
    timestamp: new Date(),
    models: [],
    consensus: 'Healthy',
    consensusConfidence: 0,
    averageResponseTime: 0,
    healthyCount: 0,
    atRiskCount: 0
  };
}

// Helper pour calculer le consensus
export function calculateConsensus(models: SingleModelResult[]): {
  consensus: 'Healthy' | 'At Risk';
  confidence: number;
  healthyCount: number;
  atRiskCount: number;
} {
  const healthyCount = models.filter(m => m.prediction === 'Healthy').length;
  const atRiskCount = models.length - healthyCount;
  const consensus = healthyCount >= models.length / 2 ? 'Healthy' : 'At Risk';
  const agreement = Math.max(healthyCount, atRiskCount) / models.length;

  return {
    consensus,
    confidence: agreement * 100,
    healthyCount,
    atRiskCount
  };
}

// Helper pour calculer les statistiques de comparaison
export function calculateComparisonStats(models: SingleModelResult[]): ComparisonStats {
  const avgConfidence = models.reduce((sum, m) => sum + m.confidence, 0) / models.length;

  const sortedByTime = [...models].sort((a, b) => a.responseTime - b.responseTime);
  const sortedByConfidence = [...models].sort((a, b) => b.confidence - a.confidence);

  const agreement = calculateConsensus(models).confidence;

  return {
    agreement,
    avgConfidence,
    fastestModel: sortedByTime[0]?.displayName || '',
    slowestModel: sortedByTime[sortedByTime.length - 1]?.displayName || '',
    mostConfidentModel: sortedByConfidence[0]?.displayName || ''
  };
}
