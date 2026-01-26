import { Injectable } from '@angular/core';
import { FirebaseHistoryService } from './firebase-history.service';
import { MLModel } from '../models/baby-health.model';

@Injectable({
  providedIn: 'root'
})
export class SeederService {
  constructor(private firebaseHistory: FirebaseHistoryService) {}

  /**
   * Générer et insérer des données de test dans Firebase
   * @param count Nombre d'entrées à créer
   */
  async seedDatabase(count: number = 50): Promise<void> {
    console.log(` Démarrage du seed de ${count} entrées...`);

    const names = [
      'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan',
      'Sophia', 'Lucas', 'Mia', 'Logan', 'Isabella', 'Mason',
      'Charlotte', 'Elijah', 'Amelia', 'James', 'Harper', 'Benjamin',
      'Evelyn', 'William', 'Abigail', 'Alexander', 'Emily', 'Michael'
    ];

    const allModels = [
      MLModel.DECISION_TREE,
      MLModel.NAIVE_BAYES,
      MLModel.RANDOM_FOREST,
      MLModel.KNN
    ];

    const promises: Promise<any>[] = [];

    for (let i = 0; i < count; i++) {
      // Date aléatoire dans les 60 derniers jours
      const daysAgo = Math.floor(Math.random() * 60);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(Math.floor(Math.random() * 24));
      timestamp.setMinutes(Math.floor(Math.random() * 60));

      // Nombre de modèles utilisés (1 à 4)
      const numModels = Math.floor(Math.random() * 4) + 1;
      const modelsUsed = this.shuffleArray([...allModels]).slice(0, numModels);

      // Simuler des résultats réalistes
      const healthyCount = Math.floor(Math.random() * (numModels + 1));
      const atRiskCount = numModels - healthyCount;
      const consensus = healthyCount >= numModels / 2 ? 'Healthy' : 'At Risk';

      // Confiance basée sur l'unanimité
      const agreement = Math.max(healthyCount, atRiskCount) / numModels;
      const baseConfidence = 50 + (agreement * 50); // 50-100%
      const consensusConfidence = baseConfidence + (Math.random() * 10 - 5); // Variation ±5%

      // Âge du bébé (0-30 jours, avec plus de nouveau-nés)
      const babyAge = Math.floor(Math.random() * Math.random() * 30);

      // Facteurs de risque (plus si "At Risk")
      const riskFactorsCount = consensus === 'At Risk'
        ? Math.floor(Math.random() * 5) + 1
        : Math.floor(Math.random() * 3);

      // Temps de réponse réaliste (80-250ms)
      const avgResponseTime = 80 + Math.floor(Math.random() * 170);

      const entry = {
        timestamp,
        babyName: Math.random() > 0.2 ? names[Math.floor(Math.random() * names.length)] : undefined,
        babyGender: Math.random() > 0.5 ? 'Female' : 'Male' as 'Female' | 'Male',
        babyAge,
        modelsUsed,
        consensus: consensus as 'Healthy' | 'At Risk',
        consensusConfidence: Math.round(consensusConfidence * 10) / 10,
        healthyCount,
        atRiskCount,
        avgResponseTime,
        riskFactorsCount,
        notes: riskFactorsCount > 3 ? 'Surveillance recommandée' : undefined
      };

      // Ajouter à Firebase (promesse)
      const promise = this.firebaseHistory.addEntry(entry).toPromise();
      promises.push(promise);

      // Log progression
      if ((i + 1) % 10 === 0) {
        console.log(` ${i + 1}/${count} entrées préparées...`);
      }
    }

    // Attendre que toutes les insertions soient terminées
    await Promise.all(promises);

    console.log(` Seed terminé ! ${count} entrées ajoutées à Firebase.`);
  }

  /**
   * Nettoyer toutes les données de test
   */
  async clearDatabase(): Promise<void> {
    console.log('🗑️ Suppression de toutes les données...');
    await this.firebaseHistory.clearAllHistory();
    console.log(' Base de données nettoyée !');
  }

  /**
   * Mélanger un tableau (Fisher-Yates shuffle)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
