import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-join-us-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './join-us-modal.component.html',
  styleUrl: './join-us-modal.component.css'
})
export class JoinUsModalComponent {
  @Input() title = 'Join us to see more';
  @Input() message = 'Sign in or create an account to unlock the full content and community features.';
  @Input() imageUrl = 'https://images.unsplash.com/photo-1766297248160-87aca6fa59ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
  @Input() showClose = false;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.showClose && (event.target as HTMLElement).classList.contains('join-modal-backdrop')) {
      this.onClose();
    }
  }
}