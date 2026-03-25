import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ProjectFormComponent],
  templateUrl: './project-list.component.html',
  styles: ``
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  constructor(private projectService: ProjectService) { }

  ngOnInit(): void { this.loadProjects(); }

  loadProjects(): void {
    this.projectService.getAll().subscribe(data => this.projects = data);
  }

  onSaveSuccess(): void {
    this.loadProjects();
    const closeBtn = document.getElementById('closeAddProjectModal');
    if (closeBtn) closeBtn.click();
  }
}
