import { MLModel } from './baby-health.model';

// Entrée d'historique de prédiction
export interface HistoryEntry {
  id: string;
  timestamp: Date;
  babyName?: string;
  babyGender: 'Male' | 'Female';
  babyAge: number; // en jours
  modelsUsed: MLModel[];
  consensus: 'Healthy' | 'At Risk';
  consensusConfidence: number;
  healthyCount: number;
  atRiskCount: number;
  avgResponseTime: number;
  riskFactorsCount: number;
  notes?: string;
}

// Filtres pour l'historique
export interface HistoryFilters {
  searchQuery: string;
  dateFrom?: Date;
  dateTo?: Date;
  consensus?: 'Healthy' | 'At Risk' | 'All';
  model?: MLModel | 'All';
  sortBy: HistorySortCriterion;
  sortOrder: 'asc' | 'desc';
}

// Critères de tri
export type HistorySortCriterion = 'date' | 'name' | 'confidence' | 'age';

// Statistiques d'historique
export interface HistoryStats {
  totalPredictions: number;
  healthyPredictions: number;
  atRiskPredictions: number;
  avgConfidence: number;
  mostUsedModel: string;
  recentTrend: 'improving' | 'stable' | 'declining';
}

// Configuration d'export
export interface ExportConfig {
  format: 'json' | 'csv';
  includeDetails: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Valeurs par défaut pour les filtres
export const DEFAULT_FILTERS: HistoryFilters = {
  searchQuery: '',
  consensus: 'All',
  model: 'All',
  sortBy: 'date',
  sortOrder: 'desc'
};

// Helper pour créer des entrées d'historique simulées
export function createMockHistoryEntries(): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Lucas', 'Sophia', 'Ethan', 'Mia', 'Logan'];

  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);

    const healthyCount = Math.floor(Math.random() * 5);
    const atRiskCount = 4 - healthyCount;
    const consensus = healthyCount >= 2 ? 'Healthy' : 'At Risk';

    entries.push({
      id: `pred_${Date.now()}_${i}`,
      timestamp,
      babyName: Math.random() > 0.3 ? names[Math.floor(Math.random() * names.length)] : undefined,
      babyGender: Math.random() > 0.5 ? 'Female' : 'Male',
      babyAge: Math.floor(Math.random() * 30),
      modelsUsed: [MLModel.DECISION_TREE, MLModel.NAIVE_BAYES, MLModel.RANDOM_FOREST, MLModel.KNN],
      consensus,
      consensusConfidence: 50 + Math.random() * 50,
      healthyCount,
      atRiskCount,
      avgResponseTime: 80 + Math.floor(Math.random() * 150),
      riskFactorsCount: consensus === 'At Risk' ? Math.floor(Math.random() * 5) + 1 : 0,
      notes: Math.random() > 0.7 ? 'Suivi recommandé' : undefined
    });
  }

  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Helper pour filtrer les entrées
export function filterEntries(entries: HistoryEntry[], filters: HistoryFilters): HistoryEntry[] {
  let filtered = [...entries];

  // Recherche textuelle
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(entry =>
      (entry.babyName?.toLowerCase().includes(query)) ||
      entry.id.toLowerCase().includes(query)
    );
  }

  // Filtre par date
  if (filters.dateFrom) {
    filtered = filtered.filter(entry => entry.timestamp >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter(entry => entry.timestamp <= filters.dateTo!);
  }

  // Filtre par consensus
  if (filters.consensus && filters.consensus !== 'All') {
    filtered = filtered.filter(entry => entry.consensus === filters.consensus);
  }

  // Filtre par modèle
  if (filters.model && filters.model !== 'All') {
    filtered = filtered.filter(entry => entry.modelsUsed.includes(filters.model as MLModel));
  }

  return filtered;
}

// Helper pour trier les entrées
export function sortEntries(entries: HistoryEntry[], criterion: HistorySortCriterion, order: 'asc' | 'desc'): HistoryEntry[] {
  const sorted = [...entries].sort((a, b) => {
    let comparison = 0;

    switch (criterion) {
      case 'date':
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
        break;
      case 'name':
        comparison = (a.babyName || '').localeCompare(b.babyName || '');
        break;
      case 'confidence':
        comparison = a.consensusConfidence - b.consensusConfidence;
        break;
      case 'age':
        comparison = a.babyAge - b.babyAge;
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

// Helper pour calculer les statistiques
export function calculateHistoryStats(entries: HistoryEntry[]): HistoryStats {
  if (entries.length === 0) {
    return {
      totalPredictions: 0,
      healthyPredictions: 0,
      atRiskPredictions: 0,
      avgConfidence: 0,
      mostUsedModel: 'Aucun',
      recentTrend: 'stable'
    };
  }

  const healthyPredictions = entries.filter(e => e.consensus === 'Healthy').length;
  const atRiskPredictions = entries.length - healthyPredictions;
  const avgConfidence = entries.reduce((sum, e) => sum + e.consensusConfidence, 0) / entries.length;

  // Trouver le modèle le plus utilisé
  const modelCounts = new Map<string, number>();
  entries.forEach(entry => {
    entry.modelsUsed.forEach(model => {
      modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
    });
  });

  let mostUsedModel = 'Aucun';
  let maxCount = 0;
  modelCounts.forEach((count, model) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedModel = model;
    }
  });

  // Calculer la tendance (derniers 7 jours vs précédents 7 jours)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recent = entries.filter(e => e.timestamp >= sevenDaysAgo);
  const previous = entries.filter(e => e.timestamp >= fourteenDaysAgo && e.timestamp < sevenDaysAgo);

  const recentHealthyRate = recent.length > 0 ? recent.filter(e => e.consensus === 'Healthy').length / recent.length : 0;
  const previousHealthyRate = previous.length > 0 ? previous.filter(e => e.consensus === 'Healthy').length / previous.length : 0;

  let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentHealthyRate > previousHealthyRate + 0.1) {
    recentTrend = 'improving';
  } else if (recentHealthyRate < previousHealthyRate - 0.1) {
    recentTrend = 'declining';
  }

  return {
    totalPredictions: entries.length,
    healthyPredictions,
    atRiskPredictions,
    avgConfidence,
    mostUsedModel,
    recentTrend
  };
}

// Helper pour exporter en JSON
export function exportToJSON(entries: HistoryEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

// Helper pour exporter en CSV
export function exportToCSV(entries: HistoryEntry[]): string {
  const headers = [
    'ID', 'Date', 'Nom', 'Genre', 'Âge (jours)',
    'Consensus', 'Confiance (%)', 'Modèles sains', 'Modèles à risque',
    'Temps moyen (ms)', 'Facteurs de risque', 'Notes'
  ];

  const rows = entries.map(entry => [
    entry.id,
    entry.timestamp.toISOString(),
    entry.babyName || 'N/A',
    entry.babyGender,
    entry.babyAge,
    entry.consensus,
    entry.consensusConfidence.toFixed(1),
    entry.healthyCount,
    entry.atRiskCount,
    entry.avgResponseTime,
    entry.riskFactorsCount,
    entry.notes || ''
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}
