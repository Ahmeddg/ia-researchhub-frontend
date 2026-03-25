import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent {
  user: User = { username: '', email: '', password: '', enabled: true };

  @Output() saveSuccess = new EventEmitter<void>();

  constructor(private userService: UserService) { }

  onSubmit() {
    this.userService.create(this.user).subscribe({
      next: () => {
        this.saveSuccess.emit();
        this.user = { username: '', email: '', password: '', enabled: true };
      },
      error: (err) => console.error('Error creating user', err)
    });
  }
}
