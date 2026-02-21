// tests/history.model.test.ts
// Importe directement depuis les sources du projet — aucune copie de code

import { describe, it, expect } from 'vitest';
import {
  filterEntries,
  sortEntries,
  calculateHistoryStats,
  exportToCSV,
  DEFAULT_FILTERS
} from '../src/app/models/history.model';
import { MLModel } from '../src/app/models/baby-health.model';
import type { HistoryEntry } from '../src/app/models/history.model';

// ============================================================
// HELPER — fabrique une entrée valide avec surcharges optionnelles
// ============================================================

const makeEntry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: 'pred_001',
  timestamp: new Date('2026-02-10T10:00:00Z'),
  babyName: 'Emma',
  babyGender: 'Female',
  babyAge: 5,
  modelsUsed: [MLModel.DECISION_TREE, MLModel.NAIVE_BAYES, MLModel.RANDOM_FOREST, MLModel.KNN],
  consensus: 'Healthy',
  consensusConfidence: 95.0,
  healthyCount: 4,
  atRiskCount: 0,
  avgResponseTime: 120,
  riskFactorsCount: 0,
  ...overrides
});

// TESTS : filterEntries

describe('filterEntries()', () => {

  it('retourne toutes les entrées quand les filtres sont vides (défaut)', () => {
    const entries = [makeEntry(), makeEntry({ id: 'pred_002', babyName: 'Liam' })];
    const result = filterEntries(entries, DEFAULT_FILTERS);
    expect(result).toHaveLength(2);
  });

  it('filtre par nom de bébé (insensible à la casse)', () => {
    const entries = [
      makeEntry({ id: 'pred_001', babyName: 'Emma' }),
      makeEntry({ id: 'pred_002', babyName: 'Liam' }),
      makeEntry({ id: 'pred_003', babyName: 'Olivia' })
    ];
    const result = filterEntries(entries, { ...DEFAULT_FILTERS, searchQuery: 'emma' });
    expect(result).toHaveLength(1);
    expect(result[0].babyName).toBe('Emma');
  });

  it('filtre par consensus "At Risk"', () => {
    const entries = [
      makeEntry({ id: 'pred_001', consensus: 'Healthy' }),
      makeEntry({ id: 'pred_002', consensus: 'At Risk' })
    ];
    const result = filterEntries(entries, { ...DEFAULT_FILTERS, consensus: 'At Risk' });
    expect(result).toHaveLength(1);
    expect(result[0].consensus).toBe('At Risk');
  });

  it('ne filtre pas quand consensus = "All"', () => {
    const entries = [
      makeEntry({ id: 'pred_001', consensus: 'Healthy' }),
      makeEntry({ id: 'pred_002', consensus: 'At Risk' })
    ];
    const result = filterEntries(entries, { ...DEFAULT_FILTERS, consensus: 'All' });
    expect(result).toHaveLength(2);
  });

  it('filtre par modèle ML utilisé', () => {
    const entries = [
      makeEntry({ id: 'pred_001', modelsUsed: [MLModel.DECISION_TREE, MLModel.KNN] }),
      makeEntry({ id: 'pred_002', modelsUsed: [MLModel.NAIVE_BAYES, MLModel.RANDOM_FOREST] })
    ];
    const result = filterEntries(entries, { ...DEFAULT_FILTERS, model: MLModel.DECISION_TREE });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pred_001');
  });

  it('filtre par plage de dates (dateFrom)', () => {
    const entries = [
      makeEntry({ id: 'pred_001', timestamp: new Date('2026-01-01') }),
      makeEntry({ id: 'pred_002', timestamp: new Date('2026-02-15') }),
      makeEntry({ id: 'pred_003', timestamp: new Date('2026-02-20') })
    ];
    const result = filterEntries(entries, {
      ...DEFAULT_FILTERS,
      dateFrom: new Date('2026-02-01')
    });
    expect(result).toHaveLength(2);
  });

  it('peut combiner plusieurs filtres simultanément', () => {
    const entries = [
      makeEntry({ id: 'pred_001', babyName: 'Emma', consensus: 'Healthy' }),
      makeEntry({ id: 'pred_002', babyName: 'Emma', consensus: 'At Risk' }),
      makeEntry({ id: 'pred_003', babyName: 'Liam',  consensus: 'Healthy' })
    ];
    const result = filterEntries(entries, {
      ...DEFAULT_FILTERS,
      searchQuery: 'emma',
      consensus: 'Healthy'
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pred_001');
  });

});

// TESTS : sortEntries

describe('sortEntries()', () => {

  it('trie par date décroissante (plus récent en premier)', () => {
    const entries = [
      makeEntry({ id: 'A', timestamp: new Date('2026-01-01') }),
      makeEntry({ id: 'B', timestamp: new Date('2026-03-01') }),
      makeEntry({ id: 'C', timestamp: new Date('2026-02-01') })
    ];
    const result = sortEntries(entries, 'date', 'desc');
    expect(result[0].id).toBe('B');
    expect(result[1].id).toBe('C');
    expect(result[2].id).toBe('A');
  });

  it('trie par date croissante (plus ancien en premier)', () => {
    const entries = [
      makeEntry({ id: 'A', timestamp: new Date('2026-03-01') }),
      makeEntry({ id: 'B', timestamp: new Date('2026-01-01') })
    ];
    const result = sortEntries(entries, 'date', 'asc');
    expect(result[0].id).toBe('B');
    expect(result[1].id).toBe('A');
  });

  it('trie par confiance décroissante', () => {
    const entries = [
      makeEntry({ id: 'A', consensusConfidence: 60 }),
      makeEntry({ id: 'B', consensusConfidence: 95 }),
      makeEntry({ id: 'C', consensusConfidence: 80 })
    ];
    const result = sortEntries(entries, 'confidence', 'desc');
    expect(result[0].consensusConfidence).toBe(95);
    expect(result[2].consensusConfidence).toBe(60);
  });

  it('trie par nom alphabétiquement (asc)', () => {
    const entries = [
      makeEntry({ id: 'A', babyName: 'Olivia' }),
      makeEntry({ id: 'B', babyName: 'Emma' }),
      makeEntry({ id: 'C', babyName: 'Liam' })
    ];
    const result = sortEntries(entries, 'name', 'asc');
    expect(result[0].babyName).toBe('Emma');
    expect(result[1].babyName).toBe('Liam');
    expect(result[2].babyName).toBe('Olivia');
  });

  it('trie par âge croissant', () => {
    const entries = [
      makeEntry({ id: 'A', babyAge: 20 }),
      makeEntry({ id: 'B', babyAge: 5 }),
      makeEntry({ id: 'C', babyAge: 12 })
    ];
    const result = sortEntries(entries, 'age', 'asc');
    expect(result[0].babyAge).toBe(5);
    expect(result[2].babyAge).toBe(20);
  });

  it('ne modifie pas le tableau original (immutabilité)', () => {
    const entries = [
      makeEntry({ id: 'A', babyAge: 20 }),
      makeEntry({ id: 'B', babyAge: 5 })
    ];
    const originalFirst = entries[0].id;
    sortEntries(entries, 'age', 'asc');
    expect(entries[0].id).toBe(originalFirst);
  });

});

// TESTS : calculateHistoryStats

describe('calculateHistoryStats()', () => {

  it('retourne des valeurs par défaut pour un tableau vide', () => {
    const stats = calculateHistoryStats([]);
    expect(stats.totalPredictions).toBe(0);
    expect(stats.healthyPredictions).toBe(0);
    expect(stats.atRiskPredictions).toBe(0);
    expect(stats.avgConfidence).toBe(0);
    expect(stats.mostUsedModel).toBe('Aucun');
    expect(stats.recentTrend).toBe('stable');
  });

  it('compte correctement les prédictions totales', () => {
    const entries = [makeEntry(), makeEntry({ id: 'pred_002' })];
    const stats = calculateHistoryStats(entries);
    expect(stats.totalPredictions).toBe(2);
  });

  it('compte correctement les bébés sains et à risque', () => {
    const entries = [
      makeEntry({ id: '1', consensus: 'Healthy' }),
      makeEntry({ id: '2', consensus: 'Healthy' }),
      makeEntry({ id: '3', consensus: 'At Risk' })
    ];
    const stats = calculateHistoryStats(entries);
    expect(stats.healthyPredictions).toBe(2);
    expect(stats.atRiskPredictions).toBe(1);
  });

  it('calcule correctement la confiance moyenne', () => {
    const entries = [
      makeEntry({ id: '1', consensusConfidence: 80 }),
      makeEntry({ id: '2', consensusConfidence: 100 })
    ];
    const stats = calculateHistoryStats(entries);
    expect(stats.avgConfidence).toBe(90);
  });

  it('identifie le modèle le plus utilisé', () => {
    const entries = [
      makeEntry({ id: '1', modelsUsed: [MLModel.DECISION_TREE, MLModel.KNN] }),
      makeEntry({ id: '2', modelsUsed: [MLModel.DECISION_TREE] }),
      makeEntry({ id: '3', modelsUsed: [MLModel.NAIVE_BAYES] })
    ];
    const stats = calculateHistoryStats(entries);
    expect(stats.mostUsedModel).toBe(MLModel.DECISION_TREE);
  });

  it('healthyPredictions + atRiskPredictions = totalPredictions', () => {
    const entries = [
      makeEntry({ id: '1', consensus: 'Healthy' }),
      makeEntry({ id: '2', consensus: 'At Risk' }),
      makeEntry({ id: '3', consensus: 'Healthy' }),
      makeEntry({ id: '4', consensus: 'At Risk' }),
      makeEntry({ id: '5', consensus: 'At Risk' })
    ];
    const stats = calculateHistoryStats(entries);
    expect(stats.healthyPredictions + stats.atRiskPredictions).toBe(stats.totalPredictions);
  });

});

// TESTS : exportToCSV

describe('exportToCSV()', () => {

  it('produit une ligne d\'en-tête + une ligne par entrée', () => {
    const entries = [makeEntry()];
    const csv = exportToCSV(entries);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
  });

  it('l en-tête contient les colonnes attendues', () => {
    const csv = exportToCSV([makeEntry()]);
    const header = csv.split('\n')[0];
    expect(header).toContain('ID');
    expect(header).toContain('Consensus');
    expect(header).toContain('Confiance (%)');
  });

  it('utilise "N/A" quand babyName est absent', () => {
    const entry = makeEntry({ babyName: undefined });
    const csv = exportToCSV([entry]);
    expect(csv).toContain('N/A');
  });

  it('retourne uniquement l\'en-tête pour un tableau vide', () => {
    const csv = exportToCSV([]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1);
  });

  it('inclut l ID de chaque entrée dans le CSV', () => {
    const entry = makeEntry({ id: 'pred_test_99' });
    const csv = exportToCSV([entry]);
    expect(csv).toContain('pred_test_99');
  });

});
