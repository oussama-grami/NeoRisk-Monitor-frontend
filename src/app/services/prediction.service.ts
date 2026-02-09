import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import {
  BabyHealthData,
  PredictionResponse,
  ModelComparison,
  MLModel
} from '../models/baby-health.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private http = inject(HttpClient);

  // ✅ NOUVEAU - URLs avec les 4 ports différents
  private endpoints = {
    [MLModel.DECISION_TREE]: `${environment.apiUrls.decisionTree}${environment.apiEndpoints.decisionTree}`,
    [MLModel.RANDOM_FOREST]: `${environment.apiUrls.randomForest}${environment.apiEndpoints.randomForest}`,
    [MLModel.KNN]: `${environment.apiUrls.knn}${environment.apiEndpoints.knn}`,
    [MLModel.NAIVE_BAYES]: `${environment.apiUrls.naiveBayes}${environment.apiEndpoints.naiveBayes}`
  };

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  /**
   * Prédiction avec un modèle spécifique
   */
  predictWithModel(
    model: MLModel,
    data: BabyHealthData
  ): Observable<PredictionResponse> {
    const startTime = Date.now();

    return this.http.post<any>(this.endpoints[model], data, this.httpOptions).pipe(
      map(response => ({
        prediction: response.prediction,           // 'Healthy' ou 'At Risk'
        confidence: response.confidence,           // Nombre 0-100
        model_name: model,
        timestamp: new Date().toISOString(),
        response_time_ms: Date.now() - startTime
      } as PredictionResponse)),
      catchError(error => {
        console.error(`❌ Erreur avec le modèle ${model}:`, error);

        // Retourner une erreur explicite
        return of({
          prediction: 'At Risk',
          confidence: 0,
          model_name: model,
          timestamp: new Date().toISOString(),
          error: true
        } as any);
      })
    );
  }

  /**
   * Prédiction avec tous les modèles en parallèle
   */
  predictWithAllModels(data: BabyHealthData): Observable<ModelComparison> {
    const predictions = {
      decision_tree: this.predictWithModel(MLModel.DECISION_TREE, data),
      random_forest: this.predictWithModel(MLModel.RANDOM_FOREST, data),
      knn: this.predictWithModel(MLModel.KNN, data),
      naive_bayes: this.predictWithModel(MLModel.NAIVE_BAYES, data)
    };

    return forkJoin(predictions);
  }

  /**
   * Obtenir le consensus des modèles
   */
  getConsensus(comparison: ModelComparison): 'Healthy' | 'At Risk' {
    const predictions = [
      comparison.decision_tree.prediction,
      comparison.random_forest.prediction,
      comparison.knn.prediction,
      comparison.naive_bayes.prediction
    ];

    const healthyCount = predictions.filter(p => p === 'Healthy').length;
    return healthyCount >= 2 ? 'Healthy' : 'At Risk';
  }

  /**
   * Calculer un score de confiance basé sur l'accord des modèles
   */
  getConsensusConfidence(comparison: ModelComparison): number {
    const predictions = [
      comparison.decision_tree.prediction,
      comparison.random_forest.prediction,
      comparison.knn.prediction,
      comparison.naive_bayes.prediction
    ];

    const healthyCount = predictions.filter(p => p === 'Healthy').length;
    const agreement = Math.max(healthyCount, 4 - healthyCount);

    // 100% si tous d'accord, 75% si 3/4, 50% si 2/2
    return (agreement / 4) * 100;
  }

  /**
   * Valider les données d'entrée
   */
  validateData(data: BabyHealthData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.temperature_c < 35 || data.temperature_c > 42) {
      errors.push('Température hors limites (35-42°C)');
    }

    if (data.heart_rate_bpm < 80 || data.heart_rate_bpm > 200) {
      errors.push('Fréquence cardiaque hors limites (80-200 bpm)');
    }

    if (data.respiratory_rate_bpm < 20 || data.respiratory_rate_bpm > 80) {
      errors.push('Fréquence respiratoire hors limites (20-80 bpm)');
    }

    if (data.oxygen_saturation < 80 || data.oxygen_saturation > 100) {
      errors.push('Saturation en oxygène invalide (80-100%)');
    }

    if (data.weight_kg <= 0 || data.weight_kg > 10) {
      errors.push('Poids invalide (0-10 kg)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
