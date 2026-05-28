export interface ResearcherRoleRequest {
  id: number;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  affiliation: string;
  biography?: string;
  motivation?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewedById?: number;
  reviewedByUsername?: string;
}
