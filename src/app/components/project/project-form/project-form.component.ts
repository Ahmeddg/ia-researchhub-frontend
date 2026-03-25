import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css'
})
export class ProjectFormComponent {
  project: Project = { title: '', description: '', aiCategory: '' };

  @Output() saveSuccess = new EventEmitter<void>();

  constructor(private projectService: ProjectService) { }

  onSubmit() {
    this.projectService.create(this.project).subscribe({
      next: () => {
        this.saveSuccess.emit();
        this.project = { title: '', description: '', aiCategory: '' };
      },
      error: (err) => console.error('Error creating project', err)
    });
  }
}
