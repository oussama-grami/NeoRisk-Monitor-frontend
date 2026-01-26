import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PredictionService } from '../../services/prediction.service';
import { FirebaseHistoryService } from '../../services/firebase-history.service';
import { MODEL_CONFIG, MLModel } from '../../models/baby-health.model';
import {
  PredictionFormData,
  DEFAULT_FORM_VALUES,
  VALIDATION_RULES,
  FORM_FIELD_GROUPS,
  ValidationRule,
  FormFieldGroup
} from '../../models/prediction-form.model';
import {
  PredictionResult,
  SingleModelResult,
  PredictionState,
  RiskFactor,
  MedicalRecommendation,
  createEmptyResult,
  calculateConsensus,
  calculateComparisonStats
} from '../../models/prediction-result.model';

@Component({
  selector: 'app-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prediction.html',
  styleUrls: ['./prediction.css']
})
export class Prediction implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private predictionService = inject(PredictionService);
  private firebaseHistory = inject(FirebaseHistoryService);

  // État du formulaire
  formData: PredictionFormData = { ...DEFAULT_FORM_VALUES };
  validationRules = VALIDATION_RULES;
  fieldGroups = FORM_FIELD_GROUPS;

  // État de la prédiction
  predictionState: PredictionState = 'idle';
  result: PredictionResult | null = null;
  riskFactors: RiskFactor[] = [];
  recommendations: MedicalRecommendation[] = [];

  // Configuration
  selectedModels: Set<MLModel> = new Set([
    MLModel.DECISION_TREE,
    MLModel.NAIVE_BAYES,
    MLModel.RANDOM_FOREST,
    MLModel.KNN
  ]);

  // Modèles disponibles
  availableModels = [
    { model: MLModel.DECISION_TREE, ...MODEL_CONFIG[MLModel.DECISION_TREE] },
    { model: MLModel.NAIVE_BAYES, ...MODEL_CONFIG[MLModel.NAIVE_BAYES] },
    { model: MLModel.RANDOM_FOREST, ...MODEL_CONFIG[MLModel.RANDOM_FOREST] },
    { model: MLModel.KNN, ...MODEL_CONFIG[MLModel.KNN] }
  ];

  // Erreurs de validation
  validationErrors: Map<string, string> = new Map();

  ngOnInit() {
    // Vérifier si un modèle spécifique est présélectionné
    this.route.queryParams.subscribe(params => {
      if (params['model']) {
        const model = params['model'] as MLModel;
        if (Object.values(MLModel).includes(model)) {
          this.selectedModels.clear();
          this.selectedModels.add(model);
        }
      }
    });

    // Charger des données d'exemple si disponibles
    this.loadSampleData();
  }

  // Charger des données d'exemple
  loadSampleData() {
    // Pour l'instant, on garde les valeurs par défaut
    // Plus tard, on pourra charger depuis le localStorage ou l'API
  }

  // Valider un champ
  validateField(field: keyof PredictionFormData): boolean {
    const rule = this.validationRules.find(r => r.field === field);
    if (!rule) return true;

    const value = this.formData[field] as number;
    if (value < rule.min || value > rule.max) {
      this.validationErrors.set(
        field,
        `${rule.label} doit être entre ${rule.min} et ${rule.max} ${rule.unit}`
      );
      return false;
    }

    this.validationErrors.delete(field);
    return true;
  }

  // Valider tout le formulaire
  validateForm(): boolean {
    this.validationErrors.clear();
    let isValid = true;

    for (const rule of this.validationRules) {
      if (!this.validateField(rule.field)) {
        isValid = false;
      }
    }

    return isValid;
  }

  // Basculer la sélection d'un modèle
  toggleModel(model: MLModel) {
    if (this.selectedModels.has(model)) {
      if (this.selectedModels.size > 1) {
        this.selectedModels.delete(model);
      }
    } else {
      this.selectedModels.add(model);
    }
  }

  // Sélectionner tous les modèles
  selectAllModels() {
    this.availableModels.forEach(m => this.selectedModels.add(m.model));
  }

  // Désélectionner tous les modèles sauf un
  selectOnlyOne(model: MLModel) {
    this.selectedModels.clear();
    this.selectedModels.add(model);
  }

  // Réinitialiser le formulaire
  resetForm() {
    this.formData = { ...DEFAULT_FORM_VALUES };
    this.validationErrors.clear();
    this.result = null;
    this.riskFactors = [];
    this.recommendations = [];
    this.predictionState = 'idle';
  }

  // Remplir avec des données aléatoires
  fillRandomData() {
    this.formData = {
      baby_name: `Bébé ${Math.floor(Math.random() * 1000)}`,
      gender: Math.random() > 0.5 ? 'Female' : 'Male',
      gestational_age_weeks: 37 + Math.random() * 5,
      birth_weight_kg: 2.5 + Math.random() * 1.5,
      birth_length_cm: 45 + Math.random() * 10,
      birth_head_circumference_cm: 30 + Math.random() * 4,
      apgar_score: Math.floor(7 + Math.random() * 4),
      age_days: Math.floor(Math.random() * 30),
      weight_kg: 2.8 + Math.random() * 1.5,
      length_cm: 46 + Math.random() * 8,
      head_circumference_cm: 31 + Math.random() * 3,
      temperature_c: 36.5 + Math.random() * 1,
      heart_rate_bpm: 120 + Math.random() * 40,
      respiratory_rate_bpm: 30 + Math.random() * 20,
      oxygen_saturation: 95 + Math.random() * 5,
      feeding_type: ['Breastfeeding', 'Formula', 'Mixed'][Math.floor(Math.random() * 3)] as any,
      feeding_frequency_per_day: Math.floor(6 + Math.random() * 6),
      urine_output_count: Math.floor(4 + Math.random() * 6),
      stool_count: Math.floor(2 + Math.random() * 5),
      jaundice_level_mg_dl: Math.random() * 12,
      immunizations_done: Math.random() > 0.3 ? 'Yes' : 'No',
      reflexes_normal: Math.random() > 0.2 ? 'Yes' : 'No'
    };
  }

  // Soumettre le formulaire
  async submitPrediction() {
    // Valider le formulaire
    if (!this.validateForm()) {
      return;
    }

    // Vérifier qu'au moins un modèle est sélectionné
    if (this.selectedModels.size === 0) {
      alert('Veuillez sélectionner au moins un modèle ML');
      return;
    }

    // Changer l'état
    this.predictionState = 'loading';
    this.result = null;

    try {
      // Préparer les données pour l'API
      const apiData = this.prepareApiData();

      // Faire les prédictions
      const results: SingleModelResult[] = [];

      for (const model of Array.from(this.selectedModels)) {
        const startTime = Date.now();

        try {
          const response = await this.predictionService
            .predictWithModel(model, apiData)
            .toPromise();

          const modelConfig = MODEL_CONFIG[model];
          results.push({
            model,
            modelName: modelConfig.name,
            displayName: modelConfig.displayName,
            prediction: response?.prediction || 'Healthy',
            confidence: response?.confidence || 85,
            responseTime: Date.now() - startTime,
            color: modelConfig.color,
            icon: modelConfig.icon
          });
        } catch (error) {
          console.error(`Erreur avec le modèle ${model}:`, error);
          // Ajouter un résultat d'erreur
          const modelConfig = MODEL_CONFIG[model];
          results.push({
            model,
            modelName: modelConfig.name,
            displayName: modelConfig.displayName,
            prediction: 'At Risk',
            confidence: 0,
            responseTime: Date.now() - startTime,
            color: modelConfig.color,
            icon: modelConfig.icon
          });
        }
      }

      // Calculer le consensus
      const consensus = calculateConsensus(results);
      const stats = calculateComparisonStats(results);

      // Créer le résultat
      this.result = {
        timestamp: new Date(),
        babyName: this.formData.baby_name,
        models: results,
        consensus: consensus.consensus,
        consensusConfidence: consensus.confidence,
        averageResponseTime: stats.avgConfidence,
        healthyCount: consensus.healthyCount,
        atRiskCount: consensus.atRiskCount
      };

      // Analyser les facteurs de risque
      this.analyzeRiskFactors();

      // Générer les recommandations
      this.generateRecommendations();

      // 🔥 Sauvegarder dans Firebase
      this.saveToFirebase();

      // Changer l'état
      this.predictionState = 'success';

      // Faire défiler vers les résultats
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({
          behavior: 'smooth'
        });
      }, 100);

    } catch (error) {
      console.error('Erreur lors de la prédiction:', error);
      this.predictionState = 'error';
    }
  }

  // Préparer les données pour l'API
  private prepareApiData(): any {
    return {
      gender: this.formData.gender,
      gestational_age_weeks: this.formData.gestational_age_weeks,
      birth_weight_kg: this.formData.birth_weight_kg,
      birth_length_cm: this.formData.birth_length_cm,
      birth_head_circumference_cm: this.formData.birth_head_circumference_cm,
      age_days: this.formData.age_days,
      weight_kg: this.formData.weight_kg,
      length_cm: this.formData.length_cm,
      head_circumference_cm: this.formData.head_circumference_cm,
      temperature_c: this.formData.temperature_c,
      heart_rate_bpm: this.formData.heart_rate_bpm,
      respiratory_rate_bpm: this.formData.respiratory_rate_bpm,
      oxygen_saturation: this.formData.oxygen_saturation,
      feeding_type: this.formData.feeding_type,
      feeding_frequency_per_day: this.formData.feeding_frequency_per_day,
      urine_output_count: this.formData.urine_output_count,
      stool_count: this.formData.stool_count,
      jaundice_level_mg_dl: this.formData.jaundice_level_mg_dl,
      apgar_score: this.formData.apgar_score,
      immunizations_done: this.formData.immunizations_done,
      reflexes_normal: this.formData.reflexes_normal
    };
  }

  // Analyser les facteurs de risque
  private analyzeRiskFactors() {
    this.riskFactors = [];

    // Température
    if (this.formData.temperature_c < 36.5 || this.formData.temperature_c > 37.5) {
      this.riskFactors.push({
        category: 'Signes Vitaux',
        field: 'Température',
        value: this.formData.temperature_c,
        severity: this.formData.temperature_c < 36 || this.formData.temperature_c > 38 ? 'high' : 'medium',
        message: 'Température en dehors de la normale',
        icon: 'bi-thermometer',
        color: '#E74C3C'
      });
    }

    // Fréquence cardiaque
    if (this.formData.heart_rate_bpm < 120 || this.formData.heart_rate_bpm > 160) {
      this.riskFactors.push({
        category: 'Signes Vitaux',
        field: 'Fréquence cardiaque',
        value: this.formData.heart_rate_bpm,
        severity: 'medium',
        message: 'Fréquence cardiaque anormale',
        icon: 'bi-heart-pulse',
        color: '#E74C3C'
      });
    }

    // Saturation en oxygène
    if (this.formData.oxygen_saturation < 95) {
      this.riskFactors.push({
        category: 'Signes Vitaux',
        field: 'Saturation O2',
        value: this.formData.oxygen_saturation,
        severity: this.formData.oxygen_saturation < 90 ? 'high' : 'medium',
        message: 'Saturation en oxygène basse',
        icon: 'bi-droplet',
        color: '#E74C3C'
      });
    }

    // Jaunisse
    if (this.formData.jaundice_level_mg_dl > 10) {
      this.riskFactors.push({
        category: 'Observations',
        field: 'Jaunisse',
        value: this.formData.jaundice_level_mg_dl,
        severity: this.formData.jaundice_level_mg_dl > 15 ? 'high' : 'medium',
        message: 'Niveau de jaunisse élevé',
        icon: 'bi-exclamation-triangle',
        color: '#F5A623'
      });
    }

    // Réflexes
    if (this.formData.reflexes_normal === 'No') {
      this.riskFactors.push({
        category: 'Observations',
        field: 'Réflexes',
        value: 'Anormaux',
        severity: 'high',
        message: 'Réflexes anormaux détectés',
        icon: 'bi-activity',
        color: '#E74C3C'
      });
    }
  }

  // Générer les recommandations
  private generateRecommendations() {
    this.recommendations = [];

    if (!this.result) return;

    if (this.result.consensus === 'At Risk') {
      this.recommendations.push({
        priority: 'urgent',
        title: 'Consultation médicale urgente',
        description: 'Le système a détecté des signes préoccupants. Consultez un pédiatre immédiatement.',
        icon: 'bi-hospital',
        color: '#E74C3C'
      });
    }

    if (this.riskFactors.length > 0) {
      this.recommendations.push({
        priority: 'high',
        title: 'Surveillance rapprochée',
        description: `${this.riskFactors.length} facteur(s) de risque détecté(s). Surveillez attentivement les signes vitaux.`,
        icon: 'bi-eye',
        color: '#F5A623'
      });
    }

    if (this.formData.immunizations_done === 'No') {
      this.recommendations.push({
        priority: 'medium',
        title: 'Vaccinations en attente',
        description: 'Assurez-vous que le calendrier vaccinal est à jour.',
        icon: 'bi-shield-check',
        color: '#4A90E2'
      });
    }

    if (this.result.consensus === 'Healthy' && this.riskFactors.length === 0) {
      this.recommendations.push({
        priority: 'low',
        title: 'Suivi régulier',
        description: 'Continuez les consultations de routine et le suivi habituel.',
        icon: 'bi-check-circle',
        color: '#5FCF80'
      });
    }
  }

  // Obtenir le label d'un champ
  getFieldLabel(field: string): string {
    const rule = this.validationRules.find(r => r.field === field);
    return rule?.label || field;
  }

  // Obtenir l'unité d'un champ
  getFieldUnit(field: string): string {
    const rule = this.validationRules.find(r => r.field === field);
    return rule?.unit || '';
  }

  // 🔥 Sauvegarder dans Firebase
  private saveToFirebase() {
    if (!this.result) return;

    const historyEntry = {
      timestamp: this.result.timestamp,
      babyName: this.formData.baby_name,
      babyGender: this.formData.gender,
      babyAge: this.formData.age_days,
      modelsUsed: Array.from(this.selectedModels),
      consensus: this.result.consensus,
      consensusConfidence: this.result.consensusConfidence,
      healthyCount: this.result.healthyCount,
      atRiskCount: this.result.atRiskCount,
      avgResponseTime: this.result.averageResponseTime,
      riskFactorsCount: this.riskFactors.length,
      notes: this.riskFactors.length > 0
        ? `${this.riskFactors.length} facteur(s) de risque détecté(s)`
        : undefined
    };

    this.firebaseHistory.addEntry(historyEntry).subscribe({
      next: (id) => {
        console.log('✅ Prédiction sauvegardée dans Firebase, ID:', id);
      },
      error: (error) => {
        console.error('❌ Erreur sauvegarde Firebase:', error);
        // Ne pas bloquer l'utilisateur si la sauvegarde échoue
      }
    });
  }

  // Naviguer vers l'historique
  saveToHistory() {
    // TODO: Implémenter la sauvegarde dans l'historique
    this.router.navigate(['/history']);
  }

  // Nouvelle prédiction
  newPrediction() {
    this.resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
