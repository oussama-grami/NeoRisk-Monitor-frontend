import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  Timestamp,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { HistoryEntry } from '../models/history.model';
import { ModelPerformance, ComparisonStats } from '../models/comparison.model';
import { MLModel, MODEL_CONFIG } from '../models/baby-health.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStatsService {

  private firestore = inject(Firestore);
  private historyCollection: CollectionReference<DocumentData>;

  constructor() {
    this.historyCollection = collection(this.firestore, 'predictions');
  }

  /**
   * 🔹 Stream de toutes les prédictions
   */
  private getHistoryEntries(): Observable<HistoryEntry[]> {
    return collectionData(this.historyCollection, { idField: 'id' }).pipe(
      map(docs => this.docsToEntries(docs))
    );
  }

  /**
   * Obtenir les statistiques globales du Dashboard
   */
  getDashboardStats(): Observable<{
    totalPredictions: number;
    healthyRate: number;
    activeAlerts: number;
    avgAccuracy: number;
    recentPredictions: HistoryEntry[];
  }> {
    return this.getHistoryEntries().pipe(
      map(entries => {

        const totalPredictions = entries.length;

        const healthyCount = entries.filter(
          e => e.consensus === 'Healthy'
        ).length;

        const healthyRate = totalPredictions > 0
          ? (healthyCount / totalPredictions) * 100
          : 0;

        // Alertes actives = "At Risk" sur les 7 derniers jours
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeAlerts = entries.filter(e =>
          e.consensus === 'At Risk' &&
          e.timestamp >= sevenDaysAgo
        ).length;

        // ✅ Accuracy moyenne des MÉTRIQUES STATIQUES
        const models = [MLModel.DECISION_TREE, MLModel.NAIVE_BAYES, MLModel.RANDOM_FOREST, MLModel.KNN];
        const avgAccuracy = models.reduce((sum, model) =>
          sum + MODEL_CONFIG[model].staticMetrics.accuracy, 0
        ) / models.length;

        // 10 dernières prédictions
        const recentPredictions = [...entries]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        return {
          totalPredictions,
          healthyRate,
          activeAlerts,
          avgAccuracy,
          recentPredictions
        };
      })
    );
  }

  /**
   * Obtenir les performances de chaque modèle
   */
  getModelPerformances(): Observable<ModelPerformance[]> {
    return this.getHistoryEntries().pipe(
      map(entries => this.calculateModelPerformances(entries))
    );
  }

  /**
   * Obtenir les statistiques de comparaison
   */
  getComparisonStats(): Observable<ComparisonStats> {
    return this.getModelPerformances().pipe(
      map(performances => ({
        bestAccuracy: performances.reduce((a, b) => b.accuracy > a.accuracy ? b : a),
        fastestModel: performances.reduce((a, b) => b.avgResponseTime < a.avgResponseTime ? b : a),
        mostUsed: performances.reduce((a, b) => b.totalPredictions > a.totalPredictions ? b : a),
        bestF1Score: performances.reduce((a, b) => b.f1Score > a.f1Score ? b : a)
      }))
    );
  }

  /**
   * ✅ Calculer les performances de chaque modèle (STATIQUES + DYNAMIQUES)
   */
  private calculateModelPerformances(entries: HistoryEntry[]): ModelPerformance[] {

    const models = [
      MLModel.DECISION_TREE,
      MLModel.NAIVE_BAYES,
      MLModel.RANDOM_FOREST,
      MLModel.KNN
    ];

    return models.map(model => {

      const modelEntries = entries.filter(
        e => e.modelsUsed.includes(model)
      );

      const config = MODEL_CONFIG[model];

      // ✅ MÉTRIQUES STATIQUES (provenant de l'évaluation)
      const { accuracy, precision, recall, f1Score } = config.staticMetrics;

      // 📊 MÉTRIQUES DYNAMIQUES (calculées depuis Firebase)
      const totalPredictions = modelEntries.length;

      const avgResponseTime = totalPredictions > 0
        ? modelEntries.reduce((sum, e) => sum + e.avgResponseTime, 0) / totalPredictions
        : 0;

      const successRate = totalPredictions > 0
        ? (modelEntries.filter(e => e.consensusConfidence >= 80).length / totalPredictions) * 100
        : 0;

      return {
        model,
        modelName: config.name,
        displayName: config.displayName,
        color: config.color,
        icon: config.icon,
        // 🔒 STATIQUES
        accuracy,
        precision,
        recall,
        f1Score,
        // 📊 DYNAMIQUES
        avgResponseTime: Math.round(avgResponseTime),
        totalPredictions,
        successRate: Math.round(successRate * 10) / 10
      };
    });
  }

  /**
   * Conversion Firestore → HistoryEntry[]
   */
  private docsToEntries(docs: any[]): HistoryEntry[] {
    return docs.map(data => {

      const timestamp =
        data.timestamp instanceof Timestamp
          ? data.timestamp.toDate()
          : new Date(data.timestamp);

      return {
        id: data.id,
        timestamp,
        babyName: data.babyName,
        babyGender: data.babyGender,
        babyAge: data.babyAge,
        modelsUsed: data.modelsUsed || [],
        consensus: data.consensus,
        consensusConfidence: data.consensusConfidence,
        healthyCount: data.healthyCount,
        atRiskCount: data.atRiskCount,
        avgResponseTime: data.avgResponseTime,
        riskFactorsCount: data.riskFactorsCount || 0,
        notes: data.notes
      };
    });
  }
}
