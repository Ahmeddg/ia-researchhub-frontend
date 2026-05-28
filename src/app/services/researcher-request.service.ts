import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResearcherRoleRequest } from '../models/researcher-request';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResearcherRequestService {
  private apiUrl = `${environment.apiUrl}/researcher-requests`;

  constructor(private http: HttpClient) {}

  getPending(): Observable<ResearcherRoleRequest[]> {
    return this.http.get<ResearcherRoleRequest[]>(`${this.apiUrl}/pending`);
  }

  approve(id: number): Observable<ResearcherRoleRequest> {
    return this.http.post<ResearcherRoleRequest>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<ResearcherRoleRequest> {
    return this.http.post<ResearcherRoleRequest>(`${this.apiUrl}/${id}/reject`, {});
  }
}
