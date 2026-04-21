import { Domain } from './domain';
import { Researcher } from './researcher';

export interface Publication {
  id?: number;
  title: string;
  abstractText: string;
  publicationDate: string;
  pdfUrl: string;
  doi: string;
  journal?: string;
  imageUrl?: string;
  domain?: Domain;
  researchers?: Researcher[];

  status?: string;
  clusterId?: number;
  clusterLabel?: string;
  suggestedClusterId?: number;
  suggestedClusterLabel?: string;
  aiCategories?: string;
  aiKeywords?: string;
  aiConfidence?: number;
  upvotes?: number;
  downvotes?: number;
  similarityScore?: number;
  upvotedByUser?: boolean;
}
