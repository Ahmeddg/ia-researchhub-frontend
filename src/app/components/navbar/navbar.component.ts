import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ResearcherRequestService } from '../../services/researcher-request.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styles: ``
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private researcherRequestService = inject(ResearcherRequestService);

  adminPendingCount = signal<number>(0);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user && this.authService.isAdmin()) {
        this.loadPendingApprovalsCount();
      } else {
        this.adminPendingCount.set(0);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }

  canAccessAiOps(): boolean {
    return this.authService.isAdmin() || this.authService.isModerator();
  }

  private loadPendingApprovalsCount(): void {
    this.researcherRequestService.getPending().subscribe({
      next: (requests) => this.adminPendingCount.set(requests.length),
      error: () => this.adminPendingCount.set(0)
    });
  }
}
