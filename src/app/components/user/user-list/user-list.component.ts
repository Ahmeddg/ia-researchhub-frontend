import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styles: ``
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  users = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  
  // Form model for create/edit
  userForm: User = { username: '', email: '', password: '', enabled: true };
  isEditMode = signal<boolean>(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => this.notificationService.error('Failed to load users')
    });
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.userForm = { username: '', email: '', password: '', enabled: true };
  }

  openEditModal(user: User): void {
    this.isEditMode.set(true);
    this.selectedUser.set(user);
    // Clone to avoid direct binding
    this.userForm = { ...user, password: '' }; 
  }

  saveUser(): void {
    if (this.isEditMode()) {
      if (this.selectedUser()?.id) {
        this.userService.update(this.selectedUser()!.id!, this.userForm).subscribe({
          next: () => {
            this.notificationService.success('User updated successfully');
            this.loadUsers();
            this.closeModal('userModal');
          },
          error: (err) => {
            console.error('Error updating user', err);
            this.notificationService.error('Failed to update user. Please check your inputs.');
          }
        });
      }
    } else {
      this.userService.create(this.userForm).subscribe({
        next: () => {
          this.notificationService.success('User created successfully');
          this.loadUsers();
          this.closeModal('userModal');
        },
        error: (err) => {
          console.error('Error creating user', err);
          this.notificationService.error('Failed to create user. Username or email might already exist.');
        }
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.notificationService.success('User deleted successfully');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user', err);
          this.notificationService.error('Failed to delete user');
        }
      });
    }
  }

  private closeModal(modalId: string): void {
    const closeBtn = document.getElementById(`close-${modalId}`);
    if (closeBtn) closeBtn.click();
  }
}
