import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../services/role.service';
import { UserService } from '../../../services/user.service';
import { Role } from '../../../models/role';
import { User } from '../../../models/user';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.css'
})
export class RoleListComponent implements OnInit {
  private roleService = inject(RoleService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  roles = signal<Role[]>([]);
  users = signal<User[]>([]);
  
  newRoleName = signal<string>('');
  selectedUser = signal<User | null>(null);
  selectedUserRoles = signal<string[]>([]);

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (data) => this.roles.set(data),
      error: (err) => this.notificationService.error('Failed to load roles')
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => this.notificationService.error('Failed to load users for role management')
    });
  }

  addRole(): void {
    const roleName = this.newRoleName().trim().toUpperCase();
    if (!roleName) return;
    
    const formattedName = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`;
    this.roleService.create({ name: formattedName }).subscribe({
      next: () => {
        this.notificationService.success(`Role ${formattedName} created successfully`);
        this.loadRoles();
        this.newRoleName.set('');
      },
      error: (err) => this.notificationService.error('Error creating role. It might already exist.')
    });
  }

  deleteRole(id: number): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.delete(id).subscribe({
        next: () => {
          this.notificationService.success('Role deleted successfully');
          this.loadRoles();
        },
        error: (err) => this.notificationService.error('Error deleting role')
      });
    }
  }

  selectUser(user: User): void {
    this.selectedUser.set(user);
    if (user.roles) {
      this.selectedUserRoles.set([...user.roles]);
    } else {
      this.selectedUserRoles.set([]);
    }
  }

  toggleUserRole(roleName: string): void {
    const currentRoles = [...this.selectedUserRoles()];
    if (currentRoles.includes(roleName)) {
      this.selectedUserRoles.set(currentRoles.filter(r => r !== roleName));
    } else {
      this.selectedUserRoles.set([...currentRoles, roleName]);
    }
  }

  saveUserRoles(): void {
    const user = this.selectedUser();
    if (!user || user.id === undefined) return;

    this.userService.assignRoles(user.id, this.selectedUserRoles()).subscribe({
      next: () => {
        this.notificationService.success(`Roles updated for ${user.username}`);
        this.loadUsers();
        this.selectedUser.set(null);
      },
      error: (err) => {
        console.error('Error assigning roles', err);
        this.notificationService.error('Failed to update user roles');
      }
    });
  }
}
