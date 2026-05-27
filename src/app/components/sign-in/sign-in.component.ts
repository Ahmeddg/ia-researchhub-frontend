import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  submitted = false;

  loginForm: FormGroup = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.valid) {
      const loginData = {
        username: this.loginForm.value.identifier,
        password: this.loginForm.value.password
      };
      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.notificationService.success(`Welcome back, ${response.username}!`);
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Login failed. Please check your credentials.');
        }
      });
    }
  }
}
