export interface DashboardStatistics {
  totalResearchers: number;
  totalPublications: number;
  totalProjects: number;
  totalDomains: number;
  totalNews: number;
  totalUsers: number;
  publicationsByDomain: Record<string, number>;
  projectsByCategory: Record<string, number>;
}
