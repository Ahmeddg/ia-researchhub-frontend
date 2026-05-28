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

// ── Health ──────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  pending_count?: number;
  last_run_at?: string;
  ollama_reachable?: boolean;
  embedding_model?: string;
}

// ── Clusters ─────────────────────────────────────────────────────────────────

export interface ClusterInfo {
  cluster_id: number;
  label: string;
  member_count: number;
}

export interface ClusterDetail {
  cluster_id: number;
  label: string;
  member_count: number;
  publication_ids: number[];
}

export interface ClusterMetrics {
  cluster_id: number;
  intra_cluster_mean_similarity?: number;
  member_count?: number;
  correction_rate_30d?: number;
  pending_inflow_rate?: number;
  centroid_drift?: number;
  last_label_updated_at?: string;
  exemplar_coverage?: number;
  computed_at?: string;
  l1_label?: string;
  l2_label?: string;
}

// ── Recluster ─────────────────────────────────────────────────────────────────

export interface ReclusterResponse {
  total_publications: number;
  clusters_found: number;
  noise_points: number;
  duration_seconds?: number;
  id_matches_reused?: number;
  new_clusters?: number;
  pending_before?: number;
  pending_after?: number;
  // legacy camelCase from Spring Boot stub (keep for backwards compat)
  totalPublications?: number;
  clustersFound?: number;
  noisePoints?: number;
}

export interface ReclusterHistoryEntry {
  id: number;
  started_at: string;
  finished_at: string;
  duration_seconds?: number;
  total_publications?: number;
  clusters_before?: number;
  clusters_after?: number;
  new_clusters?: number;
  id_matches_reused?: number;
  noise_points?: number;
  pending_before?: number;
  pending_after?: number;
}

// ── Close Pairs ───────────────────────────────────────────────────────────────

export interface ClosePair {
  publication1Id?: number;
  publication2Id?: number;
  publication_1_id?: number;
  publication_2_id?: number;
  similarityScore?: number;
  similarity_score?: number;
}

// ── Cluster state for smart trigger ──────────────────────────────────────────

export interface ClusteringState {
  last_run_at?: string;
  last_publication_count?: number;
  pending_count?: number;
}
