import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Domain } from '../models/domain';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  private apiUrl = `${environment.apiUrl}/domains`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Domain[]> { return this.http.get<Domain[]>(this.apiUrl); }
  getById(id: number): Observable<Domain> { return this.http.get<Domain>(`${this.apiUrl}/${id}`); }
  create(data: Domain): Observable<Domain> { return this.http.post<Domain>(this.apiUrl, data); }
  update(id: number, data: Domain): Observable<Domain> { return this.http.put<Domain>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
