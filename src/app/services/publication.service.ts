import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publication } from '../models/publication';
import { PublicationWithClassification } from '../models/classification';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private apiUrl = `${environment.apiUrl}/publications`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Publication[]> { return this.http.get<Publication[]>(this.apiUrl); }
  getById(id: number): Observable<Publication> { return this.http.get<Publication>(`${this.apiUrl}/${id}`); }

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
}
