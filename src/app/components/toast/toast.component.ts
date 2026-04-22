import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 9999">
      <div *ngFor="let toast of notificationService.toasts()" 
           [class]="'toast show align-items-center text-white border-0 mb-2 ' + getBgClass(toast.type)" 
           role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i [class]="getIcon(toast.type) + ' me-2'"></i>
            {{ toast.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                  (click)="notificationService.remove(toast.id)" aria-label="Close"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      min-width: 250px;
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);

  getBgClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-danger';
      default: return 'bg-info';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      default: return 'fas fa-info-circle';
    }
  }
}
