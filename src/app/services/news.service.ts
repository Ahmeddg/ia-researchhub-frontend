import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { News } from '../models/news';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<News[]> { return this.http.get<News[]>(this.apiUrl); }
  getById(id: number): Observable<News> { return this.http.get<News>(`${this.apiUrl}/${id}`); }
  create(data: News): Observable<News> { return this.http.post<News>(this.apiUrl, data); }
  update(id: number, data: News): Observable<News> { return this.http.put<News>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
