import { Component, OnInit } from '@angular/core';
import {CommonModule, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ModelPerformance,
  ComparisonStats,
  ComparisonConfig,
  ComparisonCriterion,
  DEFAULT_COMPARISON_CONFIG,
  createMockPerformanceData,
  calculateComparisonStats,
  sortPerformances
} from '../../models/comparison.model';
import {FirebaseStatsService} from '../../services/firebase-stats.service';

@Component({
  selector: 'app-comparison',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    DecimalPipe
  ],
  templateUrl: './comparison.html',
  styleUrl: './comparison.css',
})

export class Comparison implements OnInit {
  // Données de performance
  performances: ModelPerformance[] = [];
  stats: ComparisonStats | null = null;

  // Configuration
  config: ComparisonConfig = { ...DEFAULT_COMPARISON_CONFIG };

  // État d'affichage
  viewMode: 'grid' | 'table' | 'chart' = 'grid';
  selectedMetric: ComparisonCriterion = 'accuracy';

  // Critères disponibles
  availableCriteria: { value: ComparisonCriterion; label: string; icon: string }[] = [
    { value: 'accuracy', label: 'Précision', icon: 'bi-bullseye' },
    { value: 'speed', label: 'Vitesse', icon: 'bi-lightning' },
    { value: 'f1score', label: 'Score F1', icon: 'bi-graph-up' },
    { value: 'precision', label: 'Précision (ML)', icon: 'bi-check-circle' },
    { value: 'recall', label: 'Rappel', icon: 'bi-arrow-repeat' }
  ];

  constructor(
    protected router: Router,
    private firebaseStats: FirebaseStatsService
  ) {}

  ngOnInit() {
    this.loadPerformanceData();
  }

  // Charger les données de performance depuis Firebase
  loadPerformanceData() {
    this.firebaseStats.getModelPerformances().subscribe({
      next: (performances) => {
        this.performances = performances;
        this.updateStats();
        this.sortData();
        console.log('✅ Performances modèles chargées depuis Firebase');
      },
      error: (error) => {
        console.error('❌ Erreur chargement performances:', error);
        // Fallback: Données mock
        this.performances = createMockPerformanceData();
        this.updateStats();
        this.sortData();
      }
    });
  }

  // Mettre à jour les statistiques
  updateStats() {
    this.stats = calculateComparisonStats(this.performances);
  }

  // Trier les données
  sortData() {
    this.performances = sortPerformances(
      this.performances,
      this.config.sortBy,
      this.config.ascending
    );
  }

  // Changer le critère de tri
  changeSortCriterion(criterion: ComparisonCriterion) {
    if (this.config.sortBy === criterion) {
      this.config.ascending = !this.config.ascending;
    } else {
      this.config.sortBy = criterion;
      this.config.ascending = false;
    }
    this.sortData();
  }

  // Changer le mode d'affichage
  changeViewMode(mode: 'grid' | 'table' | 'chart') {
    this.viewMode = mode;
  }

  // Changer la métrique sélectionnée
  changeMetric(metric: ComparisonCriterion) {
    this.selectedMetric = metric;
  }

  // Obtenir la valeur d'une métrique pour un modèle
  getMetricValue(performance: ModelPerformance, metric: ComparisonCriterion): number {
    switch (metric) {
      case 'accuracy':
        return performance.accuracy;
      case 'speed':
        return performance.avgResponseTime;
      case 'f1score':
        return performance.f1Score;
      case 'precision':
        return performance.precision;
      case 'recall':
        return performance.recall;
      default:
        return 0;
    }
  }

  // Obtenir le label d'une métrique
  getMetricLabel(metric: ComparisonCriterion): string {
    const criterion = this.availableCriteria.find(c => c.value === metric);
    return criterion?.label || metric;
  }

  // Obtenir l'unité d'une métrique
  getMetricUnit(metric: ComparisonCriterion): string {
    switch (metric) {
      case 'speed':
        return 'ms';
      case 'accuracy':
      case 'f1score':
      case 'precision':
      case 'recall':
        return '%';
      default:
        return '';
    }
  }

  // Obtenir le meilleur modèle pour une métrique
  getBestModel(metric: ComparisonCriterion): ModelPerformance {
    return this.performances.reduce((best, current) => {
      const bestValue = this.getMetricValue(best, metric);
      const currentValue = this.getMetricValue(current, metric);

      // Pour la vitesse, plus petit est mieux
      if (metric === 'speed') {
        return currentValue < bestValue ? current : best;
      }

      // Pour les autres métriques, plus grand est mieux
      return currentValue > bestValue ? current : best;
    });
  }

  // Obtenir la position d'un modèle (classement)
  getModelRank(performance: ModelPerformance): number {
    const sorted = sortPerformances(this.performances, this.selectedMetric, false);
    return sorted.findIndex(p => p.model === performance.model) + 1;
  }

  // Calculer le pourcentage par rapport au meilleur
  getPercentageOfBest(performance: ModelPerformance, metric: ComparisonCriterion): number {
    const best = this.getBestModel(metric);
    const bestValue = this.getMetricValue(best, metric);
    const currentValue = this.getMetricValue(performance, metric);

    if (bestValue === 0) return 0;

    // Pour la vitesse, inverser le calcul
    if (metric === 'speed') {
      return (bestValue / currentValue) * 100;
    }

    return (currentValue / bestValue) * 100;
  }

  // Obtenir la couleur d'un badge de performance
  getPerformanceBadgeColor(percentage: number): string {
    if (percentage >= 95) return 'var(--success-green)';
    if (percentage >= 85) return 'var(--primary-blue)';
    if (percentage >= 75) return 'var(--warning-orange)';
    return 'var(--danger-red)';
  }

  // Obtenir l'icône de tendance
  getTrendIcon(performance: ModelPerformance): string {
    // Pour l'instant, retourner stable
    // TODO: Implémenter la comparaison avec les performances précédentes
    return 'bi-dash';
  }

  // Naviguer vers les prédictions avec un modèle présélectionné
  testModel(model: string) {
    this.router.navigate(['/prediction'], { queryParams: { model } });
  }

  // Naviguer vers le dashboard
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  // Rafraîchir les données
  refreshData() {
    this.loadPerformanceData();
  }

  // Exporter les données (TODO)
  exportData() {
    console.log('Export des données de comparaison');
    // TODO: Implémenter l'export en CSV/JSON
  }
}
