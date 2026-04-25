import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.apiUrl}/auth`;
  
  currentUser = signal<AuthResponse | null>(this.getStoredUser());

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.saveUser(response))
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_user');
    }
    this.currentUser.set(null);
  }

  private saveUser(response: AuthResponse) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_user', JSON.stringify(response));
    }
    this.currentUser.set(response);
  }

  private getStoredUser(): AuthResponse | null {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('auth_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  getToken(): string | null {
    return this.currentUser()?.token || null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return !!user && user.roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isModerator(): boolean {
    return this.hasRole('ROLE_MODERATOR') || this.isAdmin();
  }

  isResearcher(): boolean {
    return this.hasRole('ROLE_RESEARCHER');
  }

  isAdminOrModerator(): boolean {
    return this.isAdmin() || this.isModerator();
  }

  canManageProject(projectOwnerId?: number): boolean {
    if (this.isAdmin() || this.isModerator()) return true;
    const user = this.currentUser();
    return !!user && this.isResearcher() && user.id === projectOwnerId;
  }

  canManageContent(): boolean {
    return this.isAdmin() || this.isModerator();
  }

  canManageResearchers(): boolean {
    return this.isAdmin() || this.isModerator();
  }
}
