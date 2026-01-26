// Interface pour les données du formulaire de prédiction
export interface PredictionFormData {
  // Informations générales
  baby_name?: string;
  gender: 'Male' | 'Female';

  // Données de naissance
  gestational_age_weeks: number;
  birth_weight_kg: number;
  birth_length_cm: number;
  birth_head_circumference_cm: number;
  apgar_score: number;

  // Données actuelles
  age_days: number;
  weight_kg: number;
  length_cm: number;
  head_circumference_cm: number;

  // Signes vitaux
  temperature_c: number;
  heart_rate_bpm: number;
  respiratory_rate_bpm: number;
  oxygen_saturation: number;

  // Alimentation
  feeding_type: 'Breastfeeding' | 'Formula' | 'Mixed';
  feeding_frequency_per_day: number;

  // Élimination
  urine_output_count: number;
  stool_count: number;

  // Observations médicales
  jaundice_level_mg_dl: number;
  immunizations_done: 'Yes' | 'No';
  reflexes_normal: 'Yes' | 'No';
}

// Valeurs par défaut pour le formulaire
export const DEFAULT_FORM_VALUES: PredictionFormData = {
  baby_name: '',
  gender: 'Female',
  gestational_age_weeks: 40,
  birth_weight_kg: 3.3,
  birth_length_cm: 50,
  birth_head_circumference_cm: 32,
  apgar_score: 9,
  age_days: 5,
  weight_kg: 3.4,
  length_cm: 50.5,
  head_circumference_cm: 32.1,
  temperature_c: 37.0,
  heart_rate_bpm: 140,
  respiratory_rate_bpm: 40,
  oxygen_saturation: 98,
  feeding_type: 'Breastfeeding',
  feeding_frequency_per_day: 8,
  urine_output_count: 6,
  stool_count: 3,
  jaundice_level_mg_dl: 3.0,
  immunizations_done: 'Yes',
  reflexes_normal: 'Yes'
};

// Règles de validation
export interface ValidationRule {
  field: keyof PredictionFormData;
  min: number;
  max: number;
  label: string;
  unit: string;
}

export const VALIDATION_RULES: ValidationRule[] = [
  { field: 'gestational_age_weeks', min: 24, max: 44, label: 'Âge gestationnel', unit: 'semaines' },
  { field: 'birth_weight_kg', min: 0.5, max: 6, label: 'Poids de naissance', unit: 'kg' },
  { field: 'birth_length_cm', min: 30, max: 65, label: 'Taille de naissance', unit: 'cm' },
  { field: 'birth_head_circumference_cm', min: 25, max: 40, label: 'Périmètre crânien naissance', unit: 'cm' },
  { field: 'apgar_score', min: 0, max: 10, label: 'Score APGAR', unit: '' },
  { field: 'age_days', min: 0, max: 365, label: 'Âge', unit: 'jours' },
  { field: 'weight_kg', min: 0.5, max: 15, label: 'Poids actuel', unit: 'kg' },
  { field: 'length_cm', min: 30, max: 100, label: 'Taille actuelle', unit: 'cm' },
  { field: 'head_circumference_cm', min: 25, max: 50, label: 'Périmètre crânien actuel', unit: 'cm' },
  { field: 'temperature_c', min: 35, max: 42, label: 'Température', unit: '°C' },
  { field: 'heart_rate_bpm', min: 80, max: 200, label: 'Fréquence cardiaque', unit: 'bpm' },
  { field: 'respiratory_rate_bpm', min: 20, max: 80, label: 'Fréquence respiratoire', unit: 'bpm' },
  { field: 'oxygen_saturation', min: 80, max: 100, label: 'Saturation en oxygène', unit: '%' },
  { field: 'feeding_frequency_per_day', min: 1, max: 20, label: 'Fréquence alimentation', unit: 'fois/jour' },
  { field: 'urine_output_count', min: 0, max: 20, label: 'Nombre de mictions', unit: '' },
  { field: 'stool_count', min: 0, max: 15, label: 'Nombre de selles', unit: '' },
  { field: 'jaundice_level_mg_dl', min: 0, max: 25, label: 'Niveau de jaunisse', unit: 'mg/dL' }
];

// Groupes de champs pour l'organisation du formulaire
export interface FormFieldGroup {
  title: string;
  icon: string;
  fields: string[];
  color: string;
}

export const FORM_FIELD_GROUPS: FormFieldGroup[] = [
  {
    title: 'Informations Générales',
    icon: 'bi-info-circle',
    fields: ['baby_name', 'gender'],
    color: '#4A90E2'
  },
  {
    title: 'Données de Naissance',
    icon: 'bi-calendar-heart',
    fields: ['gestational_age_weeks', 'birth_weight_kg', 'birth_length_cm', 'birth_head_circumference_cm', 'apgar_score'],
    color: '#667eea'
  },
  {
    title: 'Données Actuelles',
    icon: 'bi-person-badge',
    fields: ['age_days', 'weight_kg', 'length_cm', 'head_circumference_cm'],
    color: '#f5576c'
  },
  {
    title: 'Signes Vitaux',
    icon: 'bi-heart-pulse',
    fields: ['temperature_c', 'heart_rate_bpm', 'respiratory_rate_bpm', 'oxygen_saturation'],
    color: '#E74C3C'
  },
  {
    title: 'Alimentation',
    icon: 'bi-cup-straw',
    fields: ['feeding_type', 'feeding_frequency_per_day'],
    color: '#5FCF80'
  },
  {
    title: 'Élimination',
    icon: 'bi-droplet',
    fields: ['urine_output_count', 'stool_count'],
    color: '#00f2fe'
  },
  {
    title: 'Observations Médicales',
    icon: 'bi-clipboard2-pulse',
    fields: ['jaundice_level_mg_dl', 'immunizations_done', 'reflexes_normal'],
    color: '#F5A623'
  }
];
