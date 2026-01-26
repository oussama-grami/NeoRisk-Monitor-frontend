import {MLModel} from './baby-health.model';

export interface ModelCard {
  model: MLModel;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  accuracy: number;
  predictions: number;
  avgResponseTime: number;
}
