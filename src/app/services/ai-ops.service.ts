import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  HealthResponse,
  ClusterInfo,
  ClusterMetrics,
  ClusterDetail,
  ReclusterResponse,
  ReclusterHistoryEntry,
  ClosePair,
  SystemConfig,
  TaxonomyTreeResponse,
} from '../models/classification';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiOpsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/ai`;

  // ── Section 1: Health ────────────────────────────────────────────────────

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.base}/health`).pipe(
      catchError(() => of({ status: 'DOWN', model_loaded: false }))
    );
  }

  // ── Section 1.2: HDBSCAN run log ────────────────────────────────────────

  getReclusterHistory(limit = 10): Observable<ReclusterHistoryEntry[]> {
    return this.http
      .get<ReclusterHistoryEntry[]>(`${this.base}/recluster/history`, {
        params: new HttpParams().set('limit', limit),
      })
      .pipe(catchError(() => of([])));
  }

  // ── Section 2: Clusters ──────────────────────────────────────────────────

  getClusters(): Observable<ClusterInfo[]> {
    return this.http
      .get<any[]>(`${this.base}/clusters`)
      .pipe(
        map(list =>
          list.map(c => ({
            cluster_id: c.cluster_id ?? c.id ?? c.clusterId,
            label: c.label ?? '',
            member_count: c.member_count ?? c.count ?? c.memberCount ?? 0,
          }))
        ),
        catchError(() => of([]))
      );
  }

  getClusterMetrics(): Observable<ClusterMetrics[]> {
    return this.http
      .get<ClusterMetrics[]>(`${this.base}/clusters/metrics`)
      .pipe(catchError(() => of([])));
  }

  getClusterDetail(id: number): Observable<ClusterDetail | null> {
    return this.http
      .get<ClusterDetail>(`${this.base}/clusters/${id}`)
      .pipe(catchError(() => of(null)));
  }

  // ── Section 2.1: Recluster ───────────────────────────────────────────────

  triggerRecluster(): Observable<ReclusterResponse> {
    return this.http
      .post<ReclusterResponse>(`${this.base}/recluster`, {})
      .pipe(catchError(() => of({ total_publications: 0, clusters_found: 0, noise_points: 0 })));
  }

  // ── Section 2.4: Close Pairs ─────────────────────────────────────────────

  getClosePairs(threshold = 0.9): Observable<ClosePair[]> {
    return this.http
      .get<any[]>(`${this.base}/close-pairs`, {
        params: new HttpParams().set('threshold', threshold),
      })
      .pipe(
        map(list =>
          list.map(p => ({
            publication_1_id: p.publication_1_id ?? p.publication1Id,
            publication_2_id: p.publication_2_id ?? p.publication2Id,
            similarity_score: p.similarity_score ?? p.similarityScore,
          }))
        ),
        catchError(() => of([]))
      );
  }
  // ── Section 5: Corrections ───────────────────────────────────────────────

  getCorrections(page = 0, pageSize = 20): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.base}/corrections`, {
        params: new HttpParams().set('page', page).set('pageSize', pageSize)
      })
      .pipe(catchError(() => of([])));
  }

  submitCorrection(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/corrections`, payload);
  }

  // ── Section 6: Configuration ─────────────────────────────────────────────

  getSystemConfig(): Observable<SystemConfig> {
    return this.http.get<SystemConfig>(`${this.base}/config`);
  }

  updateSystemConfig(key: string, value: string): Observable<any> {
    return this.http.put<any>(`${this.base}/config`, { key, value });
  }

  getTaxonomy(): Observable<TaxonomyTreeResponse> {
    return this.http.get<TaxonomyTreeResponse>(`${this.base}/taxonomy`);
  }
}
