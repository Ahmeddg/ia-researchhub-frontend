import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { DomainService } from '../../../services/domain.service';
import { NotificationService } from '../../../services/notification.service';
import { Domain } from '../../../models/domain';
import { DomainFormComponent } from '../domain-form/domain-form.component';

@Component({
  selector: 'app-domain-list',
  standalone: true,
  imports: [CommonModule, DomainFormComponent],
  templateUrl: './domain-list.component.html',
  styleUrl: './domain-list.component.css'
})
export class DomainListComponent implements OnInit {
  private domainService = inject(DomainService);
  private notificationService = inject(NotificationService);
  public authService = inject(AuthService);

  domains = signal<Domain[]>([]);
  selectedDomain = signal<Domain | null>(null);
  isEditMode = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDomains();
  }

  loadDomains(): void {
    this.domainService.getAll().subscribe({
      next: (data) => {
        this.domains.set(data);
      },
      error: (err) => {
        console.error('Error loading domains', err);
        this.notificationService.error('Failed to load domains');
      }
    });
  }

  openAddDomainModal(): void {
    if (!this.authService.isAdminOrModerator()) {
      this.notificationService.error('You do not have permission to add domains');
      return;
    }
    this.selectedDomain.set(null);
    this.isEditMode.set(false);
  }

  editDomain(domain: Domain): void {
    if (!this.authService.isAdminOrModerator()) {
      this.notificationService.error('You do not have permission to edit domains');
      return;
    }
    if (!domain.id) {
      this.notificationService.error('Invalid domain');
      return;
    }
    this.selectedDomain.set({ ...domain });
    this.isEditMode.set(true);
  }

  deleteDomain(id: number): void {
    if (!this.authService.isAdminOrModerator()) {
      this.notificationService.error('You do not have permission to delete domains');
      return;
    }

    const domain = this.domains().find(d => d.id === id);
    if (confirm(`Are you sure you want to delete "${domain?.name}"?`)) {
      this.domainService.delete(id).subscribe({
        next: () => {
          this.notificationService.success(`Domain "${domain?.name}" deleted successfully`);
          this.loadDomains();
        },
        error: (err) => {
          console.error('Error deleting domain', err);
          this.notificationService.error('Failed to delete domain');
        }
      });
    }
  }

  onSaveSuccess(): void {
    this.loadDomains();
    this.selectedDomain.set(null);
    this.isEditMode.set(false);
    const closeBtn = document.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
    if (closeBtn) closeBtn.click();
    this.notificationService.success('Domain saved successfully');
  }
}
