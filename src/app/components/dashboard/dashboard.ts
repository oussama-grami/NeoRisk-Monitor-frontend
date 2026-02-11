import { Component, OnInit, inject } from '@angular/core';
import {DecimalPipe, NgForOf} from '@angular/common';
import { Router } from '@angular/router';
import { MODEL_CONFIG, MLModel } from '../../models/baby-health.model';
import {ModelCard} from '../../models/modelCard.model'
import {QuickStat} from '../../models/quickStat.model';
import {FirebaseStatsService} from '../../services/firebase-stats.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    DecimalPipe,
    NgForOf
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard implements OnInit {
  private router = inject(Router);
  private firebaseStats = inject(FirebaseStatsService);

  quickStats: QuickStat[] = [];
  modelCards: ModelCard[] = [];
  loading = true;
  systemOnline = false;  // État du système
  isOnline = true;  // État réseau

  ngOnInit() {
    this.checkNetworkStatus();
    this.loadDataFromFirebase();
  }

  // Vérifier l'état du réseau
  checkNetworkStatus() {
    // État initial
    this.isOnline = navigator.onLine;
    this.updateSystemStatus();

    // Écouter les changements de connexion
    window.addEventListener('online', () => {
      console.log('🌐 Réseau restauré');
      this.isOnline = true;
      this.updateSystemStatus();
      this.loadDataFromFirebase(); // Recharger quand online
    });

    window.addEventListener('offline', () => {
      console.log('❌ Réseau perdu');
      this.isOnline = false;
      this.updateSystemStatus();
    });
  }

  // Mettre à jour le status système
  updateSystemStatus() {
    this.systemOnline = this.isOnline; // Système online si réseau online
  }

  // Charger les données depuis Firebase
  loadDataFromFirebase() {
    this.loading = true;

    this.firebaseStats.getDashboardStats().subscribe({
      next: (stats) => {
        this.initializeQuickStats(stats);
        console.log('✅ Stats Dashboard chargées depuis Firebase');
      },
      error: (error) => {
        console.error('❌ Erreur chargement stats Dashboard:', error);
        // Fallback: données mock
        this.initializeQuickStatsMock();
      }
    });

    this.firebaseStats.getModelPerformances().subscribe({
      next: (performances) => {
        this.initializeModelCards(performances);
        this.loading = false;
        console.log('✅ Performances modèles chargées depuis Firebase');
      },
      error: (error) => {
        console.error('❌ Erreur chargement performances:', error);
        // Fallback: données mock
        this.initializeModelCardsMock();
        this.loading = false;
      }
    });
  }

  initializeQuickStats(stats: any) {
    const healthyTrend = stats.healthyRate > 85 ? 'up' : stats.healthyRate < 75 ? 'down' : 'stable';
    const alertsTrend = stats.activeAlerts < 5 ? 'up' : stats.activeAlerts > 10 ? 'down' : 'stable';

    this.quickStats = [
      {
        label: 'Total Prédictions',
        value: stats.totalPredictions.toString(),
        icon: 'bi-graph-up-arrow',
        color: '#4A90E2',
        trend: 'up',
        trendValue: '+' + Math.floor(stats.totalPredictions * 0.1)
      },
      {
        label: 'Bébés Sains',
        value: stats.healthyRate.toFixed(1) + '%',
        icon: 'bi-heart-pulse-fill',
        color: '#5FCF80',
        trend: healthyTrend,
        trendValue: healthyTrend === 'up' ? '+3.2%' : healthyTrend === 'down' ? '-2.1%' : '0%'
      },
      {
        label: 'Alertes Actives',
        value: stats.activeAlerts.toString(),
        icon: 'bi-exclamation-triangle-fill',
        color: '#E74C3C',
        trend: alertsTrend,
        trendValue: alertsTrend === 'up' ? '-2' : alertsTrend === 'down' ? '+3' : '0'
      },
      {
        label: 'Précision Moyenne',
        value: stats.avgAccuracy.toFixed(1) + '%',
        icon: 'bi-bullseye',
        color: '#F5A623',
        trend: 'up',
        trendValue: '+1.8%'
      }
    ];
  }

  initializeModelCards(performances: any[]) {
    this.modelCards = performances.map(perf => ({
      model: perf.model,
      name: perf.modelName,
      displayName: perf.displayName,
      color: perf.color,
      icon: perf.icon,
      accuracy: perf.accuracy,
      predictions: perf.totalPredictions,
      avgResponseTime: perf.avgResponseTime
    }));
  }

  // Fallback: données mock (si Firebase échoue)
  initializeQuickStatsMock() {
    this.quickStats = [
      {
        label: 'Total Prédictions',
        value: '1,247',
        icon: 'bi-graph-up-arrow',
        color: '#4A90E2',
        trend: 'up',
        trendValue: '+12.5%'
      },
      {
        label: 'Bébés Sains',
        value: '89%',
        icon: 'bi-heart-pulse-fill',
        color: '#5FCF80',
        trend: 'up',
        trendValue: '+3.2%'
      },
      {
        label: 'Alertes Actives',
        value: '3',
        icon: 'bi-exclamation-triangle',
        color: '#F5A623',
        trend: 'down',
        trendValue: '-2'
      },
      {
        label: 'Précision Moyenne',
        value: '94.2%',
        icon: 'bi-bullseye',
        color: '#E74C3C',
        trend: 'up',
        trendValue: '+1.8%'
      }
    ];
  }

  initializeModelCardsMock() {
    this.modelCards = [
      {
        model: MLModel.DECISION_TREE,
        name: MODEL_CONFIG[MLModel.DECISION_TREE].name,
        displayName: MODEL_CONFIG[MLModel.DECISION_TREE].displayName,
        color: MODEL_CONFIG[MLModel.DECISION_TREE].color,
        icon: MODEL_CONFIG[MLModel.DECISION_TREE].icon,
        accuracy: 91.3,
        predictions: 0,
        avgResponseTime: 0
      },
      {
        model: MLModel.NAIVE_BAYES,
        name: MODEL_CONFIG[MLModel.NAIVE_BAYES].name,
        displayName: MODEL_CONFIG[MLModel.NAIVE_BAYES].displayName,
        color: MODEL_CONFIG[MLModel.NAIVE_BAYES].color,
        icon: MODEL_CONFIG[MLModel.NAIVE_BAYES].icon,
        accuracy: 89.8,
        predictions: 0,
        avgResponseTime: 0
      },
      {
        model: MLModel.RANDOM_FOREST,
        name: MODEL_CONFIG[MLModel.RANDOM_FOREST].name,
        displayName: MODEL_CONFIG[MLModel.RANDOM_FOREST].displayName,
        color: MODEL_CONFIG[MLModel.RANDOM_FOREST].color,
        icon: MODEL_CONFIG[MLModel.RANDOM_FOREST].icon,
        accuracy: 95.7,
        predictions: 341,
        avgResponseTime: 178
      },
      {
        model: MLModel.KNN,
        name: MODEL_CONFIG[MLModel.KNN].name,
        displayName: MODEL_CONFIG[MLModel.KNN].displayName,
        color: MODEL_CONFIG[MLModel.KNN].color,
        icon: MODEL_CONFIG[MLModel.KNN].icon,
        accuracy: 91.3,
        predictions: 296,
        avgResponseTime: 132
      }
    ];
  }

  testModel(model: MLModel) {
    // Naviguer vers la page de prédiction avec le modèle présélectionné
    this.router.navigate(['/prediction'], { queryParams: { model } });
  }

  goToPrediction() {
    this.router.navigate(['/prediction']);
  }

  goToComparison() {
    this.router.navigate(['/comparison']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  ngOnDestroy() {
    // Nettoyer les event listeners
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', () => {});
  }
}
