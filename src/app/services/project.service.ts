import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Project[]> { return this.http.get<Project[]>(this.apiUrl); }
  getById(id: number): Observable<Project> { return this.http.get<Project>(`${this.apiUrl}/${id}`); }
  create(data: Project): Observable<Project> { return this.http.post<Project>(this.apiUrl, data); }
  update(id: number, data: Project): Observable<Project> { return this.http.put<Project>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
