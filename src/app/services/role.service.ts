import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Role[]> { return this.http.get<Role[]>(this.apiUrl); }
  getById(id: number): Observable<Role> { return this.http.get<Role>(`${this.apiUrl}/${id}`); }
  create(data: Role): Observable<Role> { return this.http.post<Role>(this.apiUrl, data); }
  update(id: number, data: Role): Observable<Role> { return this.http.put<Role>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
