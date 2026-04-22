import { Component, Output, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResearcherService } from '../../../services/researcher.service';
import { Researcher } from '../../../models/researcher';

@Component({
  selector: 'app-researcher-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './researcher-form.component.html',
  styleUrl: './researcher-form.component.css'
})
export class ResearcherFormComponent implements OnInit, OnChanges {
  private researcherService = inject(ResearcherService);

  @Input() researcher: Researcher | null = null;
  @Input() isEditMode: boolean = false;
  @Output() saveSuccess = new EventEmitter<void>();

  formModel: Researcher = { fullName: '', email: '', affiliation: '', biography: '' };
  isSubmitting = false;

  ngOnInit(): void {
    this.syncFormWithInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['researcher'] || changes['isEditMode']) {
      this.syncFormWithInputs();
    }
  }

  private syncFormWithInputs(): void {
    if (this.researcher && this.isEditMode) {
      this.formModel = { ...this.researcher };
      return;
    }

    this.formModel = { fullName: '', email: '', affiliation: '', biography: '' };
  }

  onSubmit() {
    if (!this.formModel.fullName.trim() || !this.formModel.email.trim()) {
      console.error('Name and email are required');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.researcher?.id) {
      this.researcherService.update(this.researcher.id, this.formModel).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.saveSuccess.emit();
          this.resetForm();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error updating researcher', err);
        }
      });
    } else {
      this.researcherService.create(this.formModel).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.saveSuccess.emit();
          this.resetForm();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error creating researcher', err);
        }
      });
    }
  }

  resetForm() {
    this.formModel = { fullName: '', email: '', affiliation: '', biography: '' };
  }
}
