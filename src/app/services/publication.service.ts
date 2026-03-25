import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publication } from '../models/publication';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private apiUrl = `${environment.apiUrl}/publications`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Publication[]> { return this.http.get<Publication[]>(this.apiUrl); }
  getById(id: number): Observable<Publication> { return this.http.get<Publication>(`${this.apiUrl}/${id}`); }
  create(data: Publication): Observable<Publication> { return this.http.post<Publication>(this.apiUrl, data); }
  update(id: number, data: Publication): Observable<Publication> { return this.http.put<Publication>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
