import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { UserResponse } from '../../../models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  userProfile = signal<UserResponse | null>(null);
  editMode = signal<boolean>(false);
  
  // For editing
  editData = {
    email: '',
    password: ''
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.http.get<UserResponse>(`${environment.apiUrl}/users/me`).subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
        this.editData.email = profile.email;
      },
      error: (err) => console.error('Error loading profile', err)
    });
  }

  toggleEdit(): void {
    this.editMode.update(val => !val);
  }

  updateProfile(): void {
    const updatePayload: any = { email: this.editData.email };
    if (this.editData.password) {
      updatePayload.password = this.editData.password;
    }

    this.http.put<UserResponse>(`${environment.apiUrl}/users/me`, updatePayload).subscribe({
      next: (updatedProfile) => {
        this.userProfile.set(updatedProfile);
        this.editMode.set(false);
        this.editData.password = '';
        // Optionally update auth user in localStorage if needed, but the /me endpoint is the source of truth here.
      },
      error: (err) => console.error('Error updating profile', err)
    });
  }
}
