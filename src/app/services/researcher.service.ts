import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Researcher } from '../models/researcher';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResearcherService {
  private apiUrl = `${environment.apiUrl}/researchers`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Researcher[]> { return this.http.get<Researcher[]>(this.apiUrl); }
  getById(id: number): Observable<Researcher> { return this.http.get<Researcher>(`${this.apiUrl}/${id}`); }
  create(data: Researcher): Observable<Researcher> { return this.http.post<Researcher>(this.apiUrl, data); }
  update(id: number, data: Researcher): Observable<Researcher> { return this.http.put<Researcher>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
