import { Component, Output, EventEmitter } from '@angular/core';
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
export class ResearcherFormComponent {
  researcher: Researcher = { fullName: '', email: '', affiliation: '', biography: '' };

  @Output() saveSuccess = new EventEmitter<void>();

  constructor(private researcherService: ResearcherService) { }

  onSubmit() {
    this.researcherService.create(this.researcher).subscribe({
      next: () => {
        this.saveSuccess.emit();
        this.researcher = { fullName: '', email: '', affiliation: '', biography: '' };
      },
      error: (err) => console.error('Error creating researcher', err)
    });
  }
}
