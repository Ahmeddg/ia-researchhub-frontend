import { Component, OnInit, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { JoinUsModalComponent } from '../../shared/join-us-modal/join-us-modal.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectFormComponent, JoinUsModalComponent],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  projects = signal<Project[]>([]);
  selectedProject = signal<Project | null>(null);
  isEditMode = signal<boolean>(false);
  readonly joinUsImage = 'https://images.unsplash.com/photo-1766297248160-87aca6fa59ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

  canSeeProjects(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects.set(data);
      },
      error: (err) => {
        console.error('Error loading projects', err);
        this.notificationService.error('Failed to load projects');
      }
    });
  }

  deleteProject(project: Project): void {
    if (!project.id) return;
    
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      this.projectService.delete(project.id).subscribe({
        next: () => {
          this.notificationService.success(`Project "${project.title}" deleted successfully`);
          this.loadProjects();
        },
        error: (err) => {
          console.error('Error deleting project', err);
          this.notificationService.error('Failed to delete project. Make sure you have the right permissions.');
        }
      });
    }
  }

  editProject(project: Project): void {
    this.selectedProject.set(project);
    this.isEditMode.set(true);
  }

  closeEditModal(): void {
    this.selectedProject.set(null);
    this.isEditMode.set(false);
  }

  onSaveSuccess(): void {
    this.loadProjects();
    this.closeEditModal();
    const closeBtn = document.getElementById('closeAddProjectModal');
    if (closeBtn) closeBtn.click();
    this.notificationService.success('Project saved successfully');
  }

  canManageProject(project: Project): boolean {
    return this.authService.canManageProject(project.createdBy?.id);
  }
}
