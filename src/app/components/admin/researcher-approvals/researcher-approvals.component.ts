import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResearcherRoleRequest } from '../../../models/researcher-request';
import { ResearcherRequestService } from '../../../services/researcher-request.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-researcher-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './researcher-approvals.component.html',
  styleUrl: './researcher-approvals.component.css'
})
export class ResearcherApprovalsComponent implements OnInit {
  private requestService = inject(ResearcherRequestService);
  private notificationService = inject(NotificationService);

  pendingRequests = signal<ResearcherRoleRequest[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.loading.set(true);
    this.requestService.getPending().subscribe({
      next: (requests) => {
        this.pendingRequests.set(requests);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Failed to load pending researcher requests.');
      }
    });
  }

  approve(id: number): void {
    this.requestService.approve(id).subscribe({
      next: () => {
        this.notificationService.success('Request approved successfully.');
        this.loadPendingRequests();
      },
      error: () => this.notificationService.error('Failed to approve request.')
    });
  }

  reject(id: number): void {
    this.requestService.reject(id).subscribe({
      next: () => {
        this.notificationService.success('Request rejected successfully.');
        this.loadPendingRequests();
      },
      error: () => this.notificationService.error('Failed to reject request.')
    });
  }
}
