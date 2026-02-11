import { MLModel, MODEL_CONFIG } from './baby-health.model';

// Métrique de performance d'un modèle
export interface ModelPerformance {
  model: MLModel;
  modelName: string;
  displayName: string;
  color: string;
  icon: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  avgResponseTime: number;
  totalPredictions: number;
  successRate: number;
}

// Statistiques comparatives
export interface ComparisonStats {
  bestAccuracy: ModelPerformance;
  fastestModel: ModelPerformance;
  mostUsed: ModelPerformance;
  bestF1Score: ModelPerformance;
}

// Historique de performance
export interface PerformanceHistory {
  date: Date;
  modelPerformances: Map<MLModel, number>;
}

// Métriques de confusion
export interface ConfusionMatrix {
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
}

// Données pour graphique de comparaison
export interface ComparisonChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

// Critère de comparaison
export type ComparisonCriterion = 'accuracy' | 'speed' | 'f1score' | 'precision' | 'recall';

// Configuration de comparaison
export interface ComparisonConfig {
  showAccuracy: boolean;
  showSpeed: boolean;
  showF1Score: boolean;
  showPrecision: boolean;
  showRecall: boolean;
  sortBy: ComparisonCriterion;
  ascending: boolean;
}

// Valeurs par défaut pour la configuration
export const DEFAULT_COMPARISON_CONFIG: ComparisonConfig = {
  showAccuracy: true,
  showSpeed: true,
  showF1Score: true,
  showPrecision: false,
  showRecall: false,
  sortBy: 'accuracy',
  ascending: false
};

// ✅ Helper pour créer des données de performance (AVEC MÉTRIQUES STATIQUES)
export function createMockPerformanceData(): ModelPerformance[] {
  return [
    {
      model: MLModel.DECISION_TREE,
      modelName: 'decision_tree',
      displayName: 'Arbre de Décision',
      color: '#667eea',
      icon: 'bi-diagram-3',
      // 🔒 MÉTRIQUES STATIQUES
      accuracy: MODEL_CONFIG[MLModel.DECISION_TREE].staticMetrics.accuracy,
      precision: MODEL_CONFIG[MLModel.DECISION_TREE].staticMetrics.precision,
      recall: MODEL_CONFIG[MLModel.DECISION_TREE].staticMetrics.recall,
      f1Score: MODEL_CONFIG[MLModel.DECISION_TREE].staticMetrics.f1Score,
      // 📊 MÉTRIQUES DYNAMIQUES (fallback mock)
      avgResponseTime: 145,
      totalPredictions: 0,
      successRate: 98.2
    },
    {
      model: MLModel.NAIVE_BAYES,
      modelName: 'naive_bayes',
      displayName: 'Naive Bayes',
      color: '#f5576c',
      icon: 'bi-calculator',
      accuracy: MODEL_CONFIG[MLModel.NAIVE_BAYES].staticMetrics.accuracy,
      precision: MODEL_CONFIG[MLModel.NAIVE_BAYES].staticMetrics.precision,
      recall: MODEL_CONFIG[MLModel.NAIVE_BAYES].staticMetrics.recall,
      f1Score: MODEL_CONFIG[MLModel.NAIVE_BAYES].staticMetrics.f1Score,
      avgResponseTime: 98,
      totalPredictions: 0,
      successRate: 97.8
    },
    {
      model: MLModel.RANDOM_FOREST,
      modelName: 'random_forest',
      displayName: 'Forêt Aléatoire',
      color: '#00f2fe',
      icon: 'bi-trees',
      accuracy: MODEL_CONFIG[MLModel.RANDOM_FOREST].staticMetrics.accuracy,
      precision: MODEL_CONFIG[MLModel.RANDOM_FOREST].staticMetrics.precision,
      recall: MODEL_CONFIG[MLModel.RANDOM_FOREST].staticMetrics.recall,
      f1Score: MODEL_CONFIG[MLModel.RANDOM_FOREST].staticMetrics.f1Score,
      avgResponseTime: 178,
      totalPredictions: 0,
      successRate: 99.1
    },
    {
      model: MLModel.KNN,
      modelName: 'knn',
      displayName: 'K Plus Proches Voisins',
      color: '#38f9d7',
      icon: 'bi-hexagon',
      accuracy: MODEL_CONFIG[MLModel.KNN].staticMetrics.accuracy,
      precision: MODEL_CONFIG[MLModel.KNN].staticMetrics.precision,
      recall: MODEL_CONFIG[MLModel.KNN].staticMetrics.recall,
      f1Score: MODEL_CONFIG[MLModel.KNN].staticMetrics.f1Score,
      avgResponseTime: 132,
      totalPredictions: 0,
      successRate: 98.5
    }
  ];
}

// Helper pour calculer les statistiques comparatives
export function calculateComparisonStats(performances: ModelPerformance[]): ComparisonStats {
  const bestAccuracy = performances.reduce((prev, current) =>
    current.accuracy > prev.accuracy ? current : prev
  );

  const fastestModel = performances.reduce((prev, current) =>
    current.avgResponseTime < prev.avgResponseTime ? current : prev
  );

  const mostUsed = performances.reduce((prev, current) =>
    current.totalPredictions > prev.totalPredictions ? current : prev
  );

  const bestF1Score = performances.reduce((prev, current) =>
    current.f1Score > prev.f1Score ? current : prev
  );

  return {
    bestAccuracy,
    fastestModel,
    mostUsed,
    bestF1Score
  };
}

// Helper pour trier les performances
export function sortPerformances(
  performances: ModelPerformance[],
  criterion: ComparisonCriterion,
  ascending: boolean = false
): ModelPerformance[] {
  const sorted = [...performances].sort((a, b) => {
    let comparison = 0;

    switch (criterion) {
      case 'accuracy':
        comparison = a.accuracy - b.accuracy;
        break;
      case 'speed':
        comparison = a.avgResponseTime - b.avgResponseTime;
        break;
      case 'f1score':
        comparison = a.f1Score - b.f1Score;
        break;
      case 'precision':
        comparison = a.precision - b.precision;
        break;
      case 'recall':
        comparison = a.recall - b.recall;
        break;
    }

    return ascending ? comparison : -comparison;
  });

  return sorted;
}

// Helper pour préparer les données du graphique
export function prepareChartData(performances: ModelPerformance[]): {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string[]; borderColor: string[]; borderWidth: number }[]
} {
  return {
    labels: performances.map(p => p.displayName),
    datasets: [
      {
        label: 'Précision (%)',
        data: performances.map(p => p.accuracy),
        backgroundColor: performances.map(p => p.color + '80'),
        borderColor: performances.map(p => p.color),
        borderWidth: 2
      }
    ]
  };
}
