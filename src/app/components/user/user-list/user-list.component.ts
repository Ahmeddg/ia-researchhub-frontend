import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserFormComponent],
  templateUrl: './user-list.component.html',
  styles: ``
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  constructor(private userService: UserService) { }

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.userService.getAll().subscribe(data => this.users = data);
  }

  onSaveSuccess(): void {
    this.loadUsers();
    const closeBtn = document.getElementById('closeAddUserModal');
    if (closeBtn) closeBtn.click();
  }
}
