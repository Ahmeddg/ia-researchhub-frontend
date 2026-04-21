import { Component, Output, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomainService } from '../../../services/domain.service';
import { NotificationService } from '../../../services/notification.service';
import { Domain } from '../../../models/domain';

@Component({
  selector: 'app-domain-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './domain-form.component.html',
  styleUrl: './domain-form.component.css'
})
export class DomainFormComponent implements OnInit, OnChanges {
  private domainService = inject(DomainService);
  private notificationService = inject(NotificationService);

  @Input() domain: Domain | null = null;
  @Input() isEditMode: boolean = false;
  @Output() saveSuccess = new EventEmitter<void>();

  formDomain: Domain = { name: '', description: '' };
  isSubmitting: boolean = false;

  ngOnInit(): void {
    if (this.domain && this.isEditMode) {
      this.formDomain = { ...this.domain };
    } else {
      this.formDomain = { name: '', description: '' };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When parent passes a domain for editing, update the local form model
    if (changes['domain'] && this.domain && this.isEditMode) {
      this.formDomain = { ...this.domain };
    }

    // If isEditMode becomes true and a domain is present, ensure form is populated
    if (changes['isEditMode'] && changes['isEditMode'].currentValue === true && this.domain) {
      this.formDomain = { ...this.domain };
    }
  }

  onSubmit(): void {
    if (!this.formDomain.name.trim() || !this.formDomain.description.trim()) {
      this.notificationService.error('Please fill in all fields');
      return;
    }

    this.isSubmitting = true;

    const cleanedDomain: Domain = {
      name: this.formDomain.name.trim(),
      description: this.formDomain.description.trim()
    };

    if (this.isEditMode && this.domain?.id) {
      // Edit mode
      this.domainService.update(this.domain.id, cleanedDomain).subscribe({
        next: () => {
          this.notificationService.success('Domain updated successfully');
          this.isSubmitting = false;
          this.saveSuccess.emit();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error updating domain', err);
          this.isSubmitting = false;
          if (err.status === 409) {
            this.notificationService.error('A domain with this name already exists');
          } else {
            this.notificationService.error('Failed to update domain');
          }
        }
      });
    } else {
      // Create mode
      this.domainService.create(cleanedDomain).subscribe({
        next: () => {
          this.notificationService.success('Domain created successfully');
          this.isSubmitting = false;
          this.saveSuccess.emit();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error creating domain', err);
          this.isSubmitting = false;
          if (err.status === 409) {
            this.notificationService.error('A domain with this name already exists');
          } else {
            this.notificationService.error('Failed to create domain');
          }
        }
      });
    }
  }

  resetForm(): void {
    this.formDomain = { name: '', description: '' };
  }
}
