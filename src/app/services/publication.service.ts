import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publication } from '../models/publication';
import {
  PublicationWithClassification,
  RecommendationResponse,
  HealthResponse,
  ClusterInfo,
  ClusterDetail,
  ReclusterResponse,
  ClosePair
} from '../models/classification';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private apiUrl = `${environment.apiUrl}/publications`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Publication[]> { return this.http.get<Publication[]>(this.apiUrl); }
  getById(id: number): Observable<Publication> { return this.http.get<Publication>(`${this.apiUrl}/${id}`); }
  findByDomainId(domainId: number): Observable<Publication[]> { return this.http.get<Publication[]>(`${this.apiUrl}/domain/${domainId}`); }

  getPersonalized(): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${this.apiUrl}/personalized`);
  }

  getNew(): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${this.apiUrl}/new`);
  }

  getTop(): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${this.apiUrl}/top`);
  }

  getHot(): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${this.apiUrl}/hot`);
  }

  /**
   * Creates a publication as DRAFT and returns the combined result
   * (saved publication with real ID + AI classification from Python service).
   */
  create(data: Publication): Observable<PublicationWithClassification> {
    return this.http.post<PublicationWithClassification>(this.apiUrl, data);
  }

  /**
   * Confirms a DRAFT publication with the user-approved AI metadata.
   * Transitions status to PUBLISHED.
   */
  confirm(id: number, aiCategories: string, aiKeywords: string, aiConfidence: number | null): Observable<Publication> {
    return this.http.put<Publication>(`${this.apiUrl}/${id}/confirm`, {
      aiCategories,
      aiKeywords,
      aiConfidence
    });
  }
  update(id: number, data: Publication): Observable<Publication> { return this.http.put<Publication>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }

  getRecommendations(id: number, mode: 'global' | 'cluster' = 'global', limit = 5): Observable<RecommendationResponse[]> {
    return this.http.get<RecommendationResponse[]>(`${this.apiUrl}/${id}/recommendations?mode=${mode}&limit=${limit}`);
  }

  getAiHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${environment.apiUrl}/ai/health`);
  }

  getAiClusters(): Observable<ClusterInfo[]> {
    return this.http.get<ClusterInfo[]>(`${environment.apiUrl}/ai/clusters`);
  }

  getAiClusterDetail(clusterId: number): Observable<ClusterDetail> {
    return this.http.get<ClusterDetail>(`${environment.apiUrl}/ai/clusters/${clusterId}`);
  }

  triggerRecluster(): Observable<ReclusterResponse> {
    return this.http.post<ReclusterResponse>(`${environment.apiUrl}/ai/recluster`, {});
  }

  getClosePairs(threshold = 0.9): Observable<ClosePair[]> {
    return this.http.get<ClosePair[]>(`${environment.apiUrl}/ai/close-pairs?threshold=${threshold}`);
  }

  upvote(id: number): Observable<Publication> {
    return this.http.post<Publication>(`${this.apiUrl}/${id}/upvote`, {});
  }

  downvote(id: number): Observable<Publication> {
    return this.http.post<Publication>(`${this.apiUrl}/${id}/downvote`, {});
  }
}
