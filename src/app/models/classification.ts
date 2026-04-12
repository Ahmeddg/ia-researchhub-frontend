import { Publication } from './publication';

export interface CategoryPrediction {
  category: string;
  confidence: number;
  reason: string;
}

export interface ClassifyResponse {
  publicationId: number;
  clusterId: number;
  clusterLabel: string;
  confidence: number;
  categories: CategoryPrediction[];
  keywords: string[];
  suggestedClusterId?: number;
  suggestedClusterLabel?: string;
}

export interface PublicationWithClassification {
  publication: Publication;
  classification: ClassifyResponse | null;
}
