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

export interface RecommendationResponse {
  publicationId: number;
  similarityScore: number;
  clusterId?: number;
}

export interface HealthResponse {
  status: string;
  modelLoaded: boolean;
}

export interface ClusterInfo {
  clusterId: number;
  label: string;
  memberCount: number;
}

export interface ClusterDetail {
  clusterId: number;
  label: string;
  memberCount: number;
  publicationIds: number[];
}

export interface ReclusterResponse {
  totalPublications: number;
  clustersFound: number;
  noisePoints: number;
}

export interface ClosePair {
  publication1Id: number;
  publication2Id: number;
  similarityScore: number;
}
