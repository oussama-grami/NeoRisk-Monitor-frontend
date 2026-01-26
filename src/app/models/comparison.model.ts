import { MLModel } from './baby-health.model';

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

// Helper pour créer des données de performance simulées
export function createMockPerformanceData(): ModelPerformance[] {
  return [
    {
      model: MLModel.DECISION_TREE,
      modelName: 'decision_tree',
      displayName: 'Arbre de Décision',
      color: '#667eea',
      icon: 'bi-diagram-3',
      accuracy: 92.5,
      precision: 91.8,
      recall: 93.2,
      f1Score: 92.5,
      avgResponseTime: 145,
      totalPredictions: 1247,
      successRate: 98.2
    },
    {
      model: MLModel.NAIVE_BAYES,
      modelName: 'naive_bayes',
      displayName: 'Naive Bayes',
      color: '#f5576c',
      icon: 'bi-calculator',
      accuracy: 89.8,
      precision: 88.5,
      recall: 91.0,
      f1Score: 89.7,
      avgResponseTime: 98,
      totalPredictions: 1186,
      successRate: 97.8
    },
    {
      model: MLModel.RANDOM_FOREST,
      modelName: 'random_forest',
      displayName: 'Forêt Aléatoire',
      color: '#00f2fe',
      icon: 'bi-trees',
      accuracy: 95.7,
      precision: 95.2,
      recall: 96.1,
      f1Score: 95.6,
      avgResponseTime: 178,
      totalPredictions: 1302,
      successRate: 99.1
    },
    {
      model: MLModel.KNN,
      modelName: 'knn',
      displayName: 'K Plus Proches Voisins',
      color: '#38f9d7',
      icon: 'bi-hexagon',
      accuracy: 91.3,
      precision: 90.7,
      recall: 92.0,
      f1Score: 91.3,
      avgResponseTime: 132,
      totalPredictions: 1215,
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
